import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import translations from '../../translations';
import Seo from '../../components/Seo';
import './index.css';

/* ── Constants ── */
const categoryLabels = {
  facial: 'مناديل وجه', rolls: 'رولات', pocket: 'محارم جيب',
  towels: 'مناشف', napkins: 'مناديل مائدة', family: 'عروض عائلة',
};
const orderStatusLabels  = { active: 'نشط', pending: 'قيد المراجعة', inactive: 'متوقف', shipped: 'تم الشحن', cancelled: 'ملغي' };
const productStatusLabels= { active: 'نشط', pending: 'قيد المراجعة', inactive: 'متوقف' };
const roleLabels         = { admin: 'مدير', editor: 'محرر', viewer: 'مشاهد' };
const userStatusLabels   = { active: 'نشط', suspended: 'موقوف', pending: 'قيد المراجعة', locked: 'مقفل' };

const ROLE_PERMISSIONS = {
  admin:  { products: true,  orders: true,  users: true,  content: true,  reports: true,  shipping: true,  payments: true,  coupons: true  },
  editor: { products: true,  orders: true,  users: false, content: true,  reports: true,  shipping: false, payments: false, coupons: true  },
  viewer: { products: false, orders: true,  users: false, content: false, reports: true,  shipping: false, payments: false, coupons: false },
};

const emptyProduct = { name: '', category: 'facial', price: '', stock: '', status: 'active', icon: '📦', desc: '', badge: '' };
const emptyUser    = { username: '', password: '', name: '', email: '', phone: '', role: 'viewer', status: 'active' };
const emptyCoupon  = { code: '', type: 'percent', value: '', minOrder: '', maxUses: '', expiry: '', status: 'active', desc: '' };

const navItems = [
  { id: 'overview',  label: 'نظرة عامة',        icon: 'fa-chart-pie' },
  { id: 'products',  label: 'المنتجات',          icon: 'fa-box' },
  { id: 'orders',    label: 'الطلبات',           icon: 'fa-list-check' },
  { id: 'users',     label: 'المستخدمون',        icon: 'fa-users-gear' },
  { id: 'content',   label: 'محتوى الموقع',      icon: 'fa-pen-nib' },
  { id: 'shipping',  label: 'الشحن والتوصيل',   icon: 'fa-truck' },
  { id: 'payments',  label: 'بوابات الدفع',      icon: 'fa-credit-card' },
  { id: 'coupons',   label: 'الكوبونات',         icon: 'fa-tag' },
  { id: 'reports',   label: 'التقارير',          icon: 'fa-chart-bar' },
];

/* ── Password Strength ── */
const calcStrength = (pwd) => {
  if (!pwd) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pwd.length >= 8)              score++;
  if (/[A-Z]/.test(pwd))            score++;
  if (/[0-9]/.test(pwd))            score++;
  if (/[^A-Za-z0-9]/.test(pwd))    score++;
  const map = [
    { label: '',        color: '' },
    { label: 'ضعيفة',   color: '#ef4444' },
    { label: 'متوسطة',  color: '#f59e0b' },
    { label: 'جيدة',    color: '#3b82f6' },
    { label: 'قوية',    color: '#16a34a' },
  ];
  return { score, ...map[score] };
};

/* ── Shared components ── */
const AlertSuccess = ({ msg }) => (
  <div className="alert alert-success" role="status">
    <i className="fas fa-circle-check" aria-hidden="true"></i> {msg}
  </div>
);
const AlertError = ({ msg }) => (
  <div className="alert alert-error" role="alert">
    <i className="fas fa-triangle-exclamation" aria-hidden="true"></i> {msg}
  </div>
);

