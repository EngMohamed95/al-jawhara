import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import './index.css';

/* ── Status config ── */
const STATUS_CONFIG = {
  pending:    { ar: 'قيد الانتظار',  en: 'Pending',    color: '#f59e0b' },
  confirmed:  { ar: 'مؤكد',          en: 'Confirmed',  color: '#3b82f6' },
  processing: { ar: 'قيد المعالجة',  en: 'Processing', color: '#f97316' },
  shipped:    { ar: 'تم الشحن',      en: 'Shipped',    color: '#8b5cf6' },
  delivered:  { ar: 'تم التسليم',    en: 'Delivered',  color: '#16a34a' },
  cancelled:  { ar: 'ملغي',          en: 'Cancelled',  color: '#ef4444' },
};

/* ── Toast ── */
const Toast = ({ message, type, onClose }) => (
  <div className={`ma-toast ma-toast--${type}`} role="alert">
    <i className={`fas fa-${type === 'success' ? 'circle-check' : 'circle-exclamation'}`} aria-hidden="true" />
    <span>{message}</span>
    <button className="ma-toast-close" onClick={onClose} aria-label="إغلاق">
      <i className="fas fa-xmark" aria-hidden="true" />
    </button>
  </div>
);

/* ── Order Row ── */
const OrderRow = ({ order, lang }) => {
  const [open, setOpen] = useState(false);
  const status = STATUS_CONFIG[order.status] || { ar: order.status, en: order.status, color: '#64748b' };

  return (
    <div className="ma-order-card">
      <button
        className="ma-order-header"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <div className="ma-order-ref">
          <i className="fas fa-receipt" aria-hidden="true" />
          <span>{order.ref || `#${order.id}`}</span>
        </div>
        <div className="ma-order-meta">
          <span className="ma-order-date">
            <i className="fas fa-calendar-days" aria-hidden="true" />
            {order.date}
          </span>
          <span
            className="ma-status-badge"
            style={{ background: status.color + '20', color: status.color, borderColor: status.color + '40' }}
          >
            {lang === 'ar' ? status.ar : status.en}
          </span>
          <span className="ma-order-total">
            {order.total}
            <span className="ma-currency">{lang === 'ar' ? ' د.ك' : ' KWD'}</span>
          </span>
        </div>
        <i className={`fas fa-chevron-${open ? 'up' : 'down'} ma-order-chevron`} aria-hidden="true" />
      </button>

      {open && (
        <div className="ma-order-body">
          <table className="ma-items-table">
            <thead>
              <tr>
                <th>{lang === 'ar' ? 'المنتج' : 'Product'}</th>
                <th>{lang === 'ar' ? 'الكمية' : 'Qty'}</th>
                <th>{lang === 'ar' ? 'السعر' : 'Price'}</th>
              </tr>
            </thead>
            <tbody>
              {(order.items || []).map((item, i) => (
                <tr key={i}>
                  <td>{item.name}</td>
                  <td className="ma-items-qty">{item.qty}</td>
                  <td className="ma-items-price">
                    {(item.price * item.qty).toFixed(3)}
                    <span className="ma-currency">{lang === 'ar' ? ' د.ك' : ' KWD'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════
   Main Component
══════════════════════════════════════════ */
const MyAccount = () => {
  const { auth, orders, updateUser } = useApp();
  const { lang }                     = useLanguage();
  const navigate                     = useNavigate();

  /* redirect if not logged in or is admin/staff */
  useEffect(() => {
    if (!auth) navigate('/login', { replace: true });
    else if (auth.role !== 'customer') navigate('/dashboard', { replace: true });
  }, [auth, navigate]);

  /* ── Tab state ── */
  const [activeTab, setActiveTab] = useState('profile');

  /* ── Toast state ── */
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  /* ── Profile form ── */
  const [profileForm, setProfileForm] = useState({
    name:  auth?.name  || '',
    phone: auth?.phone || '',
    email: auth?.email || '',
  });
  const [profileLoading, setProfileLoading] = useState(false);

  const handleProfileChange = (e) =>
    setProfileForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      /* get full record (includes password) so we don't lose it */
      const matches = await api.findUser(auth.username);
      const existing = matches.find(u => u.username === auth.username);
      if (!existing) throw new Error('not found');

      /* updateUser from AppContext calls api + updates users state */
      const updated = await updateUser(auth.id, {
        ...existing,
        name:  profileForm.name,
        phone: profileForm.phone,
        email: profileForm.email,
      });

      /* keep localStorage auth in sync */
      const { password: _, ...safe } = updated;
      localStorage.setItem('jawhara_auth', JSON.stringify(safe));

      showToast(lang === 'ar' ? 'تم حفظ البيانات بنجاح' : 'Profile saved successfully');
    } catch {
      showToast(lang === 'ar' ? 'حدث خطأ أثناء الحفظ' : 'Error saving profile', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  /* ── Orders ── */
  const myOrders = orders
    .filter(o => o.phone?.replace(/\D/g, '') === auth?.phone?.replace(/\D/g, ''))
    .sort((a, b) => {
      /* sort newest first — try ISO date first, fall back to string compare */
      const da = a.createdAt ? new Date(a.createdAt) : new Date(a.date);
      const db = b.createdAt ? new Date(b.createdAt) : new Date(b.date);
      return isNaN(db - da) ? b.id - a.id : db - da;
    });

  /* ── Password form ── */
  const [pwForm, setPwForm]     = useState({ current: '', newPw: '', confirm: '' });
  const [pwShow, setPwShow]     = useState({ current: false, newPw: false, confirm: false });
  const [pwError, setPwError]   = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  const handlePwChange = (e) =>
    setPwForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const togglePwShow = (field) =>
    setPwShow(p => ({ ...p, [field]: !p[field] }));

  const handlePwSubmit = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');

    if (pwForm.newPw.length < 4) {
      setPwError(lang === 'ar' ? 'كلمة المرور الجديدة يجب أن تكون 4 أحرف على الأقل' : 'New password must be at least 4 characters');
      return;
    }
    if (pwForm.newPw !== pwForm.confirm) {
      setPwError(lang === 'ar' ? 'كلمة المرور الجديدة وتأكيدها غير متطابقتين' : 'New passwords do not match');
      return;
    }

    setPwLoading(true);
    try {
      const users = await api.findUser(auth.username);
      const user  = users.find(u => u.username === auth.username && u.password === pwForm.current);
      if (!user) {
        setPwError(lang === 'ar' ? 'كلمة المرور الحالية غير صحيحة' : 'Current password is incorrect');
        return;
      }
      await api.updateUser(auth.id, { ...user, password: pwForm.newPw });
      setPwForm({ current: '', newPw: '', confirm: '' });
      setPwSuccess(lang === 'ar' ? 'تم تغيير كلمة المرور بنجاح' : 'Password changed successfully');
    } catch {
      setPwError(lang === 'ar' ? 'حدث خطأ، حاول مجدداً' : 'An error occurred, please try again');
    } finally {
      setPwLoading(false);
    }
  };

  /* ── Tabs config ── */
  const TABS = [
    { key: 'profile',  icon: 'fa-user',         ar: 'حسابي',        en: 'My Profile' },
    { key: 'orders',   icon: 'fa-bag-shopping',  ar: 'طلباتي',       en: 'My Orders' },
    { key: 'password', icon: 'fa-lock',          ar: 'كلمة المرور',  en: 'Change Password' },
  ];

  if (!auth) return null;

  return (
    <div className="ma-page">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <div className="ma-container">

        {/* ── Sidebar ── */}
        <aside className="ma-sidebar">
          <div className="ma-avatar-card">
            <div className="ma-avatar">
              <i className="fas fa-user" aria-hidden="true" />
            </div>
            <div className="ma-user-name">{auth.name || auth.username}</div>
            <div className="ma-user-username">@{auth.username}</div>
            <span className="ma-role-badge">
              <i className="fas fa-star" aria-hidden="true" />
              {lang === 'ar' ? 'عميل' : 'Customer'}
            </span>
          </div>

          <nav className="ma-tab-nav" aria-label={lang === 'ar' ? 'قائمة الحساب' : 'Account menu'}>
            {TABS.map(tab => (
              <button
                key={tab.key}
                className={`ma-tab-btn${activeTab === tab.key ? ' ma-tab-btn--active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
                aria-current={activeTab === tab.key ? 'page' : undefined}
              >
                <i className={`fas ${tab.icon}`} aria-hidden="true" />
                <span>{lang === 'ar' ? tab.ar : tab.en}</span>
                {tab.key === 'orders' && myOrders.length > 0 && (
                  <span className="ma-tab-count">{myOrders.length}</span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* ── Main content ── */}
        <main className="ma-content">

          {/* ══ Tab 1: Profile ══ */}
          {activeTab === 'profile' && (
            <section className="ma-section">
              <div className="ma-section-header">
                <i className="fas fa-user-pen" aria-hidden="true" />
                <div>
                  <h2>{lang === 'ar' ? 'بيانات الحساب' : 'Account Details'}</h2>
                  <p>{lang === 'ar' ? 'قم بتحديث معلوماتك الشخصية' : 'Update your personal information'}</p>
                </div>
              </div>

              <form className="ma-form" onSubmit={handleProfileSave} noValidate>
                <div className="ma-form-row">
                  <div className="ma-form-group">
                    <label className="ma-label" htmlFor="ma-name">
                      <i className="fas fa-user" aria-hidden="true" />
                      {lang === 'ar' ? 'الاسم' : 'Name'}
                    </label>
                    <input
                      id="ma-name"
                      className="ma-input"
                      type="text"
                      name="name"
                      value={profileForm.name}
                      onChange={handleProfileChange}
                      placeholder={lang === 'ar' ? 'الاسم الكامل' : 'Full name'}
                    />
                  </div>

                  <div className="ma-form-group">
                    <label className="ma-label" htmlFor="ma-phone">
                      <i className="fas fa-phone" aria-hidden="true" />
                      {lang === 'ar' ? 'الهاتف' : 'Phone'}
                    </label>
                    <input
                      id="ma-phone"
                      className="ma-input"
                      type="tel"
                      name="phone"
                      value={profileForm.phone}
                      onChange={handleProfileChange}
                      placeholder="XXXXXXXX"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="ma-form-group">
                  <label className="ma-label" htmlFor="ma-email">
                    <i className="fas fa-envelope" aria-hidden="true" />
                    {lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  </label>
                  <input
                    id="ma-email"
                    className="ma-input"
                    type="email"
                    name="email"
                    value={profileForm.email}
                    onChange={handleProfileChange}
                    placeholder="example@email.com"
                    dir="ltr"
                  />
                </div>

                <div className="ma-form-actions">
                  <button
                    type="submit"
                    className="ma-btn ma-btn--primary"
                    disabled={profileLoading}
                  >
                    {profileLoading
                      ? <><i className="fas fa-spinner fa-spin" aria-hidden="true" /> {lang === 'ar' ? 'جاري الحفظ...' : 'Saving...'}</>
                      : <><i className="fas fa-floppy-disk" aria-hidden="true" /> {lang === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}</>
                    }
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* ══ Tab 2: Orders ══ */}
          {activeTab === 'orders' && (
            <section className="ma-section">
              <div className="ma-section-header">
                <i className="fas fa-bag-shopping" aria-hidden="true" />
                <div>
                  <h2>{lang === 'ar' ? 'طلباتي' : 'My Orders'}</h2>
                  <p>
                    {lang === 'ar'
                      ? `${myOrders.length} طلب مسجل`
                      : `${myOrders.length} order(s) found`}
                  </p>
                </div>
              </div>

              {myOrders.length === 0 ? (
                <div className="ma-empty">
                  <i className="fas fa-box-open" aria-hidden="true" />
                  <h3>{lang === 'ar' ? 'لا توجد طلبات بعد' : 'No orders yet'}</h3>
                  <p>{lang === 'ar' ? 'لم تقم بأي طلب حتى الآن' : 'You have not placed any orders yet'}</p>
                </div>
              ) : (
                <div className="ma-orders-list">
                  {myOrders.map(order => (
                    <OrderRow key={order.id} order={order} lang={lang} />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ══ Tab 3: Password ══ */}
          {activeTab === 'password' && (
            <section className="ma-section">
              <div className="ma-section-header">
                <i className="fas fa-lock" aria-hidden="true" />
                <div>
                  <h2>{lang === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}</h2>
                  <p>{lang === 'ar' ? 'اختر كلمة مرور قوية وآمنة' : 'Choose a strong and secure password'}</p>
                </div>
              </div>

              {pwError && (
                <div className="ma-alert ma-alert--error">
                  <i className="fas fa-triangle-exclamation" aria-hidden="true" />
                  {pwError}
                </div>
              )}
              {pwSuccess && (
                <div className="ma-alert ma-alert--success">
                  <i className="fas fa-circle-check" aria-hidden="true" />
                  {pwSuccess}
                </div>
              )}

              <form className="ma-form" onSubmit={handlePwSubmit} noValidate>
                {[
                  { key: 'current', ar: 'كلمة المرور الحالية',  en: 'Current Password' },
                  { key: 'newPw',   ar: 'كلمة المرور الجديدة',  en: 'New Password' },
                  { key: 'confirm', ar: 'تأكيد كلمة المرور',    en: 'Confirm Password' },
                ].map(field => (
                  <div className="ma-form-group" key={field.key}>
                    <label className="ma-label" htmlFor={`ma-pw-${field.key}`}>
                      <i className="fas fa-key" aria-hidden="true" />
                      {lang === 'ar' ? field.ar : field.en}
                    </label>
                    <div className="ma-input-wrap">
                      <input
                        id={`ma-pw-${field.key}`}
                        className="ma-input ma-input--padded-end"
                        type={pwShow[field.key] ? 'text' : 'password'}
                        name={field.key}
                        value={pwForm[field.key]}
                        onChange={handlePwChange}
                        placeholder="••••••••"
                        dir="ltr"
                        autoComplete={field.key === 'current' ? 'current-password' : 'new-password'}
                        required
                      />
                      <button
                        type="button"
                        className="ma-pw-toggle"
                        onClick={() => togglePwShow(field.key)}
                        aria-label={pwShow[field.key] ? 'إخفاء' : 'إظهار'}
                      >
                        <i className={`fas fa-eye${pwShow[field.key] ? '-slash' : ''}`} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="ma-form-actions">
                  <button
                    type="submit"
                    className="ma-btn ma-btn--primary"
                    disabled={pwLoading}
                  >
                    {pwLoading
                      ? <><i className="fas fa-spinner fa-spin" aria-hidden="true" /> {lang === 'ar' ? 'جاري التحديث...' : 'Updating...'}</>
                      : <><i className="fas fa-shield-halved" aria-hidden="true" /> {lang === 'ar' ? 'تحديث كلمة المرور' : 'Update Password'}</>
                    }
                  </button>
                </div>
              </form>
            </section>
          )}

        </main>
      </div>
    </div>
  );
};

export default MyAccount;
