import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Seo from '../../components/Seo';
import './index.css';

/* ── Constants ── */
const categoryLabels = {
  facial: 'مناديل وجه', rolls: 'رولات', pocket: 'محارم جيب',
  towels: 'مناشف', napkins: 'مناديل مائدة', family: 'عروض عائلة',
};
const statusLabels = { active: 'نشط', pending: 'قيد المراجعة', inactive: 'متوقف' };
const roleLabels   = { admin: 'مدير', editor: 'محرر', viewer: 'مشاهد' };

const emptyProduct  = { name: '', category: 'facial', price: '', stock: '', status: 'active', icon: '📦', desc: '', badge: '' };
const emptyUser     = { username: '', password: '', name: '', email: '', role: 'viewer' };

const navItems = [
  { id: 'overview',  label: 'نظرة عامة',     icon: 'fa-chart-pie' },
  { id: 'products',  label: 'المنتجات',       icon: 'fa-box' },
  { id: 'orders',    label: 'الطلبات',        icon: 'fa-list-check' },
  { id: 'users',     label: 'المستخدمون',     icon: 'fa-users-gear' },
  { id: 'content',   label: 'محتوى الموقع',   icon: 'fa-pen-nib' },
  { id: 'reports',   label: 'التقارير',       icon: 'fa-chart-bar' },
];

const barData = [
  { name: 'مناديل الوجه الكلاسيكية',  pct: 85, count: '1,500 وحدة' },
  { name: 'رولات المطبخ المتينة',      pct: 70, count: '1,200 وحدة' },
  { name: 'باقة العائلة الاقتصادية',  pct: 55, count: '900 وحدة' },
  { name: 'مناديل المائدة الفاخرة',   pct: 40, count: '650 وحدة' },
  { name: 'محارم الجيب المحمولة',     pct: 30, count: '500 وحدة' },
];

/* ── Shared small components ── */
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

