import { useState, useMemo, useEffect } from 'react';
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
  admin:  { products: true,  categories: true,  inventory: true,  orders: true,  invoices: true,  users: true,  content: true,  reports: true,  shipping: true,  payments: true,  coupons: true  },
  editor: { products: true,  categories: true,  inventory: true,  orders: true,  invoices: true,  users: false, content: true,  reports: true,  shipping: false, payments: false, coupons: true  },
  viewer: { products: false, categories: false, inventory: true,  orders: true,  invoices: true,  users: false, content: false, reports: true,  shipping: false, payments: false, coupons: false },
};

const emptyProduct = { name: '', nameEn: '', sku: '', category: 'facial', price: '', stock: '', status: 'active', image: '', gallery: [], desc: '', descEn: '', badge: '' };
const emptyUser    = { username: '', password: '', name: '', email: '', phone: '', role: 'viewer', status: 'active' };
const emptyCoupon  = { code: '', type: 'percent', value: '', minOrder: '', maxUses: '', expiry: '', status: 'active', desc: '' };

const navItems = [
  { id: 'overview',  label: 'نظرة عامة',        icon: 'fa-chart-pie' },
  {
    id: 'products',  label: 'المنتجات',          icon: 'fa-box',
    children: [
      { id: 'list',        label: 'كل المنتجات', icon: 'fa-list-ul',     perm: 'products'   },
      { id: 'collections', label: 'الفئات',      icon: 'fa-folder-open', perm: 'categories' },
      { id: 'inventory',   label: 'المخزون',     icon: 'fa-warehouse',   perm: 'inventory'  },
    ],
  },
  { id: 'orders',    label: 'الطلبات',           icon: 'fa-list-check' },
  { id: 'invoices',  label: 'الفواتير',          icon: 'fa-file-invoice' },
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
const emptyCategory = { slug: '', nameAr: '', nameEn: '', emoji: '📦', icon: 'fa-box', sortOrder: 1, status: 'active', desc: '' };

const Dashboard = () => {
  const {
    products, orders, users, coupons, categories, siteContent,
    loading, error, auth,
    addProduct, updateProduct, deleteProduct,
    addUser, updateUser, deleteUser,
    addCoupon, updateCoupon, deleteCoupon,
    addCategory, updateCategory, deleteCategory,
    updateOrderStatus,
    saveSiteContent,
  } = useApp();

  const myRole = auth?.role || 'viewer';
  const perms  = ROLE_PERMISSIONS[myRole] || ROLE_PERMISSIONS.viewer;

  const [view, setView]               = useState('overview');
  const [productsTab, setProductsTab] = useState('list'); // 'list' | 'collections' | 'inventory'

  /* ── Category modal ── */
  const [catModal,  setCatModal]  = useState(null); // 'add' | 'edit'
  const [editCat,   setEditCat]   = useState(null);
  const [catForm,   setCatForm]   = useState(emptyCategory);
  const [catSaved,  setCatSaved]  = useState(false);
  const [catErr,    setCatErr]    = useState('');

  const openAddCat  = () => { setCatForm(emptyCategory); setCatErr(''); setCatSaved(false); setCatModal('add'); };
  const openEditCat = (c) => {
    setCatForm({ slug: c.slug, nameAr: c.nameAr, nameEn: c.nameEn, emoji: c.emoji || '📦', icon: c.icon || 'fa-box', sortOrder: c.sortOrder || 1, status: c.status, desc: c.desc || '' });
    setEditCat(c); setCatErr(''); setCatSaved(false); setCatModal('edit');
  };
  const closeCatModal = () => { setCatModal(null); setEditCat(null); };

  const handleCatSave = async (e) => {
    e.preventDefault(); setCatErr('');
    if (!catForm.nameAr.trim()) { setCatErr('الاسم العربي مطلوب'); return; }
    if (!catForm.slug.trim())   { setCatErr('المعرف (Slug) مطلوب'); return; }
    if (!/^[a-z0-9_-]+$/.test(catForm.slug)) { setCatErr('الـ Slug: أحرف إنجليزية صغيرة وأرقام وشرطة فقط'); return; }
    try {
      if (catModal === 'add') await addCategory({ ...catForm });
      else await updateCategory(editCat.id, { ...editCat, ...catForm });
      setCatSaved(true); setTimeout(closeCatModal, 900);
    } catch { setCatErr('حدث خطأ أثناء الحفظ.'); }
  };

  const handleDeleteCat = async (c) => {
    const usedBy = products.filter(p => p.category === c.slug).length;
    if (usedBy > 0) { alert(`لا يمكن حذف الفئة — ${usedBy} منتج مرتبط بها. يرجى تغيير فئة المنتجات أولاً.`); return; }
    if (!window.confirm(`حذف فئة "${c.nameAr}"؟`)) return;
    try { await deleteCategory(c.id); } catch { alert('تعذر الحذف.'); }
  };

  /* ── Inventory ── */
  const [invStock,   setInvStock]   = useState(null); // { [productId]: stock }
  const [invSaving,  setInvSaving]  = useState(false);
  const [invSaved,   setInvSaved]   = useState(false);

  const openInventory = () => {
    const map = {};
    products.forEach(p => { map[p.id] = p.stock; });
    setInvStock(map);
    setInvSaved(false);
    setProductsTab('inventory');
    setView('products');
  };

  const handleInvSave = async () => {
    setInvSaving(true);
    try {
      await Promise.all(
        products.map(p => {
          const newStock = parseInt(invStock[p.id]) || 0;
          if (newStock !== p.stock) return updateProduct(p.id, { ...p, stock: newStock });
          return Promise.resolve();
        })
      );
      setInvSaved(true);
      setTimeout(() => setInvSaved(false), 2500);
    } catch { alert('حدث خطأ أثناء الحفظ.'); }
    setInvSaving(false);
  };

  /* ── Product modal ── */
  const [productModal, setProductModal] = useState(null);
  const [editProduct,  setEditProduct]  = useState(null);
  const [productForm,  setProductForm]  = useState(emptyProduct);
  const [productSaved, setProductSaved] = useState(false);
  const [productErr,   setProductErr]   = useState('');

  const openAddProduct  = () => { setProductForm(emptyProduct); setProductErr(''); setProductSaved(false); setProductModal('add'); };
  const openEditProduct = (p) => {
    setProductForm({ name: p.name, nameEn: p.nameEn || '', sku: p.sku || '', category: p.category, price: p.price, stock: p.stock, status: p.status, image: p.image || '', gallery: p.gallery || [], desc: p.desc || '', descEn: p.descEn || '', badge: p.badge || '' });
    setEditProduct(p); setProductErr(''); setProductSaved(false); setProductModal('edit');
  };
  const closeProductModal = () => { setProductModal(null); setEditProduct(null); setProductImagePreview(''); setProductGalleryPreviews([]); };

  const [productImagePreview,   setProductImagePreview]   = useState('');
  const [productGalleryPreviews,setProductGalleryPreviews]= useState([]);
  const [uploadingImg,          setUploadingImg]          = useState(false);

  const uploadFile = async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    const IS_PROD = process.env.NODE_ENV === 'production';
    const url = IS_PROD ? '/api/upload.php' : 'http://localhost:3001/api/upload.php';
    // In dev, just return a local object URL for preview (no actual server upload)
    if (!IS_PROD) return URL.createObjectURL(file);
    const res = await fetch(url, { method: 'POST', body: fd });
    const json = await res.json();
    return json.url || null;
  };

  const uploadFiles = async (files) => {
    const IS_PROD = process.env.NODE_ENV === 'production';
    if (!IS_PROD) return Array.from(files).map(f => URL.createObjectURL(f));
    const fd = new FormData();
    Array.from(files).forEach(f => fd.append('files[]', f));
    const res = await fetch('/api/upload.php', { method: 'POST', body: fd });
    const json = await res.json();
    return json.urls || (json.url ? [json.url] : []);
  };

  const handleMainImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImg(true);
    const url = await uploadFile(file);
    if (url) { setProductForm(p => ({ ...p, image: url })); setProductImagePreview(url); }
    setUploadingImg(false);
  };

  const handleGalleryChange = async (e) => {
    const files = e.target.files;
    if (!files.length) return;
    setUploadingImg(true);
    const urls = await uploadFiles(files);
    setProductForm(p => ({ ...p, gallery: [...(p.gallery || []), ...urls] }));
    setProductGalleryPreviews(prev => [...prev, ...urls]);
    setUploadingImg(false);
  };

  const removeGalleryImage = (idx) => {
    setProductForm(p => ({ ...p, gallery: p.gallery.filter((_, i) => i !== idx) }));
    setProductGalleryPreviews(prev => prev.filter((_, i) => i !== idx));
  };

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

  /* ── Invoice ── */
  const printInvoice = (order) => {
    const sc = siteContent || {};
    const items = order.items && order.items.length > 0
      ? order.items
      : [{ name: order.product, qty: order.qty, price: parseFloat(order.grandTotal || order.total) / (order.qty || 1) }];

    const rows = items.map(i => `
      <tr>
        <td>${i.name}</td>
        <td style="text-align:center">${i.qty}</td>
        <td style="text-align:center">${Number(i.price).toFixed(3)}</td>
        <td style="text-align:center">${(i.price * i.qty).toFixed(3)}</td>
      </tr>`).join('');

    const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8"/>
<title>فاتورة ${order.ref}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Tajawal', Arial, sans-serif; color: #1a1a1a; background: #fff; padding: 40px; font-size: 14px; }
  .inv-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #16a34a; padding-bottom: 20px; margin-bottom: 24px; }
  .inv-logo { font-size: 22px; font-weight: 800; color: #16a34a; }
  .inv-logo span { display: block; font-size: 12px; color: #666; font-weight: 400; margin-top: 4px; }
  .inv-meta { text-align: left; font-size: 13px; color: #555; }
  .inv-meta strong { display: block; font-size: 20px; color: #16a34a; font-weight: 800; margin-bottom: 4px; }
  .inv-parties { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
  .inv-box { background: #f9fafb; border-radius: 8px; padding: 16px; }
  .inv-box h4 { font-size: 12px; color: #888; font-weight: 600; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; }
  .inv-box p { font-size: 13px; margin-bottom: 4px; }
  .inv-box strong { font-size: 15px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  thead tr { background: #16a34a; color: white; }
  th { padding: 10px 12px; text-align: right; font-size: 13px; }
  td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
  tbody tr:nth-child(even) { background: #f9fafb; }
  .inv-totals { width: 280px; margin-right: auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
  .inv-totals tr td { border: none; padding: 8px 14px; }
  .inv-totals tr:not(:last-child) td { border-bottom: 1px solid #e5e7eb; }
  .inv-totals .grand td { background: #16a34a; color: white; font-weight: 800; font-size: 15px; }
  .inv-footer { margin-top: 40px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 16px; }
  .inv-stamp { display: inline-block; border: 2px solid #16a34a; color: #16a34a; padding: 6px 20px; border-radius: 6px; font-weight: 700; font-size: 13px; margin-bottom: 12px; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
<div class="inv-header">
  <div class="inv-logo">
    شركة الجوهرة للمناديل الورقية
    <span>${sc.companyAddress || 'المنطقة الصناعية — الشعيبة، الكويت'}</span>
    <span>${sc.companyPhone || '(965) 23263824'} | ${sc.companyEmail || 'info@al-jawhara.com'}</span>
  </div>
  <div class="inv-meta">
    <strong>فاتورة</strong>
    <div>رقم الطلب: <b>${order.ref}</b></div>
    <div>التاريخ: <b>${order.date}</b></div>
    <div>طريقة الدفع: <b>${order.payment || '—'}</b></div>
  </div>
</div>

<div class="inv-parties">
  <div class="inv-box">
    <h4>صادرة من</h4>
    <p><strong>شركة الجوهرة للمناديل الورقية</strong></p>
    <p>${sc.companyAddress || 'المنطقة الصناعية — الشعيبة، الكويت'}</p>
    <p>${sc.companyPhone || '(965) 23263824'}</p>
    <p>${sc.companyEmail || 'info@al-jawhara.com'}</p>
  </div>
  <div class="inv-box">
    <h4>فاتورة إلى</h4>
    <p><strong>${order.client || '—'}</strong></p>
    ${order.company ? `<p>${order.company}</p>` : ''}
    ${order.phone   ? `<p>${order.phone}</p>` : ''}
    ${order.email   ? `<p>${order.email}</p>` : ''}
    ${order.governorate ? `<p>${order.governorate}${order.block ? ' — ' + order.block : ''}</p>` : ''}
    ${order.address ? `<p>${order.address}</p>` : ''}
  </div>
</div>

<table>
  <thead><tr><th>المنتج</th><th style="text-align:center">الكمية</th><th style="text-align:center">سعر الوحدة (د.ك)</th><th style="text-align:center">الإجمالي (د.ك)</th></tr></thead>
  <tbody>${rows}</tbody>
</table>

<table class="inv-totals">
  <tbody>
    ${order.deliveryFee ? `<tr><td>رسوم التوصيل</td><td style="text-align:center">${Number(order.deliveryFee).toFixed(3)} د.ك</td></tr>` : ''}
    <tr class="grand"><td>الإجمالي الكلي</td><td style="text-align:center">${Number(order.grandTotal || order.total).toFixed(3)} د.ك</td></tr>
  </tbody>
</table>

<div class="inv-footer">
  <div class="inv-stamp">${orderStatusLabels[order.status] || order.status}</div>
  <p>شكراً لتعاملكم مع شركة الجوهرة للمناديل الورقية</p>
  <p>www.al-jawhara.co | ${sc.companyPhone || '(965) 23263824'}</p>
</div>
</body></html>`;

    const w = window.open('', '_blank', 'width=900,height=700');
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 500);
  };

  /* ── Derived stats ── */
  const activeCount    = products.filter(p => p.status === 'active').length;
  const totalStock     = products.reduce((s, p) => s + (p.stock || 0), 0).toLocaleString();
  const pendingOrders  = orders.filter(o => o.status === 'pending').length;
  const totalRevenue   = orders.reduce((s, o) => s + parseFloat(o.grandTotal || o.total || 0), 0).toFixed(3);

  /* ── Search ── */
  const [dashSearch, setDashSearch] = useState('');
  useEffect(() => { setDashSearch(''); }, [view]);

  const ns = (s = '') => String(s).toLowerCase()
    .replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');

  const filteredDashProducts = useMemo(() => {
    const q = ns(dashSearch);
    if (!q) return products;
    return products.filter(p =>
      [p.name, p.nameEn, p.sku, categoryLabels[p.category], productStatusLabels[p.status], p.desc].some(f => ns(f).includes(q))
    );
  }, [products, dashSearch]);

  const filteredOrders = useMemo(() => {
    const q = ns(dashSearch);
    if (!q) return orders;
    return orders.filter(o =>
      [o.ref, o.client, o.governorate, o.product, o.payment, orderStatusLabels[o.status]].some(f => ns(f).includes(q))
    );
  }, [orders, dashSearch]);

  const filteredUsers = useMemo(() => {
    const q = ns(dashSearch);
    if (!q) return users;
    return users.filter(u =>
      [u.name, u.username, u.email, u.phone, roleLabels[u.role], userStatusLabels[u.status]].some(f => ns(f).includes(q))
    );
  }, [users, dashSearch]);

  const filteredCoupons = useMemo(() => {
    const q = ns(dashSearch);
    if (!q) return coupons;
    return coupons.filter(c =>
      [c.code, c.type === 'percent' ? 'نسبة' : 'مبلغ', c.desc, c.status === 'active' ? 'نشط' : 'متوقف'].some(f => ns(f).includes(q))
    );
  }, [coupons, dashSearch]);

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
            const blocked = item.id !== 'overview' && !perms[item.id === 'products' ? 'products' : item.id];
            const isProductsParent = item.id === 'products';
            const isProductsActive = view === 'products';

            return (
              <div key={item.id}>
                <button
                  className={`sidebar-nav-item${isProductsParent ? (isProductsActive ? ' active' : '') : (view === item.id ? ' active' : '')}${blocked ? ' disabled' : ''}`}
                  onClick={() => {
                    if (blocked) return;
                    if (item.id === 'content')   openContentTab();
                    else if (item.id === 'shipping') openShippingTab();
                    else if (item.id === 'payments') openPaymentsTab();
                    else { setView(item.id); if (isProductsParent) setProductsTab('list'); }
                  }}
                  aria-current={view === item.id ? 'page' : undefined}
                  title={blocked ? 'ليس لديك صلاحية' : undefined}
                >
                  <i className={`fas ${item.icon}`} aria-hidden="true"></i>
                  {item.label}
                  {item.children && <i className={`fas fa-chevron-${isProductsActive ? 'down' : 'left'} sidebar-chevron`} aria-hidden="true"></i>}
                  {blocked && <i className="fas fa-lock sidebar-lock" aria-hidden="true"></i>}
                </button>

                {/* Sub-items for Products */}
                {isProductsParent && isProductsActive && item.children && (
                  <div className="sidebar-sub-items">
                    {item.children.map(child => {
                      const childBlocked = !perms[child.perm];
                      return (
                        <button
                          key={child.id}
                          className={`sidebar-sub-item${productsTab === child.id ? ' active' : ''}${childBlocked ? ' disabled' : ''}`}
                          onClick={() => {
                            if (childBlocked) return;
                            if (child.id === 'inventory') openInventory();
                            else { setProductsTab(child.id); setView('products'); }
                          }}
                          title={childBlocked ? 'ليس لديك صلاحية' : undefined}
                        >
                          <i className={`fas ${child.icon}`} aria-hidden="true"></i>
                          {child.label}
                          {childBlocked && <i className="fas fa-lock" style={{ fontSize: '10px', opacity: 0.5 }} aria-hidden="true"></i>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
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

              {/* ── Products list ── */}
              {productsTab === 'list' && (
              <div>
              <div className="dash-header-row">
                <div className="dashboard-title">كل المنتجات</div>
                {perms.products && (
                  <button className="btn btn-green btn-sm" onClick={openAddProduct}>
                    <i className="fas fa-plus" aria-hidden="true"></i> إضافة منتج
                  </button>
                )}
              </div>
              <div className="dash-search-bar">
                <i className="fas fa-magnifying-glass dash-search-icon" aria-hidden="true"></i>
                <input type="search" className="dash-search-input" placeholder="ابحث بالاسم أو الفئة أو الحالة..." value={dashSearch} onChange={e => setDashSearch(e.target.value)} autoComplete="off" />
                {dashSearch && <button className="dash-search-clear" onClick={() => setDashSearch('')}><i className="fas fa-xmark"></i></button>}
                {dashSearch && <span className="dash-search-count">{filteredDashProducts.length} نتيجة</span>}
              </div>
              <div className="data-table">
                <table>
                  <thead><tr><th>#</th><th>المنتج</th><th>الفئة</th><th>السعر</th><th>المخزون</th><th>الحالة</th><th>إجراءات</th></tr></thead>
                  <tbody>
                    {filteredDashProducts.map((p, i) => (
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

              {/* ── Collections / Categories ── */}
              {productsTab === 'collections' && (
              <div>
                <div className="dash-header-row">
                  <div className="dashboard-title">الفئات</div>
                  {perms.categories && (
                    <button className="btn btn-green btn-sm" onClick={openAddCat}>
                      <i className="fas fa-plus" aria-hidden="true"></i> إضافة فئة
                    </button>
                  )}
                </div>
                <p className="dash-section-desc">إدارة فئات المنتجات — تظهر في صفحة المنتجات وفلاتر البحث.</p>
                <div className="data-table">
                  <table>
                    <thead>
                      <tr><th>الفئة</th><th>الاسم الإنجليزي</th><th>المعرف</th><th>المنتجات</th><th>الترتيب</th><th>الحالة</th><th>إجراءات</th></tr>
                    </thead>
                    <tbody>
                      {categories.length === 0 && (
                        <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-light)', padding: '40px' }}>لا توجد فئات</td></tr>
                      )}
                      {categories.sort((a,b) => a.sortOrder - b.sortOrder).map(c => {
                        const prodCount = products.filter(p => p.category === c.slug).length;
                        return (
                          <tr key={c.id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span className="cat-emoji-badge">{c.emoji}</span>
                                <span className="td-bold">{c.nameAr}</span>
                              </div>
                            </td>
                            <td className="td-light" dir="ltr">{c.nameEn}</td>
                            <td><span className="badge-cat" dir="ltr">{c.slug}</span></td>
                            <td className="td-bold">{prodCount} منتج</td>
                            <td className="td-light">{c.sortOrder}</td>
                            <td><span className={`status-badge status-${c.status}`}>{c.status === 'active' ? 'نشطة' : 'مخفية'}</span></td>
                            <td>
                              <button className="action-btn action-btn-edit" onClick={() => openEditCat(c)}><i className="fas fa-pen"></i> تعديل</button>
                              <button className="action-btn action-btn-delete" onClick={() => handleDeleteCat(c)}><i className="fas fa-trash"></i> حذف</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              )}

              {/* ── Inventory ── */}
              {productsTab === 'inventory' && invStock && (
              <div>
                <div className="dash-header-row">
                  <div className="dashboard-title">إدارة المخزون</div>
                  <button className="btn btn-green btn-sm" onClick={handleInvSave} disabled={invSaving}>
                    {invSaving
                      ? <><i className="fas fa-spinner fa-spin"></i> جاري الحفظ...</>
                      : <><i className="fas fa-save"></i> حفظ التغييرات</>}
                  </button>
                </div>
                {invSaved && <AlertSuccess msg="تم حفظ المخزون بنجاح!" />}
                <p className="dash-section-desc">تعديل كميات المخزون لكل المنتجات دفعة واحدة.</p>
                <div className="data-table">
                  <table>
                    <thead>
                      <tr><th>المنتج</th><th>الفئة</th><th>الكمية الحالية</th><th>تعديل سريع</th><th>الكمية الجديدة</th><th>الحالة</th></tr>
                    </thead>
                    <tbody>
                      {products.map(p => {
                        const stock = invStock[p.id] ?? p.stock;
                        const isLow  = stock < 100;
                        const isZero = stock <= 0;
                        return (
                          <tr key={p.id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '1.4rem' }}>{p.icon}</span>
                                <span className="td-bold">{p.name}</span>
                              </div>
                            </td>
                            <td><span className="badge-cat">{categoryLabels[p.category] || p.category}</span></td>
                            <td className={isZero ? 'td-warn' : isLow ? 'td-warn' : 'td-bold'}>{p.stock.toLocaleString()}</td>
                            <td>
                              <div className="inv-adjust-row">
                                <button className="inv-btn inv-minus" onClick={() => setInvStock(s => ({ ...s, [p.id]: Math.max(0, (s[p.id]??p.stock) - 100) }))}>−100</button>
                                <button className="inv-btn inv-minus" onClick={() => setInvStock(s => ({ ...s, [p.id]: Math.max(0, (s[p.id]??p.stock) - 10) }))}>−10</button>
                                <button className="inv-btn inv-plus"  onClick={() => setInvStock(s => ({ ...s, [p.id]: (s[p.id]??p.stock) + 10 }))}>+10</button>
                                <button className="inv-btn inv-plus"  onClick={() => setInvStock(s => ({ ...s, [p.id]: (s[p.id]??p.stock) + 100 }))}>+100</button>
                              </div>
                            </td>
                            <td>
                              <input
                                type="number"
                                className="inv-stock-input"
                                value={stock}
                                min="0"
                                onChange={e => setInvStock(s => ({ ...s, [p.id]: parseInt(e.target.value) || 0 }))}
                                dir="ltr"
                              />
                            </td>
                            <td>
                              {isZero  ? <span className="inv-badge inv-out">نفذ</span>
                              : isLow  ? <span className="inv-badge inv-low">منخفض</span>
                              : <span className="inv-badge inv-ok">متوفر</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              )}

            </div>
          )}

          {/* ══ ORDERS ══ */}
          {view === 'orders' && (
            <div>
              <div className="dash-header-row">
                <div className="dashboard-title">الطلبات ({orders.length})</div>
              </div>
              <div className="dash-search-bar">
                <i className="fas fa-magnifying-glass dash-search-icon" aria-hidden="true"></i>
                <input type="search" className="dash-search-input" placeholder="ابحث برقم الطلب أو العميل أو المحافظة أو الحالة..." value={dashSearch} onChange={e => setDashSearch(e.target.value)} autoComplete="off" />
                {dashSearch && <button className="dash-search-clear" onClick={() => setDashSearch('')}><i className="fas fa-xmark"></i></button>}
                {dashSearch && <span className="dash-search-count">{filteredOrders.length} نتيجة</span>}
              </div>
              <div className="data-table">
                <table>
                  <thead><tr><th>رقم الطلب</th><th>العميل</th><th>المحافظة</th><th>المنتج</th><th>الإجمالي</th><th>الدفع</th><th>التاريخ</th><th>الحالة</th><th></th></tr></thead>
                  <tbody>
                    {filteredOrders.map(o => (
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
                        <td>
                          <button className="action-btn action-btn-edit" onClick={() => printInvoice(o)}>
                            <i className="fas fa-print"></i> طباعة
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══ INVOICES ══ */}
          {view === 'invoices' && (
            <div>
              <div className="dash-header-row">
                <div className="dashboard-title">الفواتير ({orders.length})</div>
              </div>
              <p className="dash-section-desc">عرض وطباعة فاتورة لكل طلب بتصميم احترافي.</p>
              <div className="dash-search-bar">
                <i className="fas fa-magnifying-glass dash-search-icon" aria-hidden="true"></i>
                <input type="search" className="dash-search-input" placeholder="ابحث برقم الطلب أو العميل أو الهاتف..." value={dashSearch} onChange={e => setDashSearch(e.target.value)} autoComplete="off" />
                {dashSearch && <button className="dash-search-clear" onClick={() => setDashSearch('')}><i className="fas fa-xmark"></i></button>}
                {dashSearch && <span className="dash-search-count">{filteredOrders.length} نتيجة</span>}
              </div>
              <div className="data-table">
                <table>
                  <thead>
                    <tr>
                      <th>رقم الطلب</th>
                      <th>العميل</th>
                      <th>الهاتف</th>
                      <th>المحافظة</th>
                      <th>المنتجات</th>
                      <th>الدفع</th>
                      <th>التاريخ</th>
                      <th>الإجمالي</th>
                      <th>الحالة</th>
                      <th>طباعة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 && <tr><td colSpan="10" className="td-light" style={{textAlign:'center',padding:'30px'}}>لا توجد طلبات بعد.</td></tr>}
                    {filteredOrders.map(o => (
                      <tr key={o.id}>
                        <td className="td-primary">{o.ref}</td>
                        <td>
                          <div className="td-bold">{o.client || '—'}</div>
                          {o.company && <div className="td-light" style={{fontSize:'11px'}}>{o.company}</div>}
                        </td>
                        <td className="td-light" dir="ltr">{o.phone || '—'}</td>
                        <td className="td-light">{o.governorate ? `${o.governorate}${o.block ? ` — ${o.block}` : ''}` : '—'}</td>
                        <td className="td-light">{o.product}</td>
                        <td><span className="badge-pay">{o.payment || '—'}</span></td>
                        <td className="td-light" dir="ltr">{o.date}</td>
                        <td className="td-bold">{Number(o.grandTotal || o.total || 0).toFixed(3)} د.ك</td>
                        <td><span className={`status-badge status-${o.status}`}>{orderStatusLabels[o.status] || o.status}</span></td>
                        <td>
                          <button className="action-btn action-btn-edit" onClick={() => printInvoice(o)}>
                            <i className="fas fa-print"></i> طباعة
                          </button>
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
              <div className="dash-search-bar">
                <i className="fas fa-magnifying-glass dash-search-icon" aria-hidden="true"></i>
                <input type="search" className="dash-search-input" placeholder="ابحث بالاسم أو اسم المستخدم أو البريد..." value={dashSearch} onChange={e => setDashSearch(e.target.value)} autoComplete="off" />
                {dashSearch && <button className="dash-search-clear" onClick={() => setDashSearch('')}><i className="fas fa-xmark"></i></button>}
                {dashSearch && <span className="dash-search-count">{filteredUsers.length} نتيجة</span>}
              </div>
              <div className="data-table">
                <table>
                  <thead><tr><th>#</th><th>الاسم</th><th>اسم المستخدم</th><th>الهاتف</th><th>الصلاحية</th><th>الحالة</th><th>إجراءات</th></tr></thead>
                  <tbody>
                    {filteredUsers.map((u, i) => (
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

                {/* Benefit Pay */}
                {[
                  { key: 'benefitpay', name: 'Benefit Pay', sub: 'بيفيت باي', color: '#00843d', bg: '#dcfce7' },
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
              <div className="dash-search-bar">
                <i className="fas fa-magnifying-glass dash-search-icon" aria-hidden="true"></i>
                <input type="search" className="dash-search-input" placeholder="ابحث بالكود أو النوع أو الحالة..." value={dashSearch} onChange={e => setDashSearch(e.target.value)} autoComplete="off" />
                {dashSearch && <button className="dash-search-clear" onClick={() => setDashSearch('')}><i className="fas fa-xmark"></i></button>}
                {dashSearch && <span className="dash-search-count">{filteredCoupons.length} نتيجة</span>}
              </div>
              <div className="data-table">
                <table>
                  <thead><tr><th>الكود</th><th>النوع</th><th>الخصم</th><th>الحد الأدنى</th><th>الاستخدام</th><th>الانتهاء</th><th>الحالة</th><th>إجراءات</th></tr></thead>
                  <tbody>
                    {filteredCoupons.map(c => (
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

        {/* ══ Category Modal ══ */}
        {catModal && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeCatModal()}>
            <div className="modal" role="dialog">
              <div className="modal-header">
                <h3>{catModal === 'add' ? 'إضافة فئة جديدة' : 'تعديل الفئة'}</h3>
                <button className="modal-close" onClick={closeCatModal}><i className="fas fa-xmark"></i></button>
              </div>
              {catSaved && <AlertSuccess msg="تم الحفظ بنجاح!" />}
              {catErr   && <AlertError  msg={catErr} />}
              <form onSubmit={handleCatSave}>
                <div className="modal-grid2">
                  <div className="form-group">
                    <label className="form-label">الاسم بالعربي *</label>
                    <input className="form-input" value={catForm.nameAr} onChange={e => setCatForm(p=>({...p, nameAr: e.target.value}))} placeholder="مثال: مناديل وجه" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">الاسم بالإنجليزي</label>
                    <input className="form-input" dir="ltr" value={catForm.nameEn} onChange={e => setCatForm(p=>({...p, nameEn: e.target.value}))} placeholder="Facial Tissues" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">المعرف (Slug) * <span style={{fontSize:'11px',color:'var(--text-light)'}}>أحرف إنجليزية صغيرة فقط</span></label>
                    <input className="form-input" dir="ltr" value={catForm.slug} onChange={e => setCatForm(p=>({...p, slug: e.target.value.toLowerCase().replace(/\s/g,'-')}))} placeholder="facial-tissues" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">إيموجي / رمز</label>
                    <input className="form-input" value={catForm.emoji} onChange={e => setCatForm(p=>({...p, emoji: e.target.value}))} placeholder="📦" style={{fontSize:'20px'}} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">الترتيب</label>
                    <input className="form-input" type="number" min="1" dir="ltr" value={catForm.sortOrder} onChange={e => setCatForm(p=>({...p, sortOrder: parseInt(e.target.value)||1}))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">الحالة</label>
                    <select className="form-select" value={catForm.status} onChange={e => setCatForm(p=>({...p, status: e.target.value}))}>
                      <option value="active">نشطة — تظهر في الموقع</option>
                      <option value="inactive">مخفية</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">الوصف (اختياري)</label>
                  <textarea className="form-textarea" style={{minHeight:'70px'}} value={catForm.desc} onChange={e => setCatForm(p=>({...p, desc: e.target.value}))} placeholder="وصف مختصر للفئة..." />
                </div>
                <div style={{ display:'flex', justifyContent:'flex-end', gap:'10px', marginTop:'20px' }}>
                  <button type="button" className="btn btn-sm btn-outline" style={{color:'var(--text)',borderColor:'var(--border)'}} onClick={closeCatModal}>إلغاء</button>
                  <button type="submit" className="btn btn-green btn-sm"><i className="fas fa-save"></i> حفظ</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ══ Product Modal ══ */}
        {productModal && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeProductModal()}>
            <div className="modal modal-xl" role="dialog">
              <div className="modal-header">
                <h3>{productModal === 'add' ? 'إضافة منتج جديد' : 'تعديل المنتج'}</h3>
                <button className="modal-close" onClick={closeProductModal}><i className="fas fa-xmark"></i></button>
              </div>
              {productSaved && <AlertSuccess msg="تم الحفظ بنجاح!" />}
              {productErr   && <AlertError  msg={productErr} />}
              <form onSubmit={handleProductSave}>

                {/* ── Images ── */}
                <div className="product-lang-divider">🖼️ الصور</div>
                <div className="modal-grid2">
                  <div className="form-group">
                    <label className="form-label">الصورة الرئيسية</label>
                    <label className="img-upload-box">
                      {(productForm.image || productImagePreview)
                        ? <img src={productForm.image || productImagePreview} alt="main" className="img-upload-preview" />
                        : <div className="img-upload-placeholder"><i className="fas fa-image"></i><span>اختر صورة</span></div>}
                      <input type="file" accept="image/*" onChange={handleMainImageChange} style={{display:'none'}} />
                      {(productForm.image || productImagePreview) && (
                        <button type="button" className="img-upload-remove" onClick={e => { e.preventDefault(); setProductForm(p=>({...p,image:''})); setProductImagePreview(''); }}>
                          <i className="fas fa-xmark"></i>
                        </button>
                      )}
                    </label>
                    {uploadingImg && <div style={{fontSize:'11px',color:'var(--text-light)',marginTop:'4px'}}><i className="fas fa-spinner fa-spin"></i> جاري الرفع...</div>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">معرض الصور (Gallery)</label>
                    <div className="gallery-upload-grid">
                      {(productForm.gallery || []).map((url, idx) => (
                        <div key={idx} className="gallery-thumb">
                          <img src={url} alt={`gallery-${idx}`} />
                          <button type="button" className="img-upload-remove" onClick={() => removeGalleryImage(idx)}><i className="fas fa-xmark"></i></button>
                        </div>
                      ))}
                      {(productForm.gallery || []).length < 6 && (
                        <label className="gallery-add-btn">
                          <i className="fas fa-plus"></i>
                          <input type="file" accept="image/*" multiple onChange={handleGalleryChange} style={{display:'none'}} />
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Arabic ── */}
                <div className="product-lang-divider">🇸🇦 عربي</div>
                <div className="modal-grid2">
                  <div className="form-group"><label className="form-label">اسم المنتج (عربي) *</label><input className="form-input" name="name" value={productForm.name} onChange={e => setProductForm(p=>({...p,[e.target.name]:e.target.value}))} required /></div>
                  <div className="form-group"><label className="form-label">الوصف (عربي)</label><input className="form-input" name="desc" value={productForm.desc} onChange={e => setProductForm(p=>({...p,[e.target.name]:e.target.value}))} /></div>
                </div>

                {/* ── English ── */}
                <div className="product-lang-divider">🇬🇧 English</div>
                <div className="modal-grid2">
                  <div className="form-group"><label className="form-label">Product Name (English)</label><input className="form-input" name="nameEn" value={productForm.nameEn} onChange={e => setProductForm(p=>({...p,[e.target.name]:e.target.value}))} dir="ltr" placeholder="e.g. Classic Facial Tissues" /></div>
                  <div className="form-group"><label className="form-label">Description (English)</label><input className="form-input" name="descEn" value={productForm.descEn} onChange={e => setProductForm(p=>({...p,[e.target.name]:e.target.value}))} dir="ltr" placeholder="e.g. Soft 3-layer tissues..." /></div>
                </div>

                {/* ── Product Data ── */}
                <div className="product-lang-divider">⚙️ بيانات المنتج</div>
                <div className="modal-grid2">
                  <div className="form-group"><label className="form-label">SKU (رمز المنتج)</label><input className="form-input" name="sku" value={productForm.sku} onChange={e => setProductForm(p=>({...p,[e.target.name]:e.target.value}))} dir="ltr" placeholder="e.g. JAW-FAC-001" /></div>
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
                <div className="modal-actions">
                  <button type="button" onClick={closeProductModal} className="btn btn-outline">إلغاء</button>
                  <button type="submit" className="btn btn-green" disabled={uploadingImg}><i className="fas fa-save"></i> حفظ</button>
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