/* ════════════════════════════════════════════════════ */
const Dashboard = () => {
  const {
    products, orders, users, coupons, siteContent,
    loading, error, auth,
    addProduct, updateProduct, deleteProduct,
    addUser, updateUser, deleteUser,
    addCoupon, updateCoupon, deleteCoupon,
    updateOrderStatus,
    saveSiteContent,
  } = useApp();

  const myRole = auth?.role || 'viewer';
  const perms  = ROLE_PERMISSIONS[myRole] || ROLE_PERMISSIONS.viewer;

  const [view, setView] = useState('overview');

  /* ── Product modal ── */
  const [productModal, setProductModal] = useState(null);
  const [editProduct,  setEditProduct]  = useState(null);
  const [productForm,  setProductForm]  = useState(emptyProduct);
  const [productSaved, setProductSaved] = useState(false);
  const [productErr,   setProductErr]   = useState('');

  const openAddProduct  = () => { setProductForm(emptyProduct); setProductErr(''); setProductSaved(false); setProductModal('add'); };
  const openEditProduct = (p) => {
    setProductForm({ name: p.name, category: p.category, price: p.price, stock: p.stock, status: p.status, icon: p.icon || '📦', desc: p.desc || '', badge: p.badge || '' });
    setEditProduct(p); setProductErr(''); setProductSaved(false); setProductModal('edit');
  };
  const closeProductModal = () => { setProductModal(null); setEditProduct(null); };

  const handleProductSave = async (e) => {
    e.preventDefault(); setProductErr('');
    const data = { ...productForm, price: parseFloat(productForm.price), stock: parseInt(productForm.stock), specs: [], badge: productForm.badge || null };
    try {
      if (productModal === 'add') await addProduct(data);
      else await updateProduct(editProduct.id, { ...editProduct, ...data });
      setProductSaved(true); setTimeout(closeProductModal, 900);
    } catch { setProductErr('حدث خطأ أثناء الحفظ.'); }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    try { await deleteProduct(id); } catch { alert('تعذر الحذف.'); }
  };

  /* ── User modal ── */
  const [userModal, setUserModal] = useState(null);
  const [editUser,  setEditUser]  = useState(null);
  const [userForm,  setUserForm]  = useState(emptyUser);
  const [userSaved, setUserSaved] = useState(false);
  const [userErr,   setUserErr]   = useState('');
  const [showPwd,   setShowPwd]   = useState(false);
  const [showPerms, setShowPerms] = useState(false);

  const pwdStrength = useMemo(() => calcStrength(userForm.password), [userForm.password]);

  const validateUser = () => {
    if (!userForm.name.trim())     return 'الاسم الكامل مطلوب';
    if (!userForm.username.trim()) return 'اسم المستخدم مطلوب';
    if (!/^[a-zA-Z0-9_]+$/.test(userForm.username)) return 'اسم المستخدم: أحرف وأرقام وشرطة سفلية فقط';
    if (userModal === 'add') {
      if (!userForm.password)          return 'كلمة المرور مطلوبة';
      if (userForm.password.length < 8) return 'كلمة المرور 8 أحرف على الأقل';
      if (pwdStrength.score < 2)        return 'كلمة المرور ضعيفة جداً';
    }
    if (userForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userForm.email)) return 'البريد الإلكتروني غير صحيح';
    if (userForm.phone && !/^(\+965|00965|965)?[569]\d{7}$/.test(userForm.phone.replace(/\s/g,''))) return 'رقم الهاتف غير صحيح (يجب أن يكون كويتياً)';
    return null;
  };

  const openAddUser  = () => { setUserForm(emptyUser); setUserErr(''); setUserSaved(false); setShowPwd(false); setShowPerms(false); setUserModal('add'); };
  const openEditUser = (u) => {
    setUserForm({ username: u.username, password: '', name: u.name, email: u.email || '', phone: u.phone || '', role: u.role || 'viewer', status: u.status || 'active' });
    setEditUser(u); setUserErr(''); setUserSaved(false); setShowPwd(false); setShowPerms(false); setUserModal('edit');
  };
  const closeUserModal = () => { setUserModal(null); setEditUser(null); };

  const handleUserSave = async (e) => {
    e.preventDefault(); setUserErr('');
    const errMsg = validateUser();
    if (errMsg) { setUserErr(errMsg); return; }
    try {
      const data = { ...userForm };
      if (userModal === 'edit' && !data.password) delete data.password;
      if (userModal === 'add') await addUser(data);
      else await updateUser(editUser.id, { ...editUser, ...data });
      setUserSaved(true); setTimeout(closeUserModal, 900);
    } catch { setUserErr('حدث خطأ أثناء الحفظ.'); }
  };

  const handleDeleteUser = async (u) => {
    if (u.id === auth?.id) { alert('لا يمكن حذف حسابك الخاص.'); return; }
    if (!window.confirm(`هل أنت متأكد من حذف "${u.name}"؟`)) return;
    try { await deleteUser(u.id); } catch { alert('تعذر الحذف.'); }
  };

  /* ── Coupon modal ── */
  const [couponModal, setCouponModal] = useState(null);
  const [editCoupon,  setEditCoupon]  = useState(null);
  const [couponForm,  setCouponForm]  = useState(emptyCoupon);
  const [couponSaved, setCouponSaved] = useState(false);
  const [couponErr,   setCouponErr]   = useState('');

  const openAddCoupon  = () => { setCouponForm(emptyCoupon); setCouponErr(''); setCouponSaved(false); setCouponModal('add'); };
  const openEditCoupon = (c) => {
    setCouponForm({ code: c.code, type: c.type, value: c.value, minOrder: c.minOrder || '', maxUses: c.maxUses || '', expiry: c.expiry || '', status: c.status || 'active', desc: c.desc || '' });
    setEditCoupon(c); setCouponErr(''); setCouponSaved(false); setCouponModal('edit');
  };
  const closeCouponModal = () => { setCouponModal(null); setEditCoupon(null); };

  const handleCouponSave = async (e) => {
    e.preventDefault(); setCouponErr('');
    if (!couponForm.code.trim()) { setCouponErr('كود الكوبون مطلوب'); return; }
    if (!couponForm.value)       { setCouponErr('قيمة الخصم مطلوبة'); return; }
    const data = { ...couponForm, value: parseFloat(couponForm.value), minOrder: parseFloat(couponForm.minOrder) || 0, maxUses: parseInt(couponForm.maxUses) || 0, usedCount: editCoupon?.usedCount || 0 };
    try {
      if (couponModal === 'add') await addCoupon(data);
      else await updateCoupon(editCoupon.id, { ...editCoupon, ...data });
      setCouponSaved(true); setTimeout(closeCouponModal, 900);
    } catch { setCouponErr('حدث خطأ أثناء الحفظ.'); }
  };

  /* ── Site Content ── */
  const [contentForm,    setContentForm]    = useState(null);
  const [contentSaved,   setContentSaved]   = useState(false);
  const [contentErr,     setContentErr]     = useState('');
  const [contentLoading, setContentLoading] = useState(false);

  const openContentTab = () => {
    if (!contentForm && siteContent) setContentForm({ ...siteContent });
    setView('content');
  };
  const handleContentSave = async (e) => {
    e.preventDefault(); setContentErr(''); setContentLoading(true);
    try {
      await saveSiteContent(contentForm);
      setContentSaved(true); setTimeout(() => setContentSaved(false), 3000);
    } catch { setContentErr('حدث خطأ أثناء الحفظ.'); }
    finally { setContentLoading(false); }
  };

  /* ── Shipping tab (local edits then save via siteContent) ── */
  const [shippingZones, setShippingZones] = useState(null);
  const [shippingSaved, setShippingSaved] = useState(false);

  const openShippingTab = () => {
    if (!shippingZones && siteContent?.shippingZones)
      setShippingZones(JSON.parse(JSON.stringify(siteContent.shippingZones)));
    else if (!shippingZones)
      setShippingZones(translations.kuwaitZones.map(z => ({ ...z, enabled: true })));
    setView('shipping');
  };

  const updateZoneFee     = (id, fee)     => setShippingZones(z => z.map(x => x.id === id ? { ...x, fee: parseFloat(fee) || 0 } : x));
  const toggleZone        = (id)          => setShippingZones(z => z.map(x => x.id === id ? { ...x, enabled: !x.enabled } : x));

  const saveShipping = async () => {
    try {
      await saveSiteContent({ ...siteContent, shippingZones });
      setShippingSaved(true); setTimeout(() => setShippingSaved(false), 2500);
    } catch { alert('حدث خطأ أثناء الحفظ.'); }
  };

  /* ── Payments tab ── */
  const [paySettings, setPaySettings] = useState(null);
  const [paySaved,    setPaySaved]    = useState(false);

  const openPaymentsTab = () => {
    if (!paySettings) {
      const defaults = { cash: { enabled: true }, transfer: { enabled: true, bankName: '', iban: '' }, knet: { enabled: true, apiKey: '', testMode: true }, myfatoorah: { enabled: false, apiKey: '', testMode: true }, tap: { enabled: false, apiKey: '', testMode: true }, stcpay: { enabled: false }, zaincash: { enabled: false }, benefitpay: { enabled: false } };
      setPaySettings(siteContent?.paymentSettings ? JSON.parse(JSON.stringify(siteContent.paymentSettings)) : defaults);
    }
    setView('payments');
  };

  const toggleGateway  = (key)        => setPaySettings(p => ({ ...p, [key]: { ...p[key], enabled: !p[key].enabled } }));
  const setGatewayField= (key, f, v)  => setPaySettings(p => ({ ...p, [key]: { ...p[key], [f]: v } }));

  const savePayments = async () => {
    try {
      await saveSiteContent({ ...siteContent, paymentSettings: paySettings });
      setPaySaved(true); setTimeout(() => setPaySaved(false), 2500);
    } catch { alert('حدث خطأ أثناء الحفظ.'); }
  };

  /* ── Derived stats ── */
  const activeCount    = products.filter(p => p.status === 'active').length;
  const totalStock     = products.reduce((s, p) => s + (p.stock || 0), 0).toLocaleString();
  const pendingOrders  = orders.filter(o => o.status === 'pending').length;
  const totalRevenue   = orders.reduce((s, o) => s + parseFloat(o.grandTotal || o.total || 0), 0).toFixed(3);

  if (loading) return (
    <div className="dashboard-layout">
      <div className="dashboard-main">
        <div className="dash-loading">
          <i className="fas fa-spinner fa-spin" aria-hidden="true"></i>
          <span>جاري تحميل البيانات...</span>
        </div>
      </div>
    </div>
  );

  /* ══════════════════ RENDER ══════════════════ */
  return (
    <>
      <Seo noIndex />

      <div className="dashboard-layout">

        {/* ── Sidebar ── */}
        <aside className="dashboard-sidebar" aria-label="القائمة الجانبية">
          <div className="sidebar-header">
            <div className="sidebar-logo-icon"><i className="fas fa-gem" aria-hidden="true"></i></div>
            <div>
              <div className="sidebar-header-title">لوحة التحكم</div>
              <div className="sidebar-header-sub">{auth?.name || 'Admin'}</div>
            </div>
          </div>
          <div className="sidebar-role-badge">
            <i className="fas fa-shield-halved" aria-hidden="true"></i>
            {roleLabels[myRole] || myRole}
          </div>

          <div className="sidebar-title">القائمة الرئيسية</div>
          {navItems.map(item => {
            const blocked = item.id !== 'overview' && !perms[item.id];
            return (
              <button
                key={item.id}
                className={`sidebar-nav-item${view === item.id ? ' active' : ''}${blocked ? ' disabled' : ''}`}
                onClick={() => {
                  if (blocked) return;
                  if (item.id === 'content')   openContentTab();
                  else if (item.id === 'shipping') openShippingTab();
                  else if (item.id === 'payments') openPaymentsTab();
                  else setView(item.id);
                }}
                aria-current={view === item.id ? 'page' : undefined}
                title={blocked ? 'ليس لديك صلاحية' : undefined}
              >
                <i className={`fas ${item.icon}`} aria-hidden="true"></i>
                {item.label}
                {blocked && <i className="fas fa-lock sidebar-lock" aria-hidden="true"></i>}
              </button>
            );
          })}
        </aside>

        {/* ── Main ── */}
        <div className="dashboard-main">
          {error && (
            <div className="dash-error-banner" role="alert">
              <i className="fas fa-triangle-exclamation" aria-hidden="true"></i> {error}
            </div>
          )}

          {/* ══ OVERVIEW ══ */}
          {view === 'overview' && (
            <div>
              <div className="dashboard-title">نظرة عامة</div>
              <div className="dashboard-stats">
                {[
                  { icon: 'fa-box',          num: products.length, label: 'إجمالي المنتجات',  cls: 'dash-stat-green',   color: 'var(--primary)' },
                  { icon: 'fa-circle-check', num: activeCount,      label: 'منتج نشط',         cls: 'dash-stat-emerald', color: '#15803d' },
                  { icon: 'fa-warehouse',    num: totalStock,       label: 'إجمالي المخزون',   cls: 'dash-stat-orange',  color: 'var(--secondary-dark)' },
                  { icon: 'fa-list-check',   num: orders.length,    label: 'إجمالي الطلبات',   cls: 'dash-stat-purple',  color: '#7c3aed' },
                  { icon: 'fa-hourglass-half', num: pendingOrders,  label: 'طلبات معلقة',      cls: 'dash-stat-orange',  color: '#d97706' },
                  { icon: 'fa-coins',        num: `${totalRevenue} د.ك`, label: 'إجمالي الإيرادات', cls: 'dash-stat-green', color: 'var(--primary)' },
                ].map((s, i) => (
                  <div key={i} className="dash-stat">
                    <div className={`dash-stat-icon ${s.cls}`}>
                      <i className={`fas ${s.icon}`} style={{ color: s.color }} aria-hidden="true"></i>
                    </div>
                    <div>
                      <div className="dash-stat-num">{s.num}</div>
                      <div className="dash-stat-label">{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="quick-actions">
                {[
                  { icon: 'fa-plus',        label: 'إضافة منتج جديد',    color: 'var(--primary)',       action: () => { setView('products'); setTimeout(openAddProduct, 100); } },
                  { icon: 'fa-users-gear',  label: 'إدارة المستخدمين',   color: '#7c3aed',               action: () => setView('users') },
                  { icon: 'fa-pen-nib',     label: 'تعديل محتوى الموقع', color: 'var(--secondary-dark)', action: openContentTab },
                  { icon: 'fa-list-check',  label: 'عرض الطلبات',        color: '#0891b2',               action: () => setView('orders') },
                  { icon: 'fa-truck',       label: 'إعدادات الشحن',      color: '#16a34a',               action: openShippingTab },
                  { icon: 'fa-credit-card', label: 'بوابات الدفع',       color: '#e67e22',               action: openPaymentsTab },
                ].map((a, i) => (
                  <button key={i} className="quick-action-btn" onClick={a.action}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = a.color; e.currentTarget.style.color = a.color; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text)'; }}>
                    <div className="quick-action-icon" style={{ color: a.color }}>
                      <i className={`fas ${a.icon}`} aria-hidden="true"></i>
                    </div>
                    {a.label}
                  </button>
                ))}
              </div>

              <div className="data-table">
                <div className="table-header">
                  <span className="table-title">آخر الطلبات</span>
                </div>
                <table>
                  <thead><tr><th>رقم الطلب</th><th>العميل</th><th>المحافظة</th><th>الإجمالي</th><th>الدفع</th><th>الحالة</th></tr></thead>
                  <tbody>
                    {orders.slice(0, 5).map(o => (
                      <tr key={o.id}>
                        <td className="td-primary">{o.ref}</td>
                        <td className="td-bold">{o.client}</td>
                        <td className="td-light">{o.governorate || '—'}</td>
                        <td className="td-bold">{o.grandTotal || o.total} د.ك</td>
                        <td><span className="badge-pay">{o.payment || '—'}</span></td>
                        <td><span className={`status-badge status-${o.status}`}>{orderStatusLabels[o.status] || o.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══ PRODUCTS ══ */}
          {view === 'products' && (
            <div>
              <div className="dash-header-row">
                <div className="dashboard-title">إدارة المنتجات</div>
                {perms.products && (
                  <button className="btn btn-green btn-sm" onClick={openAddProduct}>
                    <i className="fas fa-plus" aria-hidden="true"></i> إضافة منتج
                  </button>
                )}
              </div>
              <div className="data-table">
                <table>
                  <thead><tr><th>#</th><th>المنتج</th><th>الفئة</th><th>السعر</th><th>المخزون</th><th>الحالة</th><th>إجراءات</th></tr></thead>
                  <tbody>
                    {products.map((p, i) => (
                      <tr key={p.id}>
                        <td className="td-light">{i + 1}</td>
                        <td><span className="td-icon">{p.icon}</span><span className="td-bold">{p.name}</span></td>
                        <td><span className="badge-cat">{categoryLabels[p.category] || p.category}</span></td>
                        <td className="td-primary">{Number(p.price).toFixed(3)} د.ك</td>
                        <td className={Number(p.stock) < 100 ? 'td-warn' : ''}>{Number(p.stock).toLocaleString()}</td>
                        <td><span className={`status-badge status-${p.status}`}>{productStatusLabels[p.status]}</span></td>
                        <td>
                          <button className="action-btn action-btn-edit" onClick={() => openEditProduct(p)}><i className="fas fa-pen"></i> تعديل</button>
                          <button className="action-btn action-btn-delete" onClick={() => handleDeleteProduct(p.id)}><i className="fas fa-trash"></i> حذف</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══ ORDERS ══ */}
          {view === 'orders' && (
            <div>
              <div className="dashboard-title">الطلبات ({orders.length})</div>
              <div className="data-table">
                <table>
                  <thead><tr><th>رقم الطلب</th><th>العميل</th><th>المحافظة</th><th>المنتج</th><th>الإجمالي</th><th>الدفع</th><th>التاريخ</th><th>الحالة</th></tr></thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o.id}>
                        <td className="td-primary">{o.ref}</td>
                        <td className="td-bold">{o.client}</td>
                        <td className="td-light">{o.governorate || '—'}</td>
                        <td className="td-light">{o.product}</td>
                        <td className="td-bold">{o.grandTotal || o.total} د.ك</td>
                        <td><span className="badge-pay">{o.payment || '—'}</span></td>
                        <td className="td-light" dir="ltr">{o.date}</td>
                        <td>
                          <select
                            className="status-select"
                            value={o.status}
                            onChange={e => updateOrderStatus(o.id, e.target.value)}
                          >
                            {Object.entries(orderStatusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══ USERS ══ */}
          {view === 'users' && (
            <div>
              <div className="dash-header-row">
                <div className="dashboard-title">إدارة المستخدمين</div>
                {perms.users && (
                  <button className="btn btn-green btn-sm" onClick={openAddUser}>
                    <i className="fas fa-user-plus" aria-hidden="true"></i> إضافة مستخدم
                  </button>
                )}
              </div>
              <div className="data-table">
                <table>
                  <thead><tr><th>#</th><th>الاسم</th><th>اسم المستخدم</th><th>الهاتف</th><th>الصلاحية</th><th>الحالة</th><th>إجراءات</th></tr></thead>
                  <tbody>
                    {users.map((u, i) => (
                      <tr key={u.id}>
                        <td className="td-light">{i + 1}</td>
                        <td>
                          <div className="user-avatar-cell">
                            <div className="user-avatar" style={{ background: u.role === 'admin' ? '#d97706' : 'var(--primary)' }}>{u.name?.[0] || '؟'}</div>
                            <div>
                              <div className="td-bold">{u.name}</div>
                              <div className="td-light" dir="ltr" style={{ fontSize: '11px' }}>{u.email || ''}</div>
                            </div>
                          </div>
                        </td>
                        <td className="td-light" dir="ltr">{u.username}</td>
                        <td className="td-light" dir="ltr">{u.phone || '—'}</td>
                        <td><span className={`role-badge role-${u.role}`}>{roleLabels[u.role] || u.role}</span></td>
                        <td><span className={`user-status-badge ustatus-${u.status || 'active'}`}>{userStatusLabels[u.status || 'active']}</span></td>
                        <td>
                          <button className="action-btn action-btn-edit" onClick={() => openEditUser(u)}><i className="fas fa-pen"></i> تعديل</button>
                          <button className="action-btn action-btn-delete" onClick={() => handleDeleteUser(u)} disabled={u.id === auth?.id}><i className="fas fa-trash"></i> حذف</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══ CONTENT ══ */}
          {view === 'content' && contentForm && (
            <div>
              <div className="dashboard-title">محتوى الموقع</div>
              <p className="dash-section-desc">التغييرات تُحفظ في قاعدة البيانات وتظهر فوراً على صفحات الموقع.</p>
              {contentSaved && <AlertSuccess msg="تم حفظ محتوى الموقع بنجاح!" />}
              {contentErr   && <AlertError  msg={contentErr} />}
              <form onSubmit={handleContentSave} className="content-form">
                <div className="content-section-title"><i className="fas fa-house"></i> الصفحة الرئيسية — Hero</div>
                <div className="content-grid">
                  <div className="form-group"><label className="form-label">شارة الهيرو</label><input className="form-input" name="heroBadge" value={contentForm.heroBadge || ''} onChange={e => setContentForm(p => ({...p, [e.target.name]: e.target.value}))} /></div>
                  <div className="form-group"><label className="form-label">عنوان الهيرو</label><input className="form-input" name="heroTitle" value={contentForm.heroTitle || ''} onChange={e => setContentForm(p => ({...p, [e.target.name]: e.target.value}))} /></div>
                  <div className="form-group content-span2"><label className="form-label">وصف الهيرو</label><textarea className="form-textarea" name="heroSubtitle" value={contentForm.heroSubtitle || ''} onChange={e => setContentForm(p => ({...p, [e.target.name]: e.target.value}))} style={{ minHeight: '70px' }} /></div>
                </div>
                <div className="content-section-title"><i className="fas fa-chart-bar"></i> إحصائيات</div>
                <div className="content-grid">
                  {['statsYear','founded','factoryArea','productionCapacity','statsClients'].map(k => (
                    <div key={k} className="form-group"><label className="form-label">{k}</label><input className="form-input" name={k} value={contentForm[k] || ''} onChange={e => setContentForm(p => ({...p, [e.target.name]: e.target.value}))} dir="ltr" /></div>
                  ))}
                </div>
                <div className="content-section-title"><i className="fas fa-circle-info"></i> قصة الشركة</div>
                <div className="form-group"><label className="form-label">نص القصة</label><textarea className="form-textarea" name="aboutStory" value={contentForm.aboutStory || ''} onChange={e => setContentForm(p => ({...p, [e.target.name]: e.target.value}))} style={{ minHeight: '120px' }} /></div>
                <div className="content-section-title"><i className="fas fa-user-tie"></i> المدير العام</div>
                <div className="content-grid">
                  <div className="form-group"><label className="form-label">الاسم</label><input className="form-input" name="ceoName" value={contentForm.ceoName || ''} onChange={e => setContentForm(p => ({...p, [e.target.name]: e.target.value}))} /></div>
                  <div className="form-group"><label className="form-label">اللقب</label><input className="form-input" name="ceoTitle" value={contentForm.ceoTitle || ''} onChange={e => setContentForm(p => ({...p, [e.target.name]: e.target.value}))} /></div>
                  <div className="form-group content-span2"><label className="form-label">الاقتباس (اتركه فارغاً للإخفاء)</label><textarea className="form-textarea" name="ceoQuote" value={contentForm.ceoQuote || ''} onChange={e => setContentForm(p => ({...p, [e.target.name]: e.target.value}))} style={{ minHeight: '80px' }} /></div>
                </div>
                <div className="content-section-title"><i className="fas fa-phone"></i> بيانات التواصل</div>
                <div className="content-grid">
                  {['companyPhone','companyWhatsapp','companyEmail','workHours'].map(k => (
                    <div key={k} className="form-group"><label className="form-label">{k}</label><input className="form-input" name={k} value={contentForm[k] || ''} onChange={e => setContentForm(p => ({...p, [e.target.name]: e.target.value}))} dir="ltr" /></div>
                  ))}
                  <div className="form-group content-span2"><label className="form-label">العنوان</label><input className="form-input" name="companyAddress" value={contentForm.companyAddress || ''} onChange={e => setContentForm(p => ({...p, [e.target.name]: e.target.value}))} /></div>
                </div>
                <div className="content-save-row">
                  <button type="submit" className="btn btn-green" disabled={contentLoading}>
                    {contentLoading ? <><i className="fas fa-spinner fa-spin"></i> جاري الحفظ...</> : <><i className="fas fa-save"></i> حفظ في قاعدة البيانات</>}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ══ SHIPPING ══ */}
          {view === 'shipping' && shippingZones && (
            <div>
              <div className="dash-header-row">
                <div className="dashboard-title">الشحن والتوصيل — الكويت</div>
                <button className="btn btn-green btn-sm" onClick={saveShipping}><i className="fas fa-save"></i> حفظ</button>
              </div>
              {shippingSaved && <AlertSuccess msg="تم حفظ إعدادات الشحن بنجاح!" />}
              <p className="dash-section-desc">تحكم في مناطق التوصيل ورسومها داخل الكويت.</p>
              <div className="shipping-zones-grid">
                {shippingZones.map(zone => (
                  <div key={zone.id} className={`shipping-zone-card${zone.enabled ? '' : ' disabled-zone'}`}>
                    <div className="zone-card-header">
                      <div className="zone-name">{zone.ar}</div>
                      <label className="toggle-switch">
                        <input type="checkbox" checked={zone.enabled} onChange={() => toggleZone(zone.id)} />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                    <div className="zone-name-en">{zone.en}</div>
                    <div className="zone-fee-row">
                      <label className="form-label" style={{ marginBottom: 0 }}>رسوم التوصيل (د.ك)</label>
                      <input
                        className="form-input zone-fee-input"
                        type="number" step="0.250" min="0"
                        value={zone.fee}
                        onChange={e => updateZoneFee(zone.id, e.target.value)}
                        dir="ltr"
                        disabled={!zone.enabled}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ PAYMENTS ══ */}
          {view === 'payments' && paySettings && (
            <div>
              <div className="dash-header-row">
                <div className="dashboard-title">بوابات الدفع</div>
                <button className="btn btn-green btn-sm" onClick={savePayments}><i className="fas fa-save"></i> حفظ</button>
              </div>
              {paySaved && <AlertSuccess msg="تم حفظ إعدادات الدفع بنجاح!" />}
              <p className="dash-section-desc">فعّل بوابات الدفع وأدخل مفاتيح API للربط مع كل بوابة.</p>

              <div className="payment-gateways-grid">
                {/* Cash */}
                <div className="gateway-card">
                  <div className="gateway-header">
                    <div className="gateway-info"><div className="gateway-icon" style={{ background: '#dcfce7' }}><i className="fas fa-money-bills" style={{ color: '#16a34a' }}></i></div><div><div className="gateway-name">كاش عند الاستلام</div><div className="gateway-sub">Cash on Delivery</div></div></div>
                    <label className="toggle-switch"><input type="checkbox" checked={paySettings.cash?.enabled} onChange={() => toggleGateway('cash')} /><span className="toggle-slider"></span></label>
                  </div>
                </div>

                {/* Bank Transfer */}
                <div className="gateway-card">
                  <div className="gateway-header">
                    <div className="gateway-info"><div className="gateway-icon" style={{ background: '#dbeafe' }}><i className="fas fa-building-columns" style={{ color: '#1d4ed8' }}></i></div><div><div className="gateway-name">تحويل بنكي</div><div className="gateway-sub">Bank Transfer</div></div></div>
                    <label className="toggle-switch"><input type="checkbox" checked={paySettings.transfer?.enabled} onChange={() => toggleGateway('transfer')} /><span className="toggle-slider"></span></label>
                  </div>
                  {paySettings.transfer?.enabled && (
                    <div className="gateway-fields">
                      <div className="form-group"><label className="form-label">اسم البنك</label><input className="form-input" value={paySettings.transfer?.bankName || ''} onChange={e => setGatewayField('transfer', 'bankName', e.target.value)} /></div>
                      <div className="form-group"><label className="form-label">رقم الآيبان (IBAN)</label><input className="form-input" dir="ltr" value={paySettings.transfer?.iban || ''} onChange={e => setGatewayField('transfer', 'iban', e.target.value)} placeholder="KW81NBKU..." /></div>
                    </div>
                  )}
                </div>

                {/* KNET */}
                <div className="gateway-card">
                  <div className="gateway-header">
                    <div className="gateway-info"><div className="gateway-icon" style={{ background: '#e0e7ff' }}><i className="fas fa-credit-card" style={{ color: '#003087' }}></i></div><div><div className="gateway-name">K-NET</div><div className="gateway-sub">الشبكة الكويتية</div></div></div>
                    <label className="toggle-switch"><input type="checkbox" checked={paySettings.knet?.enabled} onChange={() => toggleGateway('knet')} /><span className="toggle-slider"></span></label>
                  </div>
                  {paySettings.knet?.enabled && (
                    <div className="gateway-fields">
                      <div className="form-group"><label className="form-label">API Key</label><input className="form-input" dir="ltr" value={paySettings.knet?.apiKey || ''} onChange={e => setGatewayField('knet', 'apiKey', e.target.value)} placeholder="sk_..." /></div>
                      <label className="gateway-test-toggle"><input type="checkbox" checked={paySettings.knet?.testMode} onChange={() => setGatewayField('knet', 'testMode', !paySettings.knet?.testMode)} /> وضع الاختبار (Test Mode)</label>
                    </div>
                  )}
                </div>

                {/* MyFatoorah */}
                <div className="gateway-card">
                  <div className="gateway-header">
                    <div className="gateway-info"><div className="gateway-icon" style={{ background: '#fff7ed' }}><i className="fas fa-wallet" style={{ color: '#e67e22' }}></i></div><div><div className="gateway-name">MyFatoorah</div><div className="gateway-sub">ماي فاتورة</div></div></div>
                    <label className="toggle-switch"><input type="checkbox" checked={paySettings.myfatoorah?.enabled} onChange={() => toggleGateway('myfatoorah')} /><span className="toggle-slider"></span></label>
                  </div>
                  {paySettings.myfatoorah?.enabled && (
                    <div className="gateway-fields">
                      <div className="form-group"><label className="form-label">API Key</label><input className="form-input" dir="ltr" value={paySettings.myfatoorah?.apiKey || ''} onChange={e => setGatewayField('myfatoorah', 'apiKey', e.target.value)} placeholder="rLtt7iI3-..." /></div>
                      <label className="gateway-test-toggle"><input type="checkbox" checked={paySettings.myfatoorah?.testMode} onChange={() => setGatewayField('myfatoorah', 'testMode', !paySettings.myfatoorah?.testMode)} /> وضع الاختبار</label>
                    </div>
                  )}
                </div>

                {/* Tap */}
                <div className="gateway-card">
                  <div className="gateway-header">
                    <div className="gateway-info"><div className="gateway-icon" style={{ background: '#f0fdf4' }}><i className="fas fa-mobile-screen" style={{ color: '#000' }}></i></div><div><div className="gateway-name">Tap Payments</div><div className="gateway-sub">تاب للمدفوعات</div></div></div>
                    <label className="toggle-switch"><input type="checkbox" checked={paySettings.tap?.enabled} onChange={() => toggleGateway('tap')} /><span className="toggle-slider"></span></label>
                  </div>
                  {paySettings.tap?.enabled && (
                    <div className="gateway-fields">
                      <div className="form-group"><label className="form-label">Secret Key</label><input className="form-input" dir="ltr" value={paySettings.tap?.apiKey || ''} onChange={e => setGatewayField('tap', 'apiKey', e.target.value)} placeholder="sk_test_..." /></div>
                      <label className="gateway-test-toggle"><input type="checkbox" checked={paySettings.tap?.testMode} onChange={() => setGatewayField('tap', 'testMode', !paySettings.tap?.testMode)} /> وضع الاختبار</label>
                    </div>
                  )}
                </div>

                {/* STC Pay, Zain Cash, Benefit Pay */}
                {[
                  { key: 'stcpay',     name: 'STC Pay',     sub: 'اس تي سي باي', color: '#a31c2e', bg: '#fee2e2' },
                  { key: 'zaincash',   name: 'Zain Cash',   sub: 'زين كاش',       color: '#c00',    bg: '#fee2e2' },
                  { key: 'benefitpay', name: 'Benefit Pay', sub: 'بيفيت باي',     color: '#00843d', bg: '#dcfce7' },
                ].map(gw => (
                  <div key={gw.key} className="gateway-card">
                    <div className="gateway-header">
                      <div className="gateway-info"><div className="gateway-icon" style={{ background: gw.bg }}><i className="fas fa-mobile-screen" style={{ color: gw.color }}></i></div><div><div className="gateway-name">{gw.name}</div><div className="gateway-sub">{gw.sub}</div></div></div>
                      <label className="toggle-switch"><input type="checkbox" checked={paySettings[gw.key]?.enabled} onChange={() => toggleGateway(gw.key)} /><span className="toggle-slider"></span></label>
                    </div>
                    {paySettings[gw.key]?.enabled && (
                      <div className="gateway-fields">
                        <p className="gateway-coming-soon"><i className="fas fa-circle-info"></i> سيتوفر الربط المباشر قريباً. يمكنك تفعيل الخيار الآن ليظهر في صفحة الدفع.</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ COUPONS ══ */}
          {view === 'coupons' && (
            <div>
              <div className="dash-header-row">
                <div className="dashboard-title">الكوبونات والخصومات</div>
                <button className="btn btn-green btn-sm" onClick={openAddCoupon}><i className="fas fa-plus"></i> إضافة كوبون</button>
              </div>
              <div className="data-table">
                <table>
                  <thead><tr><th>الكود</th><th>النوع</th><th>الخصم</th><th>الحد الأدنى</th><th>الاستخدام</th><th>الانتهاء</th><th>الحالة</th><th>إجراءات</th></tr></thead>
                  <tbody>
                    {coupons.map(c => (
                      <tr key={c.id}>
                        <td className="td-primary" dir="ltr">{c.code}</td>
                        <td><span className="badge-cat">{c.type === 'percent' ? 'نسبة %' : 'مبلغ ثابت'}</span></td>
                        <td className="td-bold">{c.type === 'percent' ? `${c.value}%` : `${c.value} د.ك`}</td>
                        <td className="td-light">{c.minOrder ? `${c.minOrder} د.ك` : '—'}</td>
                        <td className="td-light">{c.usedCount || 0} / {c.maxUses || '∞'}</td>
                        <td className="td-light" dir="ltr">{c.expiry || '—'}</td>
                        <td><span className={`status-badge status-${c.status}`}>{c.status === 'active' ? 'نشط' : 'متوقف'}</span></td>
                        <td>
                          <button className="action-btn action-btn-edit" onClick={() => openEditCoupon(c)}><i className="fas fa-pen"></i> تعديل</button>
                          <button className="action-btn action-btn-delete" onClick={async () => { if(window.confirm(`حذف كوبون "${c.code}"؟`)) await deleteCoupon(c.id); }}><i className="fas fa-trash"></i> حذف</button>
                        </td>
                      </tr>
                    ))}
                    {coupons.length === 0 && <tr><td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-light)', padding: '40px' }}>لا توجد كوبونات بعد</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══ REPORTS ══ */}
          {view === 'reports' && (
            <div>
              <div className="dashboard-title">التقارير والإحصائيات</div>
              <div className="reports-grid">
                {[
                  { title: 'إجمالي الإيرادات', value: `${totalRevenue} د.ك`, change: '', icon: 'fa-chart-line',    cls: 'dash-stat-green',   iconColor: 'var(--primary)', badgeColor: 'var(--primary)' },
                  { title: 'الطلبات النشطة',   value: orders.filter(o => o.status === 'active').length, change: '',  icon: 'fa-shopping-bag', cls: 'dash-stat-purple', iconColor: '#7c3aed', badgeColor: '#7c3aed' },
                  { title: 'قيد المراجعة',     value: pendingOrders, change: '', icon: 'fa-hourglass-half', cls: 'dash-stat-orange', iconColor: '#d97706', badgeColor: '#d97706' },
                  { title: 'المنتجات النشطة',  value: activeCount,   change: `من ${products.length}`, icon: 'fa-box-open', cls: 'dash-stat-emerald', iconColor: '#059669', badgeColor: '#059669' },
                ].map((r, i) => (
                  <div key={i} className="reports-card">
                    <div className="reports-card-header">
                      <div className={`reports-card-icon ${r.cls}`}><i className={`fas ${r.icon}`} style={{ color: r.iconColor }}></i></div>
                      {r.change && <span className={`reports-card-badge ${r.cls}`} style={{ color: r.badgeColor }}>{r.change}</span>}
                    </div>
                    <div className="reports-card-label">{r.title}</div>
                    <div className="reports-card-value">{r.value}</div>
                  </div>
                ))}
              </div>
              {/* Revenue by payment method */}
              <div className="bar-chart-card">
                <div className="bar-chart-title">الطلبات حسب طريقة الدفع</div>
                <div className="bar-items">
                  {['cash','transfer','knet','myfatoorah','tap','stcpay'].map(method => {
                    const count = orders.filter(o => o.payment === method).length;
                    const pct   = orders.length ? Math.round((count / orders.length) * 100) : 0;
                    if (!count) return null;
                    return (
                      <div key={method} className="bar-item">
                        <div className="bar-item-header">
                          <span className="bar-item-name">{method.toUpperCase()}</span>
                          <span className="bar-item-count">{count} طلب ({pct}%)</span>
                        </div>
                        <div className="bar-track"><div className="bar-fill" style={{ width: `${pct}%` }}></div></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>{/* /dashboard-main */}

        {/* ══ Product Modal ══ */}
        {productModal && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeProductModal()}>
            <div className="modal" role="dialog">
              <div className="modal-header">
                <h3>{productModal === 'add' ? 'إضافة منتج جديد' : 'تعديل المنتج'}</h3>
                <button className="modal-close" onClick={closeProductModal}><i className="fas fa-xmark"></i></button>
              </div>
              {productSaved && <AlertSuccess msg="تم الحفظ بنجاح!" />}
              {productErr   && <AlertError  msg={productErr} />}
              <form onSubmit={handleProductSave}>
                <div className="form-group"><label className="form-label">اسم المنتج *</label><input className="form-input" name="name" value={productForm.name} onChange={e => setProductForm(p=>({...p,[e.target.name]:e.target.value}))} required /></div>
                <div className="modal-grid2">
                  <div className="form-group"><label className="form-label">الأيقونة</label><input className="form-input" name="icon" value={productForm.icon} onChange={e => setProductForm(p=>({...p,[e.target.name]:e.target.value}))} dir="ltr" /></div>
                  <div className="form-group"><label className="form-label">الشارة (اختياري)</label><input className="form-input" name="badge" value={productForm.badge} onChange={e => setProductForm(p=>({...p,[e.target.name]:e.target.value}))} /></div>
                </div>
                <div className="modal-grid2">
                  <div className="form-group"><label className="form-label">الفئة</label><select className="form-select" name="category" value={productForm.category} onChange={e => setProductForm(p=>({...p,[e.target.name]:e.target.value}))}>{Object.entries(categoryLabels).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></div>
                  <div className="form-group"><label className="form-label">الحالة</label><select className="form-select" name="status" value={productForm.status} onChange={e => setProductForm(p=>({...p,[e.target.name]:e.target.value}))}>{Object.entries(productStatusLabels).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></div>
                </div>
                <div className="modal-grid2">
                  <div className="form-group"><label className="form-label">السعر (د.ك) *</label><input className="form-input" type="number" step="0.001" min="0" name="price" value={productForm.price} onChange={e => setProductForm(p=>({...p,[e.target.name]:e.target.value}))} required dir="ltr" /></div>
                  <div className="form-group"><label className="form-label">المخزون *</label><input className="form-input" type="number" min="0" name="stock" value={productForm.stock} onChange={e => setProductForm(p=>({...p,[e.target.name]:e.target.value}))} required dir="ltr" /></div>
                </div>
                <div className="form-group"><label className="form-label">وصف المنتج</label><textarea className="form-textarea" name="desc" value={productForm.desc} onChange={e => setProductForm(p=>({...p,[e.target.name]:e.target.value}))} style={{ minHeight: '70px' }} /></div>
                <div className="modal-actions">
                  <button type="button" onClick={closeProductModal} className="btn btn-outline">إلغاء</button>
                  <button type="submit" className="btn btn-green"><i className="fas fa-save"></i> حفظ</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ══ User Modal ══ */}
        {userModal && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeUserModal()}>
            <div className="modal modal-lg" role="dialog">
              <div className="modal-header">
                <h3>{userModal === 'add' ? 'إضافة مستخدم جديد' : 'تعديل المستخدم'}</h3>
                <button className="modal-close" onClick={closeUserModal}><i className="fas fa-xmark"></i></button>
              </div>
              {userSaved && <AlertSuccess msg="تم حفظ المستخدم بنجاح!" />}
              {userErr   && <AlertError  msg={userErr} />}
              <form onSubmit={handleUserSave}>
                <div className="modal-grid2">
                  <div className="form-group"><label className="form-label">الاسم الكامل *</label><input className="form-input" name="name" value={userForm.name} onChange={e => setUserForm(p=>({...p,[e.target.name]:e.target.value}))} required /></div>
                  <div className="form-group"><label className="form-label">اسم المستخدم * (أحرف وأرقام فقط)</label><input className="form-input" name="username" value={userForm.username} onChange={e => setUserForm(p=>({...p,[e.target.name]:e.target.value}))} required dir="ltr" /></div>
                </div>

                {/* Password with strength */}
                <div className="form-group">
                  <label className="form-label">{userModal === 'edit' ? 'كلمة المرور الجديدة (اتركها فارغة للإبقاء)' : 'كلمة المرور *'}</label>
                  <div className="input-pwd-wrap">
                    <input className="form-input" type={showPwd ? 'text' : 'password'} name="password" value={userForm.password} onChange={e => setUserForm(p=>({...p,[e.target.name]:e.target.value}))} dir="ltr" required={userModal === 'add'} />
                    <button type="button" className="pwd-toggle" onClick={() => setShowPwd(p=>!p)}><i className={`fas ${showPwd?'fa-eye-slash':'fa-eye'}`}></i></button>
                  </div>
                  {userForm.password && (
                    <>
                      <div className="pwd-strength-bar">
                        {[1,2,3,4].map(i => <div key={i} className="pwd-strength-seg" style={{ background: i <= pwdStrength.score ? pwdStrength.color : 'var(--border)' }}></div>)}
                      </div>
                      <div className="pwd-strength-label" style={{ color: pwdStrength.color }}>{pwdStrength.label}</div>
                      <ul className="pwd-rules">
                        {[
                          { test: userForm.password.length >= 8,            label: '8 أحرف على الأقل' },
                          { test: /[A-Z]/.test(userForm.password),          label: 'حرف كبير (A-Z)' },
                          { test: /[0-9]/.test(userForm.password),          label: 'رقم واحد على الأقل' },
                          { test: /[^A-Za-z0-9]/.test(userForm.password),  label: 'رمز خاص (!@#$...)' },
                        ].map((r, i) => (
                          <li key={i} className={r.test ? 'rule-pass' : 'rule-fail'}>
                            <i className={`fas ${r.test ? 'fa-circle-check' : 'fa-circle-xmark'}`}></i> {r.label}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>

                <div className="modal-grid2">
                  <div className="form-group"><label className="form-label">البريد الإلكتروني</label><input className="form-input" type="email" name="email" value={userForm.email} onChange={e => setUserForm(p=>({...p,[e.target.name]:e.target.value}))} dir="ltr" placeholder="email@example.com" /></div>
                  <div className="form-group"><label className="form-label">رقم الهاتف (كويتي)</label><input className="form-input" name="phone" value={userForm.phone} onChange={e => setUserForm(p=>({...p,[e.target.name]:e.target.value}))} dir="ltr" placeholder="+96512345678" /></div>
                </div>

                <div className="modal-grid2">
                  <div className="form-group">
                    <label className="form-label">الصلاحية</label>
                    <select className="form-select" name="role" value={userForm.role} onChange={e => setUserForm(p=>({...p,[e.target.name]:e.target.value}))}>
                      {Object.entries(roleLabels).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">حالة الحساب</label>
                    <select className="form-select" name="status" value={userForm.status || 'active'} onChange={e => setUserForm(p=>({...p,[e.target.name]:e.target.value}))}>
                      {Object.entries(userStatusLabels).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                </div>

                {/* Permissions preview */}
                <button type="button" className="perms-toggle-btn" onClick={() => setShowPerms(p=>!p)}>
                  <i className={`fas fa-chevron-${showPerms?'up':'down'}`}></i>
                  صلاحيات هذه الوظيفة ({roleLabels[userForm.role]})
                </button>
                {showPerms && (
                  <div className="perms-grid">
                    {Object.entries(ROLE_PERMISSIONS[userForm.role] || {}).map(([perm, allowed]) => (
                      <div key={perm} className={`perm-item ${allowed ? 'perm-allow' : 'perm-deny'}`}>
                        <i className={`fas ${allowed ? 'fa-circle-check' : 'fa-circle-xmark'}`}></i>
                        {perm}
                      </div>
                    ))}
                  </div>
                )}

                <div className="modal-actions">
                  <button type="button" onClick={closeUserModal} className="btn btn-outline">إلغاء</button>
                  <button type="submit" className="btn btn-green"><i className="fas fa-save"></i> حفظ</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ══ Coupon Modal ══ */}
        {couponModal && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeCouponModal()}>
            <div className="modal" role="dialog">
              <div className="modal-header">
                <h3>{couponModal === 'add' ? 'إضافة كوبون جديد' : 'تعديل الكوبون'}</h3>
                <button className="modal-close" onClick={closeCouponModal}><i className="fas fa-xmark"></i></button>
              </div>
              {couponSaved && <AlertSuccess msg="تم حفظ الكوبون بنجاح!" />}
              {couponErr   && <AlertError  msg={couponErr} />}
              <form onSubmit={handleCouponSave}>
                <div className="modal-grid2">
                  <div className="form-group"><label className="form-label">كود الخصم *</label><input className="form-input" name="code" value={couponForm.code} onChange={e => setCouponForm(p=>({...p,[e.target.name]:e.target.value.toUpperCase()}))} dir="ltr" placeholder="WELCOME10" required /></div>
                  <div className="form-group"><label className="form-label">نوع الخصم</label>
                    <select className="form-select" name="type" value={couponForm.type} onChange={e => setCouponForm(p=>({...p,[e.target.name]:e.target.value}))}>
                      <option value="percent">نسبة مئوية (%)</option>
                      <option value="fixed">مبلغ ثابت (د.ك)</option>
                    </select>
                  </div>
                </div>
                <div className="modal-grid2">
                  <div className="form-group"><label className="form-label">قيمة الخصم * {couponForm.type === 'percent' ? '(%)' : '(د.ك)'}</label><input className="form-input" type="number" min="0" name="value" value={couponForm.value} onChange={e => setCouponForm(p=>({...p,[e.target.name]:e.target.value}))} dir="ltr" required /></div>
                  <div className="form-group"><label className="form-label">الحد الأدنى للطلب (د.ك)</label><input className="form-input" type="number" min="0" step="0.001" name="minOrder" value={couponForm.minOrder} onChange={e => setCouponForm(p=>({...p,[e.target.name]:e.target.value}))} dir="ltr" placeholder="0" /></div>
                </div>
                <div className="modal-grid2">
                  <div className="form-group"><label className="form-label">الحد الأقصى للاستخدام (0 = غير محدود)</label><input className="form-input" type="number" min="0" name="maxUses" value={couponForm.maxUses} onChange={e => setCouponForm(p=>({...p,[e.target.name]:e.target.value}))} dir="ltr" /></div>
                  <div className="form-group"><label className="form-label">تاريخ الانتهاء</label><input className="form-input" type="date" name="expiry" value={couponForm.expiry} onChange={e => setCouponForm(p=>({...p,[e.target.name]:e.target.value}))} dir="ltr" /></div>
                </div>
                <div className="modal-grid2">
                  <div className="form-group"><label className="form-label">الحالة</label><select className="form-select" name="status" value={couponForm.status} onChange={e => setCouponForm(p=>({...p,[e.target.name]:e.target.value}))}><option value="active">نشط</option><option value="inactive">متوقف</option></select></div>
                  <div className="form-group"><label className="form-label">وصف الكوبون</label><input className="form-input" name="desc" value={couponForm.desc} onChange={e => setCouponForm(p=>({...p,[e.target.name]:e.target.value}))} /></div>
                </div>
                <div className="modal-actions">
                  <button type="button" onClick={closeCouponModal} className="btn btn-outline">إلغاء</button>
                  <button type="submit" className="btn btn-green"><i className="fas fa-save"></i> حفظ</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </>
  );
};

export default Dashboard;