/* ═══════════════════════════════════════════════ */
const Dashboard = () => {
  const {
    products, orders, users, siteContent,
    loading, error,
    addProduct, updateProduct, deleteProduct,
    addUser, updateUser, deleteUser,
    saveSiteContent,
    auth,
  } = useApp();

  const [view, setView] = useState('overview');

  /* ── Product modal ── */
  const [productModal, setProductModal] = useState(null); // 'add' | 'edit'
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

  const handleProductChange = (e) => setProductForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleProductSave = async (e) => {
    e.preventDefault();
    setProductErr('');
    const data = { ...productForm, price: parseFloat(productForm.price), stock: parseInt(productForm.stock), specs: [], badge: productForm.badge || null };
    try {
      if (productModal === 'add') await addProduct(data);
      else await updateProduct(editProduct.id, { ...editProduct, ...data });
      setProductSaved(true);
      setTimeout(closeProductModal, 900);
    } catch {
      setProductErr('حدث خطأ أثناء الحفظ. تأكد من تشغيل الخادم.');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    try { await deleteProduct(id); }
    catch { alert('تعذر الحذف. تأكد من تشغيل الخادم.'); }
  };

  /* ── User modal ── */
  const [userModal, setUserModal] = useState(null);
  const [editUser,  setEditUser]  = useState(null);
  const [userForm,  setUserForm]  = useState(emptyUser);
  const [userSaved, setUserSaved] = useState(false);
  const [userErr,   setUserErr]   = useState('');
  const [showPwd,   setShowPwd]   = useState(false);

  const openAddUser  = () => { setUserForm(emptyUser); setUserErr(''); setUserSaved(false); setShowPwd(false); setUserModal('add'); };
  const openEditUser = (u) => {
    setUserForm({ username: u.username, password: '', name: u.name, email: u.email || '', role: u.role || 'viewer' });
    setEditUser(u); setUserErr(''); setUserSaved(false); setShowPwd(false); setUserModal('edit');
  };
  const closeUserModal = () => { setUserModal(null); setEditUser(null); };

  const handleUserChange = (e) => setUserForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleUserSave = async (e) => {
    e.preventDefault();
    setUserErr('');
    if (!userForm.username.trim()) { setUserErr('اسم المستخدم مطلوب'); return; }
    if (userModal === 'add' && !userForm.password) { setUserErr('كلمة المرور مطلوبة'); return; }
    try {
      const data = { ...userForm };
      if (userModal === 'edit' && !data.password) delete data.password;
      if (userModal === 'add') await addUser(data);
      else await updateUser(editUser.id, { ...editUser, ...data });
      setUserSaved(true);
      setTimeout(closeUserModal, 900);
    } catch {
      setUserErr('حدث خطأ أثناء الحفظ. تأكد من تشغيل الخادم.');
    }
  };

  const handleDeleteUser = async (u) => {
    if (u.id === auth?.id) { alert('لا يمكن حذف حسابك الخاص.'); return; }
    if (!window.confirm(`هل أنت متأكد من حذف المستخدم "${u.name}"؟`)) return;
    try { await deleteUser(u.id); }
    catch { alert('تعذر الحذف. تأكد من تشغيل الخادم.'); }
  };

  /* ── Site Content form ── */
  const [contentForm,  setContentForm]  = useState(null);
  const [contentSaved, setContentSaved] = useState(false);
  const [contentErr,   setContentErr]   = useState('');
  const [contentLoading, setContentLoading] = useState(false);

  // Initialise the content form whenever the tab is first opened
  const openContentTab = () => {
    if (!contentForm && siteContent) {
      setContentForm({ ...siteContent });
    }
    setView('content');
  };

  const handleContentChange = (e) => setContentForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleContentSave = async (e) => {
    e.preventDefault();
    setContentErr(''); setContentLoading(true);
    try {
      await saveSiteContent(contentForm);
      setContentSaved(true);
      setTimeout(() => setContentSaved(false), 3000);
    } catch {
      setContentErr('حدث خطأ أثناء الحفظ. تأكد من تشغيل الخادم.');
    } finally {
      setContentLoading(false);
    }
  };

  /* ── Derived stats ── */
  const activeCount = products.filter(p => p.status === 'active').length;
  const totalStock  = products.reduce((s, p) => s + (p.stock || 0), 0).toLocaleString();

  /* ── Loading skeleton ── */
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

          <div className="sidebar-title">القائمة الرئيسية</div>
          {navItems.map(item => (
            <button
              key={item.id}
              className={`sidebar-nav-item${view === item.id ? ' active' : ''}`}
              onClick={() => item.id === 'content' ? openContentTab() : setView(item.id)}
              aria-current={view === item.id ? 'page' : undefined}
            >
              <i className={`fas ${item.icon}`} aria-hidden="true"></i>
              {item.label}
            </button>
          ))}
        </aside>

        {/* ── Main Content ── */}
        <div className="dashboard-main">

          {error && (
            <div className="dash-error-banner" role="alert">
              <i className="fas fa-triangle-exclamation" aria-hidden="true"></i>
              {error}
            </div>
          )}

          {/* ── Overview ── */}
          {view === 'overview' && (
            <div>
              <div className="dashboard-title">نظرة عامة</div>
              <div className="dashboard-stats">
                {[
                  { icon: 'fa-box',          num: products.length, label: 'إجمالي المنتجات',  cls: 'dash-stat-green',   color: 'var(--primary)' },
                  { icon: 'fa-circle-check', num: activeCount,      label: 'منتج نشط',         cls: 'dash-stat-emerald', color: '#15803d' },
                  { icon: 'fa-warehouse',    num: totalStock,       label: 'إجمالي المخزون',   cls: 'dash-stat-orange',  color: 'var(--secondary-dark)' },
                  { icon: 'fa-list-check',   num: orders.length,    label: 'إجمالي الطلبات',   cls: 'dash-stat-purple',  color: '#7c3aed' },
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
                  { icon: 'fa-plus',      label: 'إضافة منتج جديد',    color: 'var(--primary)',       action: () => { setView('products'); setTimeout(openAddProduct, 100); } },
                  { icon: 'fa-users-gear',label: 'إدارة المستخدمين',   color: '#7c3aed',               action: () => setView('users') },
                  { icon: 'fa-pen-nib',   label: 'تعديل محتوى الموقع', color: 'var(--secondary-dark)', action: openContentTab },
                  { icon: 'fa-list-check',label: 'عرض الطلبات',        color: '#0891b2',               action: () => setView('orders') },
                ].map((a, i) => (
                  <button
                    key={i} className="quick-action-btn" onClick={a.action}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = a.color; e.currentTarget.style.color = a.color; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text)'; }}
                  >
                    <div className="quick-action-icon" style={{ color: a.color }}>
                      <i className={`fas ${a.icon}`} aria-hidden="true"></i>
                    </div>
                    {a.label}
                  </button>
                ))}
              </div>

              <div className="data-table">
                <div className="table-header"><span className="table-title">آخر الطلبات</span></div>
                <table>
                  <thead><tr><th>رقم الطلب</th><th>العميل</th><th>المنتج</th><th>الإجمالي</th><th>الحالة</th></tr></thead>
                  <tbody>
                    {orders.slice(0, 4).map(o => (
                      <tr key={o.id}>
                        <td className="td-primary">{o.ref}</td>
                        <td>{o.client}</td>
                        <td className="td-light">{o.product}</td>
                        <td className="td-bold">{o.total} د.ك</td>
                        <td><span className={`status-badge status-${o.status}`}>{statusLabels[o.status]}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Products ── */}
          {view === 'products' && (
            <div>
              <div className="dash-header-row">
                <div className="dashboard-title">إدارة المنتجات</div>
                <button className="btn btn-green btn-sm" onClick={openAddProduct}>
                  <i className="fas fa-plus" aria-hidden="true"></i> إضافة منتج
                </button>
              </div>
              <div className="data-table">
                <table>
                  <thead>
                    <tr><th>#</th><th>المنتج</th><th>الفئة</th><th>السعر</th><th>المخزون</th><th>الحالة</th><th>إجراءات</th></tr>
                  </thead>
                  <tbody>
                    {products.map((p, i) => (
                      <tr key={p.id}>
                        <td className="td-light">{i + 1}</td>
                        <td><span className="td-icon">{p.icon}</span><span className="td-bold">{p.name}</span></td>
                        <td><span className="badge-cat">{categoryLabels[p.category] || p.category}</span></td>
                        <td className="td-primary">{Number(p.price).toFixed(3)} د.ك</td>
                        <td>{Number(p.stock).toLocaleString()}</td>
                        <td><span className={`status-badge status-${p.status}`}>{statusLabels[p.status]}</span></td>
                        <td>
                          <button className="action-btn action-btn-edit" onClick={() => openEditProduct(p)}>
                            <i className="fas fa-pen" aria-hidden="true"></i> تعديل
                          </button>
                          <button className="action-btn action-btn-delete" onClick={() => handleDeleteProduct(p.id)}>
                            <i className="fas fa-trash" aria-hidden="true"></i> حذف
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Orders ── */}
          {view === 'orders' && (
            <div>
              <div className="dashboard-title">الطلبات ({orders.length})</div>
              <div className="data-table">
                <table>
                  <thead>
                    <tr><th>رقم الطلب</th><th>العميل</th><th>المنتج</th><th>الكمية</th><th>الإجمالي</th><th>التاريخ</th><th>الحالة</th></tr>
                  </thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o.id}>
                        <td className="td-primary">{o.ref}</td>
                        <td className="td-bold">{o.client}</td>
                        <td className="td-light">{o.product}</td>
                        <td>{Number(o.qty).toLocaleString()}</td>
                        <td className="td-bold">{o.total} د.ك</td>
                        <td className="td-light" dir="ltr">{o.date}</td>
                        <td><span className={`status-badge status-${o.status}`}>{statusLabels[o.status]}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Users ── */}
          {view === 'users' && (
            <div>
              <div className="dash-header-row">
                <div className="dashboard-title">إدارة المستخدمين</div>
                <button className="btn btn-green btn-sm" onClick={openAddUser}>
                  <i className="fas fa-user-plus" aria-hidden="true"></i> إضافة مستخدم
                </button>
              </div>
              <div className="data-table">
                <table>
                  <thead>
                    <tr><th>#</th><th>الاسم</th><th>اسم المستخدم</th><th>البريد</th><th>الصلاحية</th><th>إجراءات</th></tr>
                  </thead>
                  <tbody>
                    {users.map((u, i) => (
                      <tr key={u.id}>
                        <td className="td-light">{i + 1}</td>
                        <td>
                          <div className="user-avatar-cell">
                            <div className="user-avatar">{u.name?.[0] || '؟'}</div>
                            <span className="td-bold">{u.name}</span>
                          </div>
                        </td>
                        <td className="td-light" dir="ltr">{u.username}</td>
                        <td className="td-light" dir="ltr">{u.email || '—'}</td>
                        <td>
                          <span className={`role-badge role-${u.role}`}>{roleLabels[u.role] || u.role}</span>
                        </td>
                        <td>
                          <button className="action-btn action-btn-edit" onClick={() => openEditUser(u)}>
                            <i className="fas fa-pen" aria-hidden="true"></i> تعديل
                          </button>
                          <button
                            className="action-btn action-btn-delete"
                            onClick={() => handleDeleteUser(u)}
                            disabled={u.id === auth?.id}
                            title={u.id === auth?.id ? 'لا يمكن حذف حسابك' : undefined}
                          >
                            <i className="fas fa-trash" aria-hidden="true"></i> حذف
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Site Content ── */}
          {view === 'content' && contentForm && (
            <div>
              <div className="dashboard-title">محتوى الموقع</div>
              <p className="dash-section-desc">التغييرات تُحفظ في قاعدة البيانات وتظهر فوراً على صفحات الموقع.</p>

              {contentSaved && <AlertSuccess msg="تم حفظ محتوى الموقع بنجاح!" />}
              {contentErr   && <AlertError  msg={contentErr} />}

              <form onSubmit={handleContentSave} className="content-form">

                <div className="content-section-title">
                  <i className="fas fa-house" aria-hidden="true"></i> الصفحة الرئيسية — Hero
                </div>
                <div className="content-grid">
                  <div className="form-group">
                    <label className="form-label">شارة الهيرو (heroBadge)</label>
                    <input className="form-input" name="heroBadge" value={contentForm.heroBadge || ''} onChange={handleContentChange} placeholder="مثال: الجودة الكويتية منذ 1998" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">عنوان الهيرو (heroTitle)</label>
                    <input className="form-input" name="heroTitle" value={contentForm.heroTitle || ''} onChange={handleContentChange} />
                  </div>
                  <div className="form-group content-span2">
                    <label className="form-label">وصف الهيرو (heroSubtitle)</label>
                    <textarea className="form-textarea" name="heroSubtitle" value={contentForm.heroSubtitle || ''} onChange={handleContentChange} style={{ minHeight: '70px' }} />
                  </div>
                </div>

                <div className="content-section-title">
                  <i className="fas fa-chart-bar" aria-hidden="true"></i> إحصائيات الصفحة الرئيسية
                </div>
                <div className="content-grid">
                  <div className="form-group">
                    <label className="form-label">سنة التأسيس (statsYear)</label>
                    <input className="form-input" name="statsYear" value={contentForm.statsYear || ''} onChange={handleContentChange} dir="ltr" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">تاريخ التأسيس الكامل (founded)</label>
                    <input className="form-input" name="founded" value={contentForm.founded || ''} onChange={handleContentChange} dir="ltr" placeholder="18/2/1998" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">مساحة المصنع م² (factoryArea)</label>
                    <input className="form-input" name="factoryArea" value={contentForm.factoryArea || ''} onChange={handleContentChange} dir="ltr" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">الطاقة الإنتاجية طن/سنة (productionCapacity)</label>
                    <input className="form-input" name="productionCapacity" value={contentForm.productionCapacity || ''} onChange={handleContentChange} dir="ltr" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">عدد العملاء (statsClients)</label>
                    <input className="form-input" name="statsClients" value={contentForm.statsClients || ''} onChange={handleContentChange} dir="ltr" placeholder="+25" />
                  </div>
                </div>

                <div className="content-section-title">
                  <i className="fas fa-circle-info" aria-hidden="true"></i> قصة الشركة (صفحة من نحن)
                </div>
                <div className="form-group">
                  <label className="form-label">نص القصة (aboutStory)</label>
                  <textarea className="form-textarea" name="aboutStory" value={contentForm.aboutStory || ''} onChange={handleContentChange} style={{ minHeight: '120px' }} />
                </div>

                <div className="content-section-title">
                  <i className="fas fa-user-tie" aria-hidden="true"></i> المدير العام
                </div>
                <div className="content-grid">
                  <div className="form-group">
                    <label className="form-label">اسم المدير (ceoName)</label>
                    <input className="form-input" name="ceoName" value={contentForm.ceoName || ''} onChange={handleContentChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">لقب المدير (ceoTitle)</label>
                    <input className="form-input" name="ceoTitle" value={contentForm.ceoTitle || ''} onChange={handleContentChange} />
                  </div>
                  <div className="form-group content-span2">
                    <label className="form-label">اقتباس المدير (ceoQuote) — اتركه فارغاً لإخفاء القسم</label>
                    <textarea className="form-textarea" name="ceoQuote" value={contentForm.ceoQuote || ''} onChange={handleContentChange} style={{ minHeight: '80px' }} />
                  </div>
                </div>

                <div className="content-section-title">
                  <i className="fas fa-phone" aria-hidden="true"></i> بيانات التواصل
                </div>
                <div className="content-grid">
                  <div className="form-group">
                    <label className="form-label">الهاتف (companyPhone)</label>
                    <input className="form-input" name="companyPhone" value={contentForm.companyPhone || ''} onChange={handleContentChange} dir="ltr" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">واتساب (companyWhatsapp)</label>
                    <input className="form-input" name="companyWhatsapp" value={contentForm.companyWhatsapp || ''} onChange={handleContentChange} dir="ltr" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">البريد الإلكتروني (companyEmail)</label>
                    <input className="form-input" type="email" name="companyEmail" value={contentForm.companyEmail || ''} onChange={handleContentChange} dir="ltr" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">ساعات العمل (workHours)</label>
                    <input className="form-input" name="workHours" value={contentForm.workHours || ''} onChange={handleContentChange} />
                  </div>
                  <div className="form-group content-span2">
                    <label className="form-label">العنوان (companyAddress)</label>
                    <input className="form-input" name="companyAddress" value={contentForm.companyAddress || ''} onChange={handleContentChange} />
                  </div>
                </div>

                <div className="content-save-row">
                  <button type="submit" className="btn btn-green" disabled={contentLoading}>
                    {contentLoading
                      ? <><i className="fas fa-spinner fa-spin" aria-hidden="true"></i> جاري الحفظ...</>
                      : <><i className="fas fa-save" aria-hidden="true"></i> حفظ في قاعدة البيانات</>
                    }
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── Reports ── */}
          {view === 'reports' && (
            <div>
              <div className="dashboard-title">التقارير والإحصائيات</div>
              <div className="reports-grid">
                {[
                  { title: 'إجمالي المبيعات',    value: '4,030.000 د.ك',                              change: '+12%',      icon: 'fa-chart-line',    cls: 'dash-stat-green',   iconColor: 'var(--primary)',        badgeColor: 'var(--primary)' },
                  { title: 'الطلبات النشطة',     value: orders.filter(o => o.status === 'active').length, change: '+3',    icon: 'fa-shopping-bag',  cls: 'dash-stat-purple',  iconColor: '#7c3aed',               badgeColor: '#7c3aed' },
                  { title: 'قيد المراجعة',       value: orders.filter(o => o.status === 'pending').length,change: 'جديد', icon: 'fa-hourglass-half', cls: 'dash-stat-orange',  iconColor: '#d97706',               badgeColor: '#d97706' },
                  { title: 'المنتجات النشطة',    value: activeCount,                                   change: `من ${products.length}`, icon: 'fa-box-open', cls: 'dash-stat-emerald', iconColor: '#059669', badgeColor: '#059669' },
                ].map((r, i) => (
                  <div key={i} className="reports-card">
                    <div className="reports-card-header">
                      <div className={`reports-card-icon ${r.cls}`}>
                        <i className={`fas ${r.icon}`} style={{ color: r.iconColor }} aria-hidden="true"></i>
                      </div>
                      <span className={`reports-card-badge ${r.cls}`} style={{ color: r.badgeColor }}>{r.change}</span>
                    </div>
                    <div className="reports-card-label">{r.title}</div>
                    <div className="reports-card-value">{r.value}</div>
                  </div>
                ))}
              </div>

              <div className="bar-chart-card">
                <div className="bar-chart-title">أفضل المنتجات مبيعاً</div>
                <div className="bar-items">
                  {barData.map((item, i) => (
                    <div key={i} className="bar-item">
                      <div className="bar-item-header">
                        <span className="bar-item-name">{item.name}</span>
                        <span className="bar-item-count">{item.count}</span>
                      </div>
                      <div className="bar-track">
                        <div className="bar-fill" style={{ width: `${item.pct}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>{/* /dashboard-main */}

        {/* ══ Product Modal ══ */}
        {productModal && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeProductModal()}>
            <div className="modal" role="dialog" aria-modal="true" aria-label={productModal === 'add' ? 'إضافة منتج' : 'تعديل منتج'}>
              <div className="modal-header">
                <h3>{productModal === 'add' ? 'إضافة منتج جديد' : 'تعديل المنتج'}</h3>
                <button className="modal-close" onClick={closeProductModal} aria-label="إغلاق">
                  <i className="fas fa-xmark" aria-hidden="true"></i>
                </button>
              </div>
              {productSaved && <AlertSuccess msg="تم الحفظ بنجاح في قاعدة البيانات!" />}
              {productErr   && <AlertError  msg={productErr} />}
              <form onSubmit={handleProductSave}>
                <div className="form-group">
                  <label className="form-label">اسم المنتج *</label>
                  <input className="form-input" name="name" value={productForm.name} onChange={handleProductChange} required placeholder="اسم المنتج" />
                </div>
                <div className="modal-grid2">
                  <div className="form-group">
                    <label className="form-label">الأيقونة (Emoji)</label>
                    <input className="form-input" name="icon" value={productForm.icon} onChange={handleProductChange} placeholder="📦" dir="ltr" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">الشارة (اختياري)</label>
                    <input className="form-input" name="badge" value={productForm.badge} onChange={handleProductChange} placeholder="جديد / عرض" />
                  </div>
                </div>
                <div className="modal-grid2">
                  <div className="form-group">
                    <label className="form-label">الفئة</label>
                    <select className="form-select" name="category" value={productForm.category} onChange={handleProductChange}>
                      {Object.entries(categoryLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">الحالة</label>
                    <select className="form-select" name="status" value={productForm.status} onChange={handleProductChange}>
                      {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                </div>
                <div className="modal-grid2">
                  <div className="form-group">
                    <label className="form-label">السعر (د.ك) *</label>
                    <input className="form-input" type="number" step="0.001" min="0" name="price" value={productForm.price} onChange={handleProductChange} required placeholder="0.000" dir="ltr" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">المخزون *</label>
                    <input className="form-input" type="number" min="0" name="stock" value={productForm.stock} onChange={handleProductChange} required placeholder="0" dir="ltr" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">وصف المنتج</label>
                  <textarea className="form-textarea" name="desc" value={productForm.desc} onChange={handleProductChange} placeholder="وصف مختصر للمنتج..." style={{ minHeight: '80px' }} />
                </div>
                <div className="modal-actions">
                  <button type="button" onClick={closeProductModal} className="btn btn-outline">إلغاء</button>
                  <button type="submit" className="btn btn-green">
                    <i className="fas fa-save" aria-hidden="true"></i> حفظ
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ══ User Modal ══ */}
        {userModal && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeUserModal()}>
            <div className="modal" role="dialog" aria-modal="true" aria-label={userModal === 'add' ? 'إضافة مستخدم' : 'تعديل مستخدم'}>
              <div className="modal-header">
                <h3>{userModal === 'add' ? 'إضافة مستخدم جديد' : 'تعديل المستخدم'}</h3>
                <button className="modal-close" onClick={closeUserModal} aria-label="إغلاق">
                  <i className="fas fa-xmark" aria-hidden="true"></i>
                </button>
              </div>
              {userSaved && <AlertSuccess msg="تم حفظ المستخدم بنجاح!" />}
              {userErr   && <AlertError  msg={userErr} />}
              <form onSubmit={handleUserSave}>
                <div className="modal-grid2">
                  <div className="form-group">
                    <label className="form-label">الاسم الكامل *</label>
                    <input className="form-input" name="name" value={userForm.name} onChange={handleUserChange} required placeholder="الاسم الكامل" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">اسم المستخدم *</label>
                    <input className="form-input" name="username" value={userForm.username} onChange={handleUserChange} required placeholder="username" dir="ltr" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">
                    {userModal === 'edit' ? 'كلمة المرور الجديدة (اتركها فارغة للإبقاء)' : 'كلمة المرور *'}
                  </label>
                  <div className="input-pwd-wrap">
                    <input
                      className="form-input"
                      type={showPwd ? 'text' : 'password'}
                      name="password"
                      value={userForm.password}
                      onChange={handleUserChange}
                      placeholder="كلمة المرور"
                      dir="ltr"
                      required={userModal === 'add'}
                    />
                    <button type="button" className="pwd-toggle" onClick={() => setShowPwd(p => !p)} aria-label="إظهار/إخفاء كلمة المرور">
                      <i className={`fas ${showPwd ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden="true"></i>
                    </button>
                  </div>
                </div>
                <div className="modal-grid2">
                  <div className="form-group">
                    <label className="form-label">البريد الإلكتروني</label>
                    <input className="form-input" type="email" name="email" value={userForm.email} onChange={handleUserChange} placeholder="email@example.com" dir="ltr" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">الصلاحية</label>
                    <select className="form-select" name="role" value={userForm.role} onChange={handleUserChange}>
                      {Object.entries(roleLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="button" onClick={closeUserModal} className="btn btn-outline">إلغاء</button>
                  <button type="submit" className="btn btn-green">
                    <i className="fas fa-save" aria-hidden="true"></i> حفظ
                  </button>
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
