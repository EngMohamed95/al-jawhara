import { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import ProductForm from './ProductForm';
import { useLanguage } from '../../context/LanguageContext';
import translations from '../../translations';
import Seo from '../../components/Seo';
import Reveal from '../../components/Reveal';
import './index.css';

/* ── Constants ── */
const categoryLabels = {
  facial: { ar: 'مناديل وجه', en: 'Facial Tissues' },
  rolls:  { ar: 'رولات',      en: 'Rolls' },
  pocket: { ar: 'محارم جيب',  en: 'Pocket Tissues' },
  towels: { ar: 'مناشف',      en: 'Paper Towels' },
  napkins:{ ar: 'مناديل مائدة', en: 'Dinner Napkins' },
  family: { ar: 'عروض عائلة', en: 'Family Bundles' },
};
const orderStatusLabels  = { active: { ar: 'نشط', en: 'Active' }, pending: { ar: 'قيد المراجعة', en: 'Pending' }, inactive: { ar: 'متوقف', en: 'Inactive' }, shipped: { ar: 'تم الشحن', en: 'Shipped' }, cancelled: { ar: 'ملغي', en: 'Cancelled' } };
const productStatusLabels= { active: { ar: 'نشط', en: 'Active' }, pending: { ar: 'قيد المراجعة', en: 'Pending' }, inactive: { ar: 'متوقف', en: 'Inactive' } };
const roleLabels         = { admin: { ar: 'مدير', en: 'Admin' }, editor: { ar: 'محرر', en: 'Editor' }, viewer: { ar: 'مشاهد', en: 'Viewer' }, customer: { ar: 'عميل', en: 'Customer' } };
const userStatusLabels   = { active: { ar: 'نشط', en: 'Active' }, suspended: { ar: 'موقوف', en: 'Suspended' }, pending: { ar: 'قيد المراجعة', en: 'Pending' }, locked: { ar: 'مقفل', en: 'Locked' } };

const ROLE_PERMISSIONS = {
  admin:  { products: true,  categories: true,  inventory: true,  orders: true,  invoices: true,  users: true,  content: true,  reports: true,  shipping: true,  payments: true,  coupons: true,  settings: true  },
  editor: { products: true,  categories: true,  inventory: true,  orders: true,  invoices: true,  users: false, content: true,  reports: true,  shipping: false, payments: false, coupons: true,  settings: false },
  viewer: { products: false, categories: false, inventory: true,  orders: true,  invoices: true,  users: false, content: false, reports: true,  shipping: false, payments: false, coupons: false, settings: false },
};

const emptyProduct = { name: '', nameEn: '', sku: '', category: 'facial', price: '', stock: '', status: 'active', image: '', gallery: [], desc: '', descEn: '', badge: '', isPhysical: true, weight: '', dimLength: '', dimWidth: '', dimHeight: '', countryOfOrigin: 'KW', hsCode: '', variants: [] };
const emptyUser    = { username: '', password: '', name: '', email: '', phone: '', role: 'viewer', status: 'active' };
const emptyCoupon  = { code: '', type: 'percent', value: '', minOrder: '', maxUses: '', expiry: '', status: 'active', desc: '' };

/* ── Translation dictionary ── */
const DASH_T = {
  // Sidebar
  'nav.overview':    { ar: 'نظرة عامة',       en: 'Overview' },
  'nav.products':    { ar: 'المنتجات',         en: 'Products' },
  'nav.allProducts': { ar: 'كل المنتجات',      en: 'All Products' },
  'nav.collections': { ar: 'الأقسام',          en: 'Sections' },
  'nav.inventory':   { ar: 'المخزون',          en: 'Inventory' },
  'nav.orders':      { ar: 'الطلبات',          en: 'Orders' },
  'nav.invoices':    { ar: 'الفواتير',         en: 'Invoices' },
  'nav.users':       { ar: 'المستخدمون',       en: 'Users' },
  'nav.content':     { ar: 'محتوى الموقع',     en: 'Site Content' },
  'nav.shipping':    { ar: 'الشحن والتوصيل',   en: 'Shipping' },
  'nav.payments':    { ar: 'بوابات الدفع',     en: 'Payment Gateways' },
  'nav.coupons':     { ar: 'الكوبونات',        en: 'Coupons' },
  'nav.reports':     { ar: 'التحليلات',        en: 'Analytics' },
  // Overview
  'overview.title':       { ar: 'نظرة عامة',           en: 'Overview' },
  'overview.totalRev':    { ar: 'إجمالي الإيرادات',    en: 'Total Revenue' },
  'overview.activeProds': { ar: 'منتجات نشطة',         en: 'Active Products' },
  'overview.pendingOrds': { ar: 'طلبات معلقة',         en: 'Pending Orders' },
  'overview.totalUsers':  { ar: 'إجمالي المستخدمين',  en: 'Total Users' },
  // Products
  'products.title':    { ar: 'المنتجات',        en: 'Products' },
  'products.add':      { ar: 'إضافة منتج',      en: 'Add Product' },
  'products.name':     { ar: 'الاسم',           en: 'Name' },
  'products.nameEn':   { ar: 'الاسم إنجليزي',  en: 'Name (EN)' },
  'products.sku':      { ar: 'الرمز SKU',       en: 'SKU' },
  'products.category': { ar: 'الفئة',           en: 'Category' },
  'products.price':    { ar: 'السعر (د.ك)',     en: 'Price (KD)' },
  'products.stock':    { ar: 'المخزون',         en: 'Stock' },
  'products.status':   { ar: 'الحالة',          en: 'Status' },
  'products.actions':  { ar: 'إجراءات',         en: 'Actions' },
  'products.image':    { ar: 'الصورة الرئيسية', en: 'Main Image' },
  'products.gallery':  { ar: 'معرض الصور',      en: 'Gallery' },
  'products.desc':     { ar: 'الوصف عربي',      en: 'Description (AR)' },
  'products.descEn':   { ar: 'الوصف إنجليزي',   en: 'Description (EN)' },
  'products.badge':    { ar: 'الشارة/البادج',   en: 'Badge' },
  'products.noResults':{ ar: 'لا توجد منتجات مطابقة', en: 'No matching products' },
  // Orders
  'orders.title':    { ar: 'الطلبات',       en: 'Orders' },
  'orders.ref':      { ar: 'رقم الطلب',    en: 'Order Ref' },
  'orders.client':   { ar: 'العميل',       en: 'Client' },
  'orders.phone':    { ar: 'الهاتف',       en: 'Phone' },
  'orders.gov':      { ar: 'المنطقة',      en: 'Governorate' },
  'orders.product':  { ar: 'المنتج',       en: 'Product' },
  'orders.total':    { ar: 'الإجمالي',     en: 'Total' },
  'orders.date':     { ar: 'التاريخ',      en: 'Date' },
  'orders.status':   { ar: 'الحالة',       en: 'Status' },
  'orders.payment':  { ar: 'الدفع',        en: 'Payment' },
  'orders.actions':  { ar: 'إجراءات',      en: 'Actions' },
  'orders.noResults':{ ar: 'لا توجد طلبات مطابقة', en: 'No matching orders' },
  // Invoices
  'invoices.title':  { ar: 'الفواتير',     en: 'Invoices' },
  'invoices.print':  { ar: 'طباعة',        en: 'Print' },
  // Users
  'users.title':     { ar: 'المستخدمون',   en: 'Users' },
  'users.add':       { ar: 'إضافة مستخدم', en: 'Add User' },
  'users.name':      { ar: 'الاسم',        en: 'Name' },
  'users.username':  { ar: 'اسم المستخدم', en: 'Username' },
  'users.email':     { ar: 'البريد',       en: 'Email' },
  'users.phone':     { ar: 'الهاتف',       en: 'Phone' },
  'users.role':      { ar: 'الدور',        en: 'Role' },
  'users.status':    { ar: 'الحالة',       en: 'Status' },
  'users.actions':   { ar: 'إجراءات',      en: 'Actions' },
  // Coupons
  'coupons.title':   { ar: 'الكوبونات',    en: 'Coupons' },
  'coupons.add':     { ar: 'إضافة كوبون',  en: 'Add Coupon' },
  'coupons.code':    { ar: 'الكود',        en: 'Code' },
  'coupons.type':    { ar: 'النوع',        en: 'Type' },
  'coupons.value':   { ar: 'القيمة',       en: 'Value' },
  'coupons.minOrder':{ ar: 'الحد الأدنى',  en: 'Min Order' },
  'coupons.maxUses': { ar: 'أقصى استخدام', en: 'Max Uses' },
  'coupons.expiry':  { ar: 'الانتهاء',     en: 'Expiry' },
  'coupons.status':  { ar: 'الحالة',       en: 'Status' },
  'coupons.actions': { ar: 'إجراءات',      en: 'Actions' },
  // Collections
  'collections.title':    { ar: 'الأقسام',          en: 'Sections' },
  'collections.add':      { ar: 'إضافة قسم',        en: 'Add Section' },
  'collections.name':     { ar: 'الاسم',            en: 'Name' },
  'collections.slug':     { ar: 'Slug',             en: 'Slug' },
  'collections.products': { ar: 'المنتجات',         en: 'Products' },
  'collections.status':   { ar: 'الحالة',           en: 'Status' },
  'collections.actions':  { ar: 'إجراءات',          en: 'Actions' },
  // Inventory
  'inventory.title':  { ar: 'المخزون',          en: 'Inventory' },
  'inventory.save':   { ar: 'حفظ التغييرات',    en: 'Save Changes' },
  'inventory.product':{ ar: 'المنتج',           en: 'Product' },
  'inventory.stock':  { ar: 'الكمية',           en: 'Qty' },
  // Shipping
  'shipping.title':   { ar: 'الشحن والتوصيل',  en: 'Shipping & Delivery' },
  'shipping.zones':   { ar: 'مناطق التوصيل',   en: 'Delivery Zones' },
  'shipping.companies':{ ar: 'شركات الشحن',    en: 'Shipping Companies' },
  'shipping.save':    { ar: 'حفظ',             en: 'Save' },
  // Payments
  'payments.title':   { ar: 'بوابات الدفع',    en: 'Payment Gateways' },
  'payments.save':    { ar: 'حفظ',             en: 'Save' },
  // Content
  'content.title':    { ar: 'محتوى الموقع',    en: 'Site Content' },
  'content.saveAll':  { ar: 'حفظ الكل',        en: 'Save All' },
  'content.home':     { ar: 'الرئيسية',        en: 'Home' },
  'content.about':    { ar: 'عن الشركة',       en: 'About' },
  'content.contact':  { ar: 'التواصل',         en: 'Contact' },
  'content.banners':  { ar: 'البانرات والصور', en: 'Banners & Images' },
  'content.general':  { ar: 'عام',             en: 'General' },
  // Analytics
  'analytics.title':  { ar: 'التحليلات',       en: 'Analytics' },
  'analytics.today':  { ar: 'اليوم',           en: 'Today' },
  'analytics.7d':     { ar: '7 أيام',          en: '7 Days' },
  'analytics.30d':    { ar: '30 يوم',          en: '30 Days' },
  'analytics.month':  { ar: 'هذا الشهر',       en: 'This Month' },
  'analytics.all':    { ar: 'كل الوقت',        en: 'All Time' },
  // Common
  'common.save':      { ar: 'حفظ',             en: 'Save' },
  'common.cancel':    { ar: 'إلغاء',           en: 'Cancel' },
  'common.edit':      { ar: 'تعديل',           en: 'Edit' },
  'common.delete':    { ar: 'حذف',             en: 'Delete' },
  'common.add':       { ar: 'إضافة',           en: 'Add' },
  'common.search':    { ar: 'بحث...',          en: 'Search...' },
  'common.actions':   { ar: 'إجراءات',         en: 'Actions' },
  'common.status':    { ar: 'الحالة',          en: 'Status' },
  'common.loading':   { ar: 'جاري التحميل...', en: 'Loading...' },
  'common.noData':    { ar: 'لا توجد بيانات',  en: 'No data' },
  'common.refresh':   { ar: 'تحديث',           en: 'Refresh' },
  'common.print':     { ar: 'طباعة',           en: 'Print' },
  'common.invoice':   { ar: 'فاتورة',          en: 'Invoice' },
  'common.name':      { ar: 'الاسم',           en: 'Name' },
  'common.price':     { ar: 'السعر',           en: 'Price' },
  'common.total':     { ar: 'الإجمالي',        en: 'Total' },
  'common.date':      { ar: 'التاريخ',         en: 'Date' },
  'common.active':    { ar: 'نشط',             en: 'Active' },
  'common.inactive':  { ar: 'متوقف',           en: 'Inactive' },
  'common.pending':   { ar: 'قيد المراجعة',   en: 'Pending' },
  'common.saveDB':    { ar: 'حفظ في قاعدة البيانات', en: 'Save to Database' },
  'common.saving':    { ar: 'جاري الحفظ...',   en: 'Saving...' },
  'common.savedOk':   { ar: 'تم الحفظ بنجاح!', en: 'Saved successfully!' },
  // Sidebar
  'sidebar.panel':    { ar: 'لوحة التحكم',     en: 'Control Panel' },
  'sidebar.manager':  { ar: 'مدير',            en: 'Admin' },
  'sidebar.editor':   { ar: 'محرر',            en: 'Editor' },
  'sidebar.viewer':   { ar: 'مشاهد',           en: 'Viewer' },
  'sidebar.mainMenu': { ar: 'القائمة الرئيسية', en: 'Main Menu' },
  'sidebar.quickLinks':{ ar: 'روابط سريعة',   en: 'Quick Links' },
  'sidebar.visitSite':{ ar: 'زيارة الموقع',   en: 'Visit Site' },
  'sidebar.logout':   { ar: 'تسجيل الخروج',   en: 'Logout' },
};

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

/* ── Analytics helpers ── */
const toArabicNum = s => String(s).replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
const parseOrderDate = (raw) => {
  if (!raw) return null;
  const s = toArabicNum(raw).replace(/\//g, '-').trim();
  const d = new Date(s);
  return isNaN(d) ? null : d;
};
const fmtMonth = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
const fmtDay   = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

/* ── MiniLineChart (SVG) ── */
const MiniLineChart = ({ data, color = '#065089', height = 120 }) => {
  if (!data || data.length < 2) return <div className="analytics-empty-chart">لا توجد بيانات كافية</div>;
  const w = 600, h = height;
  const pad = { t: 12, b: 28, l: 8, r: 8 };
  const maxV = Math.max(...data.map(d => d.v), 1);
  const xs = data.map((_, i) => pad.l + (i / (data.length - 1)) * (w - pad.l - pad.r));
  const ys = data.map(d => pad.t + (1 - d.v / maxV) * (h - pad.t - pad.b));
  const path = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x},${ys[i]}`).join(' ');
  const fill = `${path} L${xs[xs.length-1]},${h-pad.b} L${xs[0]},${h-pad.b} Z`;
  const step = Math.max(1, Math.floor(data.length / 6));
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="lgA" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fill} fill="url(#lgA)" />
      <path d={path} fill="none" stroke={color} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((d, i) => i % step === 0 && (
        <text key={i} x={xs[i]} y={h - 6} textAnchor="middle" fontSize="10" fill="#888">{d.k}</text>
      ))}
    </svg>
  );
};

/* ── DonutChart (SVG) ── */
const DonutChart = ({ slices }) => {
  const total = slices.reduce((s, x) => s + x.v, 0);
  if (!total) return <div className="analytics-empty-chart">لا توجد بيانات</div>;
  let cum = 0;
  const r = 70, cx = 90, cy = 90;
  const paths = slices.map((sl, i) => {
    const frac = sl.v / total;
    const start = cum * 2 * Math.PI - Math.PI / 2;
    cum += frac;
    const end = cum * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end),   y2 = cy + r * Math.sin(end);
    const large = frac > 0.5 ? 1 : 0;
    return <path key={i} d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`} fill={sl.color} opacity="0.9" />;
  });
  return (
    <div className="donut-wrap">
      <svg viewBox="0 0 180 180" style={{ width: 140, flexShrink: 0 }}>
        <circle cx={cx} cy={cy} r={r} fill="#f1f5f9" />
        {paths}
        <circle cx={cx} cy={cy} r={42} fill="white" />
        <text x={cx} y={cy-6}  textAnchor="middle" fontSize="11" fill="#555">الكل</text>
        <text x={cx} y={cy+12} textAnchor="middle" fontSize="16" fontWeight="700" fill="#222">{total}</text>
      </svg>
      <div className="donut-legend">
        {slices.filter(s => s.v > 0).map((s, i) => (
          <div key={i} className="donut-legend-item">
            <span className="donut-dot" style={{ background: s.color }}></span>
            <span className="donut-label">{s.label}</span>
            <span className="donut-val">{s.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── HBar (horizontal bar) ── */
const HBar = ({ items, unit = '' }) => {
  const max = Math.max(...items.map(i => i.v), 1);
  return (
    <div className="hbar-list">
      {items.slice(0, 7).map((item, i) => (
        <div key={i} className="hbar-row">
          <div className="hbar-label" title={item.k}>{i + 1}. {item.k}</div>
          <div className="hbar-track">
            <div className="hbar-fill" style={{ width: `${(item.v / max) * 100}%` }}></div>
          </div>
          <div className="hbar-val">{typeof item.v === 'number' && !Number.isInteger(item.v) ? item.v.toFixed(3) : item.v}{unit}</div>
        </div>
      ))}
    </div>
  );
};

const emptyCategory = { slug: '', nameAr: '', nameEn: '', emoji: '📦', icon: 'fa-box', sortOrder: 1, status: 'active', desc: '', parentId: null };

const buildCatTree = (cats, parentId = null) =>
  cats.filter(c => (c.parentId ?? null) === parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(c => ({ ...c, children: buildCatTree(cats, c.id) }));

const flattenTree = (nodes, depth = 0) =>
  nodes.flatMap(n => [{ ...n, depth }, ...flattenTree(n.children || [], depth + 1)]);

const getDescendantSlugs = (slug, cats) => {
  const cat = cats.find(c => c.slug === slug);
  if (!cat) return [];
  const children = cats.filter(c => c.parentId === cat.id);
  return [...children.map(c => c.slug), ...children.flatMap(c => getDescendantSlugs(c.slug, cats))];
};

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

  const { lang } = useLanguage();
  const dt = (key) => DASH_T[key]?.[lang] ?? DASH_T[key]?.ar ?? key;

  const myRole = auth?.role || 'viewer';
  const perms  = ROLE_PERMISSIONS[myRole] || ROLE_PERMISSIONS.viewer;

  /* ── navItems defined inside component so dt() is available ── */
  const navItems = [
    { id: 'overview',  label: dt('nav.overview'),  icon: 'fa-chart-pie' },
    {
      id: 'products',  label: dt('nav.products'),  icon: 'fa-box',
      children: [
        { id: 'list',        label: dt('nav.allProducts'), icon: 'fa-list-ul',     perm: 'products'   },
        { id: 'collections', label: dt('nav.collections'), icon: 'fa-folder-open', perm: 'categories' },
        { id: 'inventory',   label: dt('nav.inventory'),   icon: 'fa-warehouse',   perm: 'inventory'  },
      ],
    },
    { id: 'orders',    label: dt('nav.orders'),    icon: 'fa-list-check' },
    { id: 'invoices',  label: dt('nav.invoices'),  icon: 'fa-file-invoice' },
    { id: 'users',     label: dt('nav.users'),     icon: 'fa-users-gear' },
    { id: 'content',   label: dt('nav.content'),   icon: 'fa-pen-nib' },
    { id: 'shipping',  label: dt('nav.shipping'),  icon: 'fa-truck' },
    { id: 'payments',  label: dt('nav.payments'),  icon: 'fa-credit-card' },
    { id: 'coupons',   label: dt('nav.coupons'),   icon: 'fa-tag' },
    { id: 'reports',   label: dt('nav.reports'),   icon: 'fa-chart-line' },
    { id: 'settings',  label: lang === 'en' ? 'Settings' : 'الإعدادات', icon: 'fa-gear', perm: 'settings' },
  ];

  const [view, setView]               = useState('overview');
  const [productsTab, setProductsTab] = useState('list');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* ── WhatsApp Settings ── */
  const [waNumbers, setWaNumbers]   = useState(null); // array of { phone, apiKey, label }
  const [waSaved,   setWaSaved]     = useState(false);
  const openSettingsTab = () => {
    if (!waNumbers) setWaNumbers(JSON.parse(JSON.stringify(siteContent?.whatsappNumbers || [])));
    setView('settings');
  };
  const addWaNumber    = () => setWaNumbers(p => [...(p||[]), { phone: '', apiKey: '', label: '' }]);
  const removeWaNumber = (i) => setWaNumbers(p => p.filter((_, idx) => idx !== i));
  const editWaNumber   = (i, field, val) => setWaNumbers(p => p.map((n, idx) => idx === i ? { ...n, [field]: val } : n));
  const saveWaSettings = async () => {
    try {
      await saveSiteContent({ ...siteContent, whatsappNumbers: waNumbers });
      setWaSaved(true); setTimeout(() => setWaSaved(false), 2500);
    } catch { alert('حدث خطأ أثناء الحفظ'); }
  };
  const [productFormMode, setProductFormMode] = useState(null); // null | 'add' | 'edit'
  const [productFormId,   setProductFormId]   = useState(null);

  const openAddProductForm  = () => { setProductFormMode('add');  setProductFormId(null); setView('products'); setProductsTab('list'); };
  const openEditProductForm = (id) => { setProductFormMode('edit'); setProductFormId(id);  setView('products'); setProductsTab('list'); };
  const closeProductForm    = () => { setProductFormMode(null); setProductFormId(null); };


  /* ── Category inline form (add/edit view) ── */
  const [catViewMode,     setCatViewMode]     = useState(null); // null | 'add' | 'edit'
  const [catEditData,     setCatEditData]     = useState(null);
  const [catEditForm,     setCatEditForm]     = useState(emptyCategory);
  const [catEditOpenSecs, setCatEditOpenSecs] = useState(new Set(['basic', 'settings']));
  const [catEditErr,      setCatEditErr]      = useState('');
  const [catEditSaved,    setCatEditSaved]    = useState(false);

  const openCatAdd  = () => {
    setCatEditForm(emptyCategory); setCatEditErr(''); setCatEditSaved(false);
    setCatEditData(null); setCatViewMode('add'); setCatEditOpenSecs(new Set(['basic','settings']));
  };
  const openCatEdit = (c) => {
    setCatEditForm({ slug: c.slug, nameAr: c.nameAr, nameEn: c.nameEn||'', emoji: c.emoji||'📦', sortOrder: c.sortOrder||1, status: c.status, desc: c.desc||'', parentId: c.parentId??null });
    setCatEditData(c); setCatEditErr(''); setCatEditSaved(false);
    setCatViewMode('edit'); setCatEditOpenSecs(new Set(['basic','settings']));
  };
  const closeCatView     = () => { setCatViewMode(null); setCatEditData(null); };
  const toggleCatEditSec = (id) => setCatEditOpenSecs(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const handleCatEditSave = async () => {
    if (!catEditForm.nameAr.trim()) { setCatEditErr('الاسم العربي مطلوب'); return; }
    if (!catEditForm.slug.trim())   { setCatEditErr('المعرف (Slug) مطلوب'); return; }
    if (!/^[a-z0-9_-]+$/.test(catEditForm.slug)) { setCatEditErr('الـ Slug: أحرف إنجليزية صغيرة وأرقام وشرطة فقط'); return; }
    setCatEditErr('');
    try {
      if (catViewMode === 'add') await addCategory({ ...catEditForm });
      else await updateCategory(catEditData.id, { ...catEditData, ...catEditForm });
      setCatEditSaved(true); setTimeout(closeCatView, 900);
    } catch { setCatEditErr('حدث خطأ أثناء الحفظ.'); }
  };

  const handleDeleteCat = async (c) => {
    const usedBy = products.filter(p => p.category === c.slug).length;
    const hasChildren = categories.some(cat => cat.parentId === c.id);
    if (hasChildren) { alert(lang === 'en' ? `Cannot delete — "${c.nameAr}" has subcategories. Delete them first.` : `لا يمكن حذف "${c.nameAr}" — لديها فئات فرعية. احذفها أولاً.`); return; }
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
    setProductForm({ name: p.name, nameEn: p.nameEn || '', sku: p.sku || '', category: p.category, price: p.price, stock: p.stock, status: p.status, image: p.image || '', gallery: p.gallery || [], desc: p.desc || '', descEn: p.descEn || '', badge: p.badge || '', isPhysical: p.isPhysical !== false, weight: p.weight || '', dimLength: p.dimLength || '', dimWidth: p.dimWidth || '', dimHeight: p.dimHeight || '', countryOfOrigin: p.countryOfOrigin || 'KW', hsCode: p.hsCode || '', variants: p.variants || [] });
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
    const data = { ...productForm, price: parseFloat(productForm.price), stock: parseInt(productForm.stock), specs: [], badge: productForm.badge || null, weight: productForm.weight ? parseFloat(productForm.weight) : null, dimLength: productForm.dimLength ? parseFloat(productForm.dimLength) : null, dimWidth: productForm.dimWidth ? parseFloat(productForm.dimWidth) : null, dimHeight: productForm.dimHeight ? parseFloat(productForm.dimHeight) : null };
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
  const [contentTab,     setContentTab]     = useState('home'); // 'home'|'about'|'contact'|'banners'|'general'

  const openContentTab = () => {
    if (!contentForm && siteContent) setContentForm({ ...siteContent });
    else if (!contentForm) setContentForm({});
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
  const cf = (name) => contentForm?.[name] || '';
  const setCf = (name, val) => setContentForm(p => ({ ...p, [name]: val }));

  /* upload image inside content form */
  const [contentUploading, setContentUploading] = useState({});
  const uploadContentImg = async (fieldName, file) => {
    if (!file) return;
    setContentUploading(p => ({ ...p, [fieldName]: true }));
    try {
      const url = await uploadFile(file);
      if (url) setCf(fieldName, url);
    } finally {
      setContentUploading(p => ({ ...p, [fieldName]: false }));
    }
  };
  const ContentImgField = ({ label, field, hint }) => (
    <div className="form-group content-img-field">
      <label className="form-label">{label}</label>
      {cf(field) && <img src={cf(field)} alt="" className="content-img-preview" />}
      <div className="content-img-row">
        <input className="form-input" value={cf(field)} onChange={e => setCf(field, e.target.value)} placeholder="https://..." dir="ltr" />
        <label className="btn btn-outline btn-sm content-img-upload-btn">
          {contentUploading[field] ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-upload"></i> رفع</>}
          <input type="file" accept="image/*" style={{ display:'none' }} onChange={e => uploadContentImg(field, e.target.files[0])} />
        </label>
      </div>
      {hint && <div className="form-hint">{hint}</div>}
    </div>
  );

  /* ── Shipping tab (local edits then save via siteContent) ── */
  const [shippingZones, setShippingZones] = useState(null);
  const [shippingSaved, setShippingSaved] = useState(false);
  const [shippingTab,   setShippingTab]   = useState('zones'); // 'zones' | 'companies'

  const defaultShipCompanies = {
    aramex:    { enabled: false, apiKey: '', accountNumber: '' },
    dhl:       { enabled: false, apiKey: '', accountNumber: '' },
    zajel:     { enabled: false, apiKey: '', accountNumber: '' },
    fetchr:    { enabled: false, apiKey: '', accountNumber: '' },
    mawasalat: { enabled: false, apiKey: '', accountNumber: '' },
  };
  const [shipCompanies, setShipCompanies] = useState(null);

  const openShippingTab = () => {
    if (!shippingZones && siteContent?.shippingZones)
      setShippingZones(JSON.parse(JSON.stringify(siteContent.shippingZones)));
    else if (!shippingZones)
      setShippingZones(translations.kuwaitZones.map(z => ({ ...z, enabled: true })));
    if (!shipCompanies)
      setShipCompanies(siteContent?.shipCompanies ? JSON.parse(JSON.stringify(siteContent.shipCompanies)) : { ...defaultShipCompanies });
    setView('shipping');
  };

  const updateZoneFee     = (id, fee)     => setShippingZones(z => z.map(x => x.id === id ? { ...x, fee: parseFloat(fee) || 0 } : x));
  const toggleZone        = (id)          => setShippingZones(z => z.map(x => x.id === id ? { ...x, enabled: !x.enabled } : x));

  const toggleShipCompany   = (key)       => setShipCompanies(p => ({ ...p, [key]: { ...p[key], enabled: !p[key].enabled } }));
  const setShipCompanyField = (key, f, v) => setShipCompanies(p => ({ ...p, [key]: { ...p[key], [f]: v } }));

  const saveShipping = async () => {
    try {
      await saveSiteContent({ ...siteContent, shippingZones, shipCompanies });
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
  <div class="inv-stamp">${orderStatusLabels[order.status]?.ar || order.status}</div>
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
  const [dashSearch,    setDashSearch]    = useState('');
  const [clientFilter,  setClientFilter]  = useState(null); // string | null
  const [prodCatFilter, setProdCatFilter] = useState('all');
  const [prodStatusFilter, setProdStatusFilter] = useState('all');
  const [prodSort,      setProdSort]      = useState({ col: 'id', dir: 'desc' });
  const [selectedProds, setSelectedProds] = useState(new Set());
  const [prodPage,      setProdPage]      = useState(1);
  const [prodPerPage,   setProdPerPage]   = useState(50);
  useEffect(() => { setDashSearch(''); setClientFilter(null); setProdCatFilter('all'); setProdStatusFilter('all'); setSelectedProds(new Set()); setProdPage(1); }, [view]);
  useEffect(() => { setProdPage(1); }, [dashSearch, prodCatFilter, prodStatusFilter, prodSort]);

  /* ── Category filters ── */
  const [catSearch,       setCatSearch]       = useState('');
  const [catStatusFilter, setCatStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive'
  const [catLevelFilter,  setCatLevelFilter]  = useState('all'); // 'all' | 'root' | 'sub'

  const ns = (s = '') => String(s).toLowerCase()
    .replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');

  const filteredDashProducts = useMemo(() => {
    const q = ns(dashSearch);
    let list = products.filter(p => {
      if (prodCatFilter !== 'all' && p.category !== prodCatFilter) return false;
      if (prodStatusFilter !== 'all' && p.status !== prodStatusFilter) return false;
      if (q && ![p.name, p.nameEn, p.sku, p.badge, categoryLabels[p.category]?.ar, p.desc].some(f => ns(f).includes(q))) return false;
      return true;
    });
    list = [...list].sort((a, b) => {
      let av = a[prodSort.col], bv = b[prodSort.col];
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return prodSort.dir === 'asc' ? -1 : 1;
      if (av > bv) return prodSort.dir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [products, dashSearch, prodCatFilter, prodStatusFilter, prodSort]);

  const prodTotalPages  = Math.max(1, Math.ceil(filteredDashProducts.length / prodPerPage));
  const prodPageSafe    = Math.min(prodPage, prodTotalPages);
  const pagedProducts   = filteredDashProducts.slice((prodPageSafe - 1) * prodPerPage, prodPageSafe * prodPerPage);

  const filteredCats = useMemo(() => {
    const q = ns(catSearch);
    return flattenTree(buildCatTree(categories)).filter(c => {
      if (catStatusFilter !== 'all' && c.status !== catStatusFilter) return false;
      if (catLevelFilter === 'root' && c.parentId != null) return false;
      if (catLevelFilter === 'sub'  && c.parentId == null) return false;
      if (q && ![c.nameAr, c.nameEn, c.slug].some(f => ns(f).includes(q))) return false;
      return true;
    });
  }, [categories, catSearch, catStatusFilter, catLevelFilter]);

  const toggleProdSelect = (id) => setSelectedProds(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAllProds   = () => setSelectedProds(s => s.size === filteredDashProducts.length ? new Set() : new Set(filteredDashProducts.map(p => p.id)));
  const bulkDeleteProds  = async () => {
    if (!selectedProds.size) return;
    if (!window.confirm(`هل تريد حذف ${selectedProds.size} منتج؟`)) return;
    for (const id of selectedProds) { try { await deleteProduct(id); } catch {} }
    setSelectedProds(new Set());
  };
  const sortProd = (col) => setProdSort(s => ({ col, dir: s.col === col && s.dir === 'asc' ? 'desc' : 'asc' }));
  const SortIcon = ({ col }) => prodSort.col !== col ? null : (
    <i className={`fas fa-sort-${prodSort.dir === 'asc' ? 'up' : 'down'}`} style={{ marginRight: '4px', fontSize: '10px' }}></i>
  );

  const filteredOrders = useMemo(() => {
    if (clientFilter) return orders.filter(o => o.client === clientFilter);
    const q = ns(dashSearch);
    if (!q) return orders;
    return orders.filter(o =>
      [o.ref, o.client, o.governorate, o.product, o.payment, orderStatusLabels[o.status]?.ar, orderStatusLabels[o.status]?.en].some(f => ns(f).includes(q))
    );
  }, [orders, dashSearch, clientFilter]);

  const filteredUsers = useMemo(() => {
    const q = ns(dashSearch);
    if (!q) return users;
    return users.filter(u =>
      [u.name, u.username, u.email, u.phone, roleLabels[u.role]?.ar, roleLabels[u.role]?.en, userStatusLabels[u.status]?.ar, userStatusLabels[u.status]?.en].some(f => ns(f).includes(q))
    );
  }, [users, dashSearch]);

  const filteredCoupons = useMemo(() => {
    const q = ns(dashSearch);
    if (!q) return coupons;
    return coupons.filter(c =>
      [c.code, c.type === 'percent' ? 'نسبة' : 'مبلغ', c.desc, c.status === 'active' ? 'نشط' : 'متوقف'].some(f => ns(f).includes(q))
    );
  }, [coupons, dashSearch]);

  /* ── Analytics ── */
  const [analyticsRange, setAnalyticsRange] = useState('30d'); // 'today'|'7d'|'30d'|'month'|'all'

  const analyticsData = useMemo(() => {
    const now = new Date();
    const startOf = (n) => { const d = new Date(now); d.setHours(0,0,0,0); d.setDate(d.getDate() - n); return d; };
    let from = null;
    if (analyticsRange === 'today')  from = startOf(0);
    else if (analyticsRange === '7d')   from = startOf(6);
    else if (analyticsRange === '30d')  from = startOf(29);
    else if (analyticsRange === 'month') { from = new Date(now.getFullYear(), now.getMonth(), 1); }

    const inRange = orders.filter(o => {
      if (!from) return true;
      const d = parseOrderDate(o.date);
      return d && d >= from;
    });
    const completed = inRange.filter(o => !['cancelled'].includes(o.status));

    const grossRevenue = completed.reduce((s, o) => s + parseFloat(o.grandTotal || o.total || 0), 0);
    const shipping     = completed.reduce((s, o) => s + parseFloat(o.deliveryFee || 0), 0);
    const discounts    = completed.reduce((s, o) => s + parseFloat(o.discount || 0), 0);
    const net          = grossRevenue - discounts;
    const avgOrder     = completed.length ? grossRevenue / completed.length : 0;
    const uniqueClients= [...new Set(completed.map(o => o.client).filter(Boolean))].length;

    /* ── Line chart: group by day or month ── */
    const useMonth = analyticsRange === 'all' || analyticsRange === 'month';
    const grouped = {};
    completed.forEach(o => {
      const d = parseOrderDate(o.date);
      if (!d) return;
      const key = useMonth ? fmtMonth(d) : fmtDay(d);
      grouped[key] = (grouped[key] || 0) + parseFloat(o.grandTotal || o.total || 0);
    });
    const lineData = Object.keys(grouped).sort().map(k => ({
      k: useMonth ? k.slice(5) : k.slice(5),
      v: grouped[k],
    }));

    /* ── Orders by status ── */
    const statusColors = { active:'#065089', pending:'#f59e0b', shipped:'#16a34a', cancelled:'#ef4444', inactive:'#94a3b8' };
    const statusSlices = Object.entries(orderStatusLabels).map(([k, labelObj]) => ({
      label: labelObj?.ar || k, color: statusColors[k] || '#94a3b8',
      v: inRange.filter(o => o.status === k).length,
    }));

    /* ── Top products by revenue ── */
    const prodRev = {};
    completed.forEach(o => {
      (o.items || [{ name: o.product, qty: o.qty || 1, price: parseFloat(o.grandTotal || o.total) / (o.qty || 1) }]).forEach(item => {
        if (!item.name) return;
        prodRev[item.name] = (prodRev[item.name] || 0) + (item.price * item.qty);
      });
    });
    const topProducts = Object.entries(prodRev).sort((a,b) => b[1]-a[1]).map(([k,v]) => ({ k, v }));

    /* ── Top governorates ── */
    const govMap = {};
    completed.forEach(o => { if (o.governorate) govMap[o.governorate] = (govMap[o.governorate]||0)+1; });
    const topGov = Object.entries(govMap).sort((a,b)=>b[1]-a[1]).map(([k,v])=>({k,v}));

    /* ── Top clients ── */
    const clientMap = {};
    completed.forEach(o => {
      if (!o.client) return;
      if (!clientMap[o.client]) clientMap[o.client] = { orders: 0, total: 0, phone: o.phone || '' };
      clientMap[o.client].orders++;
      clientMap[o.client].total += parseFloat(o.grandTotal || o.total || 0);
      if (!clientMap[o.client].phone && o.phone) clientMap[o.client].phone = o.phone;
    });
    const topClients = Object.entries(clientMap).sort((a,b)=>b[1].total-a[1].total).slice(0, 8)
      .map(([name, d]) => ({ name, ...d }));

    /* ── Payment breakdown ── */
    const payMap = {};
    completed.forEach(o => { if (o.payment) payMap[o.payment] = (payMap[o.payment]||0)+1; });
    const payData = Object.entries(payMap).sort((a,b)=>b[1]-a[1]).map(([k,v])=>({ k: k.toUpperCase(), v }));

    return { inRange, completed, grossRevenue, shipping, discounts, net, avgOrder, uniqueClients, lineData, statusSlices, topProducts, topGov, topClients, payData };
  }, [orders, analyticsRange]);

  if (loading) return (
    <div className="dashboard-layout">
      <div className="dashboard-main">
        <div className="dash-loading">
          <i className="fas fa-spinner fa-spin" aria-hidden="true"></i>
          <span>{dt('common.loading')}</span>
        </div>
      </div>
    </div>
  );

  /* ══════════════════ RENDER ══════════════════ */
  return (
    <>
      <Seo noIndex />

      <div className="dashboard-layout">

        {/* ── Mobile sidebar overlay ── */}
        {sidebarOpen && (
          <div className="dash-sidebar-overlay" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
        )}

        {/* ── Sidebar ── */}
        <aside className={`dashboard-sidebar${sidebarOpen ? ' dash-sidebar-open' : ''}`} aria-label="القائمة الجانبية">
          <div className="sidebar-header">
            <div className="sidebar-logo-icon"><i className="fas fa-gem" aria-hidden="true"></i></div>
            <div>
              <div className="sidebar-header-title">{dt('sidebar.panel')}</div>
              <div className="sidebar-header-sub">{auth?.name || 'Admin'}</div>
            </div>
          </div>
          <div className="sidebar-role-badge">
            <i className="fas fa-shield-halved" aria-hidden="true"></i>
            {roleLabels[myRole]?.[lang] || roleLabels[myRole]?.ar || myRole}
          </div>

          <div className="sidebar-title">{dt('sidebar.mainMenu')}</div>
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
                    setSidebarOpen(false);
                    if (item.id === 'content')   openContentTab();
                    else if (item.id === 'shipping') openShippingTab();
                    else if (item.id === 'payments') openPaymentsTab();
                    else if (item.id === 'settings') openSettingsTab();
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
          {/* Mobile hamburger */}
          <button
            className="dash-mobile-menu-btn"
            onClick={() => setSidebarOpen(o => !o)}
            aria-label="فتح القائمة"
          >
            <i className="fas fa-bars" aria-hidden="true"></i>
          </button>

          {error && (
            <div className="dash-error-banner" role="alert">
              <i className="fas fa-triangle-exclamation" aria-hidden="true"></i> {error}
            </div>
          )}

          {/* ══ OVERVIEW ══ */}
          {view === 'overview' && (
            <div>
              <div className="dashboard-title">{dt('overview.title')}</div>
              <div className="dashboard-stats">
                {[
                  { icon: 'fa-box',          num: products.length, label: lang === 'en' ? 'Total Products' : 'إجمالي المنتجات',  cls: 'dash-stat-green',   color: 'var(--primary)' },
                  { icon: 'fa-circle-check', num: activeCount,      label: lang === 'en' ? 'Active Products' : 'منتج نشط',         cls: 'dash-stat-emerald', color: '#15803d' },
                  { icon: 'fa-warehouse',    num: totalStock,       label: lang === 'en' ? 'Total Stock' : 'إجمالي المخزون',   cls: 'dash-stat-orange',  color: 'var(--secondary-dark)' },
                  { icon: 'fa-list-check',   num: orders.length,    label: lang === 'en' ? 'Total Orders' : 'إجمالي الطلبات',   cls: 'dash-stat-purple',  color: '#7c3aed' },
                  { icon: 'fa-hourglass-half', num: pendingOrders,  label: dt('overview.pendingOrds'),      cls: 'dash-stat-orange',  color: '#d97706' },
                  { icon: 'fa-coins',        num: `${totalRevenue} د.ك`, label: dt('overview.totalRev'), cls: 'dash-stat-green', color: 'var(--primary)' },
                ].map((s, i) => (
                  <Reveal key={i} delay={i * 70} direction="up">
                  <div className="dash-stat">
                    <div className={`dash-stat-icon ${s.cls}`}>
                      <i className={`fas ${s.icon}`} style={{ color: s.color }} aria-hidden="true"></i>
                    </div>
                    <div>
                      <div className="dash-stat-num">{s.num}</div>
                      <div className="dash-stat-label">{s.label}</div>
                    </div>
                  </div>
                  </Reveal>
                ))}
              </div>

              <div className="quick-actions">
                {[
                  { icon: 'fa-plus',        label: lang === 'en' ? 'Add New Product' : 'إضافة منتج جديد',    color: 'var(--primary)',       action: () => { setView('products'); setTimeout(openAddProduct, 100); } },
                  { icon: 'fa-users-gear',  label: lang === 'en' ? 'Manage Users' : 'إدارة المستخدمين',   color: '#7c3aed',               action: () => setView('users') },
                  { icon: 'fa-pen-nib',     label: lang === 'en' ? 'Edit Site Content' : 'تعديل محتوى الموقع', color: 'var(--secondary-dark)', action: openContentTab },
                  { icon: 'fa-list-check',  label: lang === 'en' ? 'View Orders' : 'عرض الطلبات',        color: '#0891b2',               action: () => setView('orders') },
                  { icon: 'fa-truck',       label: lang === 'en' ? 'Shipping Settings' : 'إعدادات الشحن',      color: '#16a34a',               action: openShippingTab },
                  { icon: 'fa-credit-card', label: dt('payments.title'),       color: '#e67e22',               action: openPaymentsTab },
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
                  <span className="table-title">{lang === 'en' ? 'Recent Orders' : 'آخر الطلبات'}</span>
                </div>
                <table>
                  <thead><tr><th>{dt('orders.ref')}</th><th>{dt('orders.client')}</th><th>{lang === 'en' ? 'Governorate' : 'المحافظة'}</th><th>{dt('orders.total')}</th><th>{dt('orders.payment')}</th><th>{dt('orders.status')}</th></tr></thead>
                  <tbody>
                    {orders.slice(0, 5).map(o => (
                      <tr key={o.id}>
                        <td className="td-primary">{o.ref}</td>
                        <td className="td-bold">{o.client}</td>
                        <td className="td-light">{o.governorate || '—'}</td>
                        <td className="td-bold">{o.grandTotal || o.total} د.ك</td>
                        <td><span className="badge-pay">{o.payment || '—'}</span></td>
                        <td><span className={`status-badge status-${o.status}`}>{orderStatusLabels[o.status]?.[lang] || orderStatusLabels[o.status]?.ar || o.status}</span></td>
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

              {/* ── Product Form (add/edit) ── */}
              {productsTab === 'list' && productFormMode && (
                <ProductForm
                  mode={productFormMode}
                  productId={productFormId}
                  onBack={closeProductForm}
                />
              )}

              {/* ── Products list ── */}
              {productsTab === 'list' && !productFormMode && (
              <div>
                {/* Header */}
                <div className="dash-header-row">
                  <div>
                    <div className="dashboard-title">{dt('nav.allProducts')}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-light)', marginTop: '2px' }}>
                      {filteredDashProducts.length} {lang === 'en' ? 'products' : 'منتج'} · {products.filter(p=>p.status==='active').length} {lang === 'en' ? 'active' : 'نشط'}
                      {prodTotalPages > 1 && <> · {lang === 'en' ? `Page ${prodPageSafe} of ${prodTotalPages}` : `صفحة ${prodPageSafe} من ${prodTotalPages}`}</>}
                    </div>
                  </div>
                  {perms.products && (
                    <button className="btn btn-green btn-sm" onClick={openAddProductForm}>
                      <i className="fas fa-plus" aria-hidden="true"></i> {dt('products.add')}
                    </button>
                  )}
                </div>

                {/* Filters bar */}
                <div className="prod-filters-bar">
                  <div className="dash-search-bar" style={{ flex: 1, minWidth: '180px' }}>
                    <i className="fas fa-magnifying-glass dash-search-icon"></i>
                    <input type="search" className="dash-search-input"
                      placeholder={lang === 'en' ? 'Search name, SKU, description...' : 'ابحث بالاسم أو SKU أو الوصف...'}
                      value={dashSearch} onChange={e => setDashSearch(e.target.value)} autoComplete="off" />
                    {dashSearch && <button className="dash-search-clear" onClick={() => setDashSearch('')}><i className="fas fa-xmark"></i></button>}
                  </div>
                  <select className="prod-filter-select" value={prodCatFilter} onChange={e => setProdCatFilter(e.target.value)}>
                    <option value="all">{lang === 'en' ? 'All Categories' : 'كل الفئات'}</option>
                    {flattenTree(buildCatTree(categories)).map(c => (
                      <option key={c.slug} value={c.slug}>{'　'.repeat(c.depth)}{c.depth > 0 ? '└ ' : ''}{c.nameAr}</option>
                    ))}
                  </select>
                  <select className="prod-filter-select" value={prodStatusFilter} onChange={e => setProdStatusFilter(e.target.value)}>
                    <option value="all">{lang === 'en' ? 'All Status' : 'كل الحالات'}</option>
                    {Object.entries(productStatusLabels).map(([k,v]) => <option key={k} value={k}>{v.ar}</option>)}
                  </select>
                  <select className="prod-filter-select" value={prodPerPage} onChange={e => { setProdPerPage(Number(e.target.value)); setProdPage(1); }} title={lang === 'en' ? 'Per page' : 'عدد في الصفحة'}>
                    <option value={10}>10 {lang === 'en' ? '/ page' : '/ صفحة'}</option>
                    <option value={25}>25 {lang === 'en' ? '/ page' : '/ صفحة'}</option>
                    <option value={50}>50 {lang === 'en' ? '/ page' : '/ صفحة'}</option>
                    <option value={100}>100 {lang === 'en' ? '/ page' : '/ صفحة'}</option>
                    <option value={999}>{lang === 'en' ? 'Show all' : 'عرض الكل'}</option>
                  </select>
                  {selectedProds.size > 0 && (
                    <button className="btn btn-sm" style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5' }} onClick={bulkDeleteProds}>
                      <i className="fas fa-trash"></i> {lang === 'en' ? 'Delete' : 'حذف'} ({selectedProds.size})
                    </button>
                  )}
                </div>

                {/* Table */}
                <div className="data-table prod-table-wrap">
                  <table className="prod-grid-table">
                    <thead>
                      <tr>
                        <th style={{ width: '36px' }}>
                          <input type="checkbox"
                            checked={selectedProds.size === filteredDashProducts.length && filteredDashProducts.length > 0}
                            onChange={toggleAllProds} />
                        </th>
                        <th style={{ width: '60px' }}>ID <SortIcon col="id" /></th>
                        <th style={{ width: '60px' }}>{lang === 'en' ? 'Img' : 'صورة'}</th>
                        <th style={{ minWidth: '160px', cursor: 'pointer' }} onClick={() => sortProd('name')}>
                          {dt('products.name')} <SortIcon col="name" />
                        </th>
                        <th style={{ cursor: 'pointer' }} onClick={() => sortProd('category')}>
                          {dt('products.category')} <SortIcon col="category" />
                        </th>
                        <th style={{ cursor: 'pointer' }} onClick={() => sortProd('sku')}>SKU <SortIcon col="sku" /></th>
                        <th style={{ cursor: 'pointer' }} onClick={() => sortProd('price')}>
                          {dt('products.price')} <SortIcon col="price" />
                        </th>
                        <th style={{ cursor: 'pointer' }} onClick={() => sortProd('stock')}>
                          {dt('products.stock')} <SortIcon col="stock" />
                        </th>
                        <th>{lang === 'en' ? 'Variants' : 'فاريشنات'}</th>
                        <th style={{ cursor: 'pointer' }} onClick={() => sortProd('status')}>
                          {dt('products.status')} <SortIcon col="status" />
                        </th>
                        <th>{dt('products.actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDashProducts.length === 0 && (
                        <tr><td colSpan="11" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>
                          {dt('products.noResults')}
                        </td></tr>
                      )}
                      {pagedProducts.map(p => (
                        <tr key={p.id} className={selectedProds.has(p.id) ? 'prod-row-selected' : ''}>
                          <td>
                            <input type="checkbox" checked={selectedProds.has(p.id)} onChange={() => toggleProdSelect(p.id)} />
                          </td>
                          <td className="td-light" style={{ fontSize: '12px' }}>#{p.id}</td>
                          <td>
                            {p.image
                              ? <img src={p.image} alt="" className="prod-thumb" />
                              : <div className="prod-thumb-empty">{p.icon || '📦'}</div>}
                          </td>
                          <td>
                            <div className="td-bold">{p.name}</div>
                            {p.nameEn && <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>{p.nameEn}</div>}
                            {p.badge && <span className="prod-badge-tag">{p.badge}</span>}
                          </td>
                          <td>
                            <span className="badge-cat">
                              {(() => { const c = categories.find(c => c.slug === p.category); return c ? c.nameAr : (categoryLabels[p.category]?.ar || p.category); })()}
                            </span>
                          </td>
                          <td className="td-mono">{p.sku || <span style={{ color: 'var(--text-light)' }}>—</span>}</td>
                          <td className="td-primary" style={{ fontWeight: 800 }}>
                            {p.variants?.length > 0
                              ? <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>{lang === 'en' ? 'See variants' : 'انظر الفاريشنات'}</span>
                              : <>{Number(p.price).toFixed(3)} <span style={{ fontSize: '11px' }}>د.ك</span></>}
                          </td>
                          <td>
                            {p.variants?.length > 0
                              ? <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>
                                  {p.variants.reduce((s, v) => s + (Number(v.stock) || 0), 0).toLocaleString()}
                                </span>
                              : <span className={Number(p.stock) < 100 ? 'td-warn' : ''}>{Number(p.stock).toLocaleString()}</span>}
                          </td>
                          <td>
                            {p.variants?.length > 0
                              ? <span className="prod-variant-count">{p.variants.length} {lang === 'en' ? 'var.' : 'فاريشن'}</span>
                              : <span style={{ color: 'var(--text-light)', fontSize: '12px' }}>—</span>}
                          </td>
                          <td>
                            <span className={`status-badge status-${p.status}`}>
                              {productStatusLabels[p.status]?.[lang] || productStatusLabels[p.status]?.ar}
                            </span>
                          </td>
                          <td>
                            <div className="prod-actions-td">
                              <button className="action-btn action-btn-edit" onClick={() => openEditProductForm(p.id)}>
                                <i className="fas fa-pen"></i> {dt('common.edit')}
                              </button>
                              <button className="action-btn action-btn-delete" onClick={() => handleDeleteProduct(p.id)}>
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* ── Pagination bar ── */}
                {prodTotalPages > 1 && (
                  <div className="prod-pagination">
                    <div className="prod-pag-info">
                      {lang === 'en'
                        ? `Showing ${(prodPageSafe-1)*prodPerPage+1}–${Math.min(prodPageSafe*prodPerPage, filteredDashProducts.length)} of ${filteredDashProducts.length}`
                        : `عرض ${(prodPageSafe-1)*prodPerPage+1}–${Math.min(prodPageSafe*prodPerPage, filteredDashProducts.length)} من ${filteredDashProducts.length}`}
                    </div>
                    <div className="prod-pag-btns">
                      <button className="prod-pag-btn" onClick={() => setProdPage(1)} disabled={prodPageSafe === 1} title={lang==='en'?'First':'الأول'}>
                        <i className="fas fa-angles-right"></i>
                      </button>
                      <button className="prod-pag-btn" onClick={() => setProdPage(p => Math.max(1, p-1))} disabled={prodPageSafe === 1} title={lang==='en'?'Prev':'السابق'}>
                        <i className="fas fa-chevron-right"></i>
                      </button>
                      {Array.from({ length: prodTotalPages }, (_, i) => i + 1)
                        .filter(n => n === 1 || n === prodTotalPages || Math.abs(n - prodPageSafe) <= 2)
                        .reduce((acc, n, idx, arr) => {
                          if (idx > 0 && n - arr[idx-1] > 1) acc.push('…');
                          acc.push(n);
                          return acc;
                        }, [])
                        .map((n, i) => n === '…'
                          ? <span key={`ellipsis-${i}`} className="prod-pag-ellipsis">…</span>
                          : <button key={n} className={`prod-pag-btn${n === prodPageSafe ? ' prod-pag-active' : ''}`} onClick={() => setProdPage(n)}>{n}</button>
                        )}
                      <button className="prod-pag-btn" onClick={() => setProdPage(p => Math.min(prodTotalPages, p+1))} disabled={prodPageSafe === prodTotalPages} title={lang==='en'?'Next':'التالي'}>
                        <i className="fas fa-chevron-left"></i>
                      </button>
                      <button className="prod-pag-btn" onClick={() => setProdPage(prodTotalPages)} disabled={prodPageSafe === prodTotalPages} title={lang==='en'?'Last':'الأخير'}>
                        <i className="fas fa-angles-left"></i>
                      </button>
                    </div>
                  </div>
                )}

              </div>
              )}

              {/* ── الأقسام — inline edit form ── */}
              {productsTab === 'collections' && catViewMode && (
              <div className="pf-wrap">
                <div className="pf-page-header">
                  <button className="pf-back-btn" type="button" onClick={closeCatView}><i className="fas fa-arrow-right"></i></button>
                  <div>
                    <div className="pf-page-title">{catViewMode === 'add' ? (lang === 'en' ? 'New Section' : 'قسم جديد') : (lang === 'en' ? `Edit: ${catEditData?.nameEn || catEditData?.nameAr}` : `تعديل: ${catEditData?.nameAr}`)}</div>
                    <div className="pf-page-sub">{dt('collections.title')}</div>
                  </div>
                  <div className="pf-header-actions">
                    <button className="btn btn-primary btn-sm" type="button" onClick={handleCatEditSave}>
                      <i className="fas fa-save"></i> {lang === 'en' ? 'Save Section' : 'حفظ القسم'}
                    </button>
                  </div>
                </div>

                {catEditSaved && <div className="pf-alert pf-alert-success"><i className="fas fa-check-circle"></i> {lang === 'en' ? 'Saved!' : 'تم الحفظ بنجاح!'}</div>}
                {catEditErr   && <div className="pf-alert pf-alert-error"><i className="fas fa-exclamation-circle"></i> {catEditErr}</div>}

                {/* Section 1: Basic Info */}
                <div className={`pf-acc${catEditOpenSecs.has('basic') ? ' pf-acc-open' : ''}`}>
                  <button type="button" className="pf-acc-header" onClick={() => toggleCatEditSec('basic')}>
                    <span className="pf-acc-icon-wrap"><i className="fas fa-tag"></i></span>
                    <span className="pf-acc-title">{lang === 'en' ? 'Basic Information' : 'المعلومات الأساسية'}</span>
                    <i className="fas fa-chevron-down pf-acc-arrow"></i>
                  </button>
                  <div className="pf-acc-body"><div className="pf-acc-inner">
                    <div className="pf-two-col">
                      <div className="pf-field">
                        <label className="pf-label">{lang === 'en' ? 'Arabic Name *' : 'الاسم بالعربي *'}</label>
                        <input className="form-input" value={catEditForm.nameAr} onChange={e => setCatEditForm(f => ({...f, nameAr: e.target.value}))} placeholder="مثال: مناديل وجه" />
                      </div>
                      <div className="pf-field">
                        <label className="pf-label">{lang === 'en' ? 'English Name' : 'الاسم بالإنجليزي'}</label>
                        <input className="form-input" dir="ltr" value={catEditForm.nameEn} onChange={e => setCatEditForm(f => ({...f, nameEn: e.target.value}))} placeholder="Facial Tissues" />
                      </div>
                    </div>
                    <div className="pf-two-col" style={{marginTop:'12px'}}>
                      <div className="pf-field">
                        <label className="pf-label">Slug * <span style={{fontSize:'11px', color:'var(--text-light)', fontWeight:400}}>أحرف إنجليزية صغيرة وأرقام وشرطة</span></label>
                        <input className="form-input" dir="ltr" value={catEditForm.slug} onChange={e => setCatEditForm(f => ({...f, slug: e.target.value.toLowerCase().replace(/\s/g,'-')}))} placeholder="facial-tissues" />
                      </div>
                      <div className="pf-field">
                        <label className="pf-label">{lang === 'en' ? 'Emoji / Icon' : 'الأيقونة / إيموجي'}</label>
                        <input className="form-input" value={catEditForm.emoji} onChange={e => setCatEditForm(f => ({...f, emoji: e.target.value}))} placeholder="📦" style={{fontSize:'20px'}} />
                      </div>
                    </div>
                  </div></div>
                </div>

                {/* Section 2: Settings */}
                <div className={`pf-acc${catEditOpenSecs.has('settings') ? ' pf-acc-open' : ''}`}>
                  <button type="button" className="pf-acc-header" onClick={() => toggleCatEditSec('settings')}>
                    <span className="pf-acc-icon-wrap"><i className="fas fa-sliders"></i></span>
                    <span className="pf-acc-title">{lang === 'en' ? 'Settings' : 'الإعدادات'}</span>
                    <i className="fas fa-chevron-down pf-acc-arrow"></i>
                  </button>
                  <div className="pf-acc-body"><div className="pf-acc-inner">
                    <div className="pf-two-col">
                      <div className="pf-field">
                        <label className="pf-label">{lang === 'en' ? 'Status' : 'الحالة'}</label>
                        <select className="form-select" value={catEditForm.status} onChange={e => setCatEditForm(f => ({...f, status: e.target.value}))}>
                          <option value="active">{lang === 'en' ? 'Active — Visible on site' : 'نشط — يظهر في الموقع'}</option>
                          <option value="inactive">{lang === 'en' ? 'Hidden' : 'مخفي'}</option>
                        </select>
                      </div>
                      <div className="pf-field">
                        <label className="pf-label">{lang === 'en' ? 'Sort Order' : 'الترتيب'}</label>
                        <input className="form-input" type="number" min="1" dir="ltr" value={catEditForm.sortOrder} onChange={e => setCatEditForm(f => ({...f, sortOrder: parseInt(e.target.value)||1}))} />
                      </div>
                    </div>
                    <div className="pf-field" style={{marginTop:'12px'}}>
                      <label className="pf-label">{lang === 'en' ? 'Parent Section' : 'القسم الأب'}</label>
                      <select className="form-select" value={catEditForm.parentId ?? ''} onChange={e => setCatEditForm(f => ({...f, parentId: e.target.value ? parseInt(e.target.value) : null}))}>
                        <option value="">{lang === 'en' ? '— None (Top Level) —' : '— بدون — قسم رئيسي —'}</option>
                        {flattenTree(buildCatTree(categories)).filter(c => catViewMode === 'add' || c.id !== catEditData?.id).map(c => (
                          <option key={c.id} value={c.id}>{'　'.repeat(c.depth)}{c.depth > 0 ? '└ ' : ''}{c.nameAr}</option>
                        ))}
                      </select>
                    </div>
                  </div></div>
                </div>

                {/* Section 3: Description */}
                <div className={`pf-acc${catEditOpenSecs.has('desc') ? ' pf-acc-open' : ''}`}>
                  <button type="button" className="pf-acc-header" onClick={() => toggleCatEditSec('desc')}>
                    <span className="pf-acc-icon-wrap"><i className="fas fa-align-right"></i></span>
                    <span className="pf-acc-title">{lang === 'en' ? 'Description' : 'الوصف'}</span>
                    <i className="fas fa-chevron-down pf-acc-arrow"></i>
                  </button>
                  <div className="pf-acc-body"><div className="pf-acc-inner">
                    <textarea className="form-textarea" style={{minHeight:'100px'}} value={catEditForm.desc} onChange={e => setCatEditForm(f => ({...f, desc: e.target.value}))} placeholder={lang === 'en' ? 'Short description of this section...' : 'وصف مختصر للقسم...'} />
                  </div></div>
                </div>

                <div className="pf-bottom-bar">
                  <button className="btn btn-outline btn-sm" type="button" onClick={closeCatView}><i className="fas fa-arrow-right"></i> {lang === 'en' ? 'Back' : 'رجوع'}</button>
                  <button className="btn btn-primary" type="button" onClick={handleCatEditSave}><i className="fas fa-save"></i> {lang === 'en' ? 'Save Section' : 'حفظ القسم'}</button>
                </div>
              </div>
              )}

              {/* ── الأقسام — table list ── */}
              {productsTab === 'collections' && !catViewMode && (
              <div>
                <div className="dash-header-row">
                  <div>
                    <div className="dashboard-title">{dt('collections.title')}</div>
                    <div style={{fontSize:'13px', color:'var(--text-light)', marginTop:'2px'}}>
                      {filteredCats.length} {lang === 'en' ? 'sections' : 'قسم'} · {categories.filter(c=>c.status==='active').length} {lang === 'en' ? 'active' : 'نشط'}
                    </div>
                  </div>
                  {perms.categories && (
                    <button className="btn btn-green btn-sm" type="button" onClick={openCatAdd}>
                      <i className="fas fa-plus"></i> {dt('collections.add')}
                    </button>
                  )}
                </div>

                {/* Filters bar */}
                <div className="prod-filters-bar">
                  <div className="dash-search-bar" style={{flex:1, minWidth:'180px'}}>
                    <i className="fas fa-magnifying-glass dash-search-icon"></i>
                    <input type="search" className="dash-search-input"
                      placeholder={lang === 'en' ? 'Search name, slug...' : 'ابحث بالاسم أو الـ Slug...'}
                      value={catSearch} onChange={e => setCatSearch(e.target.value)} autoComplete="off" />
                    {catSearch && <button className="dash-search-clear" onClick={() => setCatSearch('')}><i className="fas fa-xmark"></i></button>}
                  </div>
                  <select className="prod-filter-select" value={catStatusFilter} onChange={e => setCatStatusFilter(e.target.value)}>
                    <option value="all">{lang === 'en' ? 'All Status' : 'كل الحالات'}</option>
                    <option value="active">{lang === 'en' ? 'Active' : 'نشط'}</option>
                    <option value="inactive">{lang === 'en' ? 'Hidden' : 'مخفي'}</option>
                  </select>
                  <select className="prod-filter-select" value={catLevelFilter} onChange={e => setCatLevelFilter(e.target.value)}>
                    <option value="all">{lang === 'en' ? 'All Levels' : 'كل المستويات'}</option>
                    <option value="root">{lang === 'en' ? 'Top Level Only' : 'رئيسية فقط'}</option>
                    <option value="sub">{lang === 'en' ? 'Sub-sections Only' : 'فرعية فقط'}</option>
                  </select>
                </div>

                <div className="data-table">
                  <table>
                    <thead>
                      <tr>
                        <th>{lang === 'en' ? 'Section' : 'القسم'}</th>
                        <th>{lang === 'en' ? 'English Name' : 'الاسم الإنجليزي'}</th>
                        <th>Slug</th>
                        <th>{lang === 'en' ? 'Parent' : 'القسم الأب'}</th>
                        <th>{lang === 'en' ? 'Products' : 'المنتجات'}</th>
                        <th>{lang === 'en' ? 'Status' : 'الحالة'}</th>
                        <th>{lang === 'en' ? 'Actions' : 'إجراءات'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCats.length === 0 && (
                        <tr><td colSpan="7" style={{textAlign:'center', color:'var(--text-light)', padding:'40px'}}>
                          {catSearch || catStatusFilter !== 'all' || catLevelFilter !== 'all'
                            ? (lang === 'en' ? 'No sections match the filters.' : 'لا توجد أقسام تطابق الفلتر.')
                            : (lang === 'en' ? 'No sections yet.' : 'لا توجد أقسام.')}
                        </td></tr>
                      )}
                      {filteredCats.map(c => {
                        const prodCount   = products.filter(p => p.category === c.slug).length;
                        const hasChildren = categories.some(ch => ch.parentId === c.id);
                        const parent      = categories.find(p => p.id === c.parentId);
                        return (
                          <tr key={c.id}>
                            <td>
                              <div style={{display:'flex', alignItems:'center', gap:'8px', paddingInlineStart: catLevelFilter !== 'all' ? '0' : `${c.depth * 24}px`}}>
                                {c.depth > 0 && catLevelFilter === 'all' && <span style={{color:'var(--text-light)', fontSize:'12px'}}>└</span>}
                                <span className="cat-emoji-badge">{c.emoji || '📦'}</span>
                                <div>
                                  <div className="td-bold">{c.nameAr}</div>
                                  {hasChildren && <div style={{fontSize:'11px', color:'var(--primary)', marginTop:'2px'}}><i className="fas fa-sitemap"></i> {lang === 'en' ? 'Has sub-sections' : 'لها أقسام فرعية'}</div>}
                                </div>
                              </div>
                            </td>
                            <td className="td-light" dir="ltr">{c.nameEn || '—'}</td>
                            <td><span className="badge-cat" dir="ltr">{c.slug}</span></td>
                            <td className="td-light">{parent ? <span style={{display:'flex', alignItems:'center', gap:'4px'}}><span>{parent.emoji}</span><span>{parent.nameAr}</span></span> : <span style={{color:'var(--text-light)', fontSize:'12px'}}>{lang === 'en' ? 'Top Level' : 'رئيسي'}</span>}</td>
                            <td className="td-bold">{prodCount} {lang === 'en' ? 'product' : 'منتج'}</td>
                            <td><span className={`status-badge status-${c.status}`}>{c.status === 'active' ? (lang === 'en' ? 'Active' : 'نشط') : (lang === 'en' ? 'Hidden' : 'مخفي')}</span></td>
                            <td>
                              <button className="action-btn action-btn-edit" onClick={() => openCatEdit(c)}><i className="fas fa-pen"></i> {dt('common.edit')}</button>
                              <button className="action-btn action-btn-delete" onClick={() => handleDeleteCat(c)}><i className="fas fa-trash"></i></button>
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
                  <div className="dashboard-title">{lang === 'en' ? 'Inventory Management' : 'إدارة المخزون'}</div>
                  <button className="btn btn-green btn-sm" onClick={handleInvSave} disabled={invSaving}>
                    {invSaving
                      ? <><i className="fas fa-spinner fa-spin"></i> {dt('common.saving')}</>
                      : <><i className="fas fa-save"></i> {dt('inventory.save')}</>}
                  </button>
                </div>
                {invSaved && <AlertSuccess msg={lang === 'en' ? 'Inventory saved successfully!' : 'تم حفظ المخزون بنجاح!'} />}
                <p className="dash-section-desc">{lang === 'en' ? 'Edit stock quantities for all products at once.' : 'تعديل كميات المخزون لكل المنتجات دفعة واحدة.'}</p>
                <div className="data-table">
                  <table>
                    <thead>
                      <tr><th>{dt('inventory.product')}</th><th>{dt('products.category')}</th><th>{lang === 'en' ? 'Current Qty' : 'الكمية الحالية'}</th><th>{lang === 'en' ? 'Quick Adjust' : 'تعديل سريع'}</th><th>{lang === 'en' ? 'New Qty' : 'الكمية الجديدة'}</th><th>{dt('common.status')}</th></tr>
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
                            <td><span className="badge-cat">{categoryLabels[p.category]?.[lang] || categoryLabels[p.category]?.ar || p.category}</span></td>
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
                              {isZero  ? <span className="inv-badge inv-out">{lang === 'en' ? 'Out' : 'نفذ'}</span>
                              : isLow  ? <span className="inv-badge inv-low">{lang === 'en' ? 'Low' : 'منخفض'}</span>
                              : <span className="inv-badge inv-ok">{lang === 'en' ? 'OK' : 'متوفر'}</span>}
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
                <div className="dashboard-title">
                  {clientFilter
                    ? <><button className="client-back-btn" onClick={() => setClientFilter(null)} title={lang === 'en' ? 'Back to all orders' : 'العودة لكل الطلبات'}><i className="fas fa-arrow-right"></i></button> {lang === 'en' ? "Client's Orders" : 'طلبات العميل'}</>
                    : `${dt('orders.title')} (${orders.length})`
                  }
                </div>
              </div>

              {/* Client summary banner */}
              {clientFilter && (() => {
                const clientOrders = filteredOrders;
                const totalSpent   = clientOrders.reduce((s,o) => s + parseFloat(o.grandTotal || o.total || 0), 0);
                const withPhone    = clientOrders.find(o => o.phone);
                const withGov     = clientOrders.find(o => o.governorate);
                const withEmail   = clientOrders.find(o => o.email);
                return (
                  <div className="client-summary-banner">
                    <div className="client-summary-avatar">{clientFilter[0]}</div>
                    <div className="client-summary-info">
                      <div className="client-summary-name">{clientFilter}</div>
                      <div className="client-summary-meta" dir="ltr">
                        <i className="fas fa-phone"></i>
                        {withPhone?.phone
                          ? <a href={`tel:${withPhone.phone}`} style={{color:'inherit',textDecoration:'none'}}>{withPhone.phone}</a>
                          : <span style={{opacity:0.5}}>{lang === 'en' ? 'No phone' : 'لا يوجد رقم'}</span>}
                      </div>
                      {withGov?.governorate && <div className="client-summary-meta"><i className="fas fa-location-dot"></i> {withGov.governorate}</div>}
                      {withEmail?.email && <div className="client-summary-meta"><i className="fas fa-envelope"></i> {withEmail.email}</div>}
                    </div>
                    <div className="client-summary-stats">
                      <div className="client-stat"><span className="client-stat-num">{clientOrders.length}</span><span className="client-stat-label">{lang === 'en' ? 'Orders' : 'طلب'}</span></div>
                      <div className="client-stat"><span className="client-stat-num">{totalSpent.toFixed(3)}</span><span className="client-stat-label">{lang === 'en' ? 'KD total' : 'د.ك إجمالي'}</span></div>
                    </div>
                    <button className="client-summary-close" onClick={() => setClientFilter(null)} title={lang === 'en' ? 'Show all orders' : 'عرض كل الطلبات'}>
                      <i className="fas fa-xmark"></i> {lang === 'en' ? 'All Orders' : 'كل الطلبات'}
                    </button>
                  </div>
                );
              })()}

              {!clientFilter && (
                <div className="dash-search-bar">
                  <i className="fas fa-magnifying-glass dash-search-icon" aria-hidden="true"></i>
                  <input type="search" className="dash-search-input" placeholder={lang === 'en' ? 'Search by order ref, client, governorate or status...' : 'ابحث برقم الطلب أو العميل أو المحافظة أو الحالة...'} value={dashSearch} onChange={e => setDashSearch(e.target.value)} autoComplete="off" />
                  {dashSearch && <button className="dash-search-clear" onClick={() => setDashSearch('')}><i className="fas fa-xmark"></i></button>}
                  {dashSearch && <span className="dash-search-count">{filteredOrders.length} {lang === 'en' ? 'results' : 'نتيجة'}</span>}
                </div>
              )}

              <div className="data-table">
                <table>
                  <thead><tr><th>{dt('orders.ref')}</th><th>{dt('orders.client')}</th><th>{dt('orders.phone')}</th><th>{dt('orders.gov')}</th><th>{dt('orders.product')}</th><th>{dt('orders.total')}</th><th>{dt('orders.payment')}</th><th>{dt('orders.date')}</th><th>{dt('orders.status')}</th><th></th></tr></thead>
                  <tbody>
                    {filteredOrders.length === 0 && (
                      <tr><td colSpan="10" style={{ textAlign: 'center', color: 'var(--text-light)', padding: '40px' }}>{dt('orders.noResults')}</td></tr>
                    )}
                    {filteredOrders.map(o => (
                      <tr key={o.id}>
                        <td className="td-primary">{o.ref}</td>
                        <td>
                          <button
                            className={`client-name-btn${clientFilter === o.client ? ' active' : ''}`}
                            onClick={() => setClientFilter(o.client)}
                            title={lang === 'en' ? `View all orders for ${o.client}` : `عرض كل طلبات ${o.client}`}
                          >
                            {o.client}
                          </button>
                        </td>
                        <td className="td-light" dir="ltr">
                          {o.phone
                            ? <a href={`tel:${o.phone}`} style={{color:'var(--primary)',textDecoration:'none',fontWeight:600}}>{o.phone}</a>
                            : <span style={{color:'var(--text-light)'}}>—</span>}
                        </td>
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
                            {Object.entries(orderStatusLabels).map(([k, v]) => <option key={k} value={k}>{v?.[lang] || v?.ar}</option>)}
                          </select>
                        </td>
                        <td>
                          <button className="action-btn action-btn-edit" onClick={() => printInvoice(o)}>
                            <i className="fas fa-print"></i> {dt('common.print')}
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
                <div className="dashboard-title">{dt('invoices.title')} ({orders.length})</div>
              </div>
              <p className="dash-section-desc">{lang === 'en' ? 'View and print a professional invoice for each order.' : 'عرض وطباعة فاتورة لكل طلب بتصميم احترافي.'}</p>
              <div className="dash-search-bar">
                <i className="fas fa-magnifying-glass dash-search-icon" aria-hidden="true"></i>
                <input type="search" className="dash-search-input" placeholder={lang === 'en' ? 'Search by order ref, client or phone...' : 'ابحث برقم الطلب أو العميل أو الهاتف...'} value={dashSearch} onChange={e => setDashSearch(e.target.value)} autoComplete="off" />
                {dashSearch && <button className="dash-search-clear" onClick={() => setDashSearch('')}><i className="fas fa-xmark"></i></button>}
                {dashSearch && <span className="dash-search-count">{filteredOrders.length} {lang === 'en' ? 'results' : 'نتيجة'}</span>}
              </div>
              <div className="data-table">
                <table>
                  <thead>
                    <tr>
                      <th>{dt('orders.ref')}</th>
                      <th>{dt('orders.client')}</th>
                      <th>{dt('orders.phone')}</th>
                      <th>{dt('orders.gov')}</th>
                      <th>{dt('orders.product')}</th>
                      <th>{dt('orders.payment')}</th>
                      <th>{dt('orders.date')}</th>
                      <th>{dt('orders.total')}</th>
                      <th>{dt('orders.status')}</th>
                      <th>{dt('common.print')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 && <tr><td colSpan="10" className="td-light" style={{textAlign:'center',padding:'30px'}}>{lang === 'en' ? 'No orders yet.' : 'لا توجد طلبات بعد.'}</td></tr>}
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
                        <td><span className={`status-badge status-${o.status}`}>{orderStatusLabels[o.status]?.[lang] || orderStatusLabels[o.status]?.ar || o.status}</span></td>
                        <td>
                          <button className="action-btn action-btn-edit" onClick={() => printInvoice(o)}>
                            <i className="fas fa-print"></i> {dt('common.print')}
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
                <div className="dashboard-title">{lang === 'en' ? 'User Management' : 'إدارة المستخدمين'}</div>
                {perms.users && (
                  <button className="btn btn-green btn-sm" onClick={openAddUser}>
                    <i className="fas fa-user-plus" aria-hidden="true"></i> {dt('users.add')}
                  </button>
                )}
              </div>
              <div className="dash-search-bar">
                <i className="fas fa-magnifying-glass dash-search-icon" aria-hidden="true"></i>
                <input type="search" className="dash-search-input" placeholder={lang === 'en' ? 'Search by name, username or email...' : 'ابحث بالاسم أو اسم المستخدم أو البريد...'} value={dashSearch} onChange={e => setDashSearch(e.target.value)} autoComplete="off" />
                {dashSearch && <button className="dash-search-clear" onClick={() => setDashSearch('')}><i className="fas fa-xmark"></i></button>}
                {dashSearch && <span className="dash-search-count">{filteredUsers.length} {lang === 'en' ? 'results' : 'نتيجة'}</span>}
              </div>
              <div className="data-table">
                <table>
                  <thead><tr><th>#</th><th>{dt('users.name')}</th><th>{dt('users.username')}</th><th>{dt('users.phone')}</th><th>{dt('users.role')}</th><th>{dt('users.status')}</th><th>{dt('users.actions')}</th></tr></thead>
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
                        <td><span className={`role-badge role-${u.role}`}>{roleLabels[u.role]?.[lang] || roleLabels[u.role]?.ar || u.role}</span></td>
                        <td><span className={`user-status-badge ustatus-${u.status || 'active'}`}>{userStatusLabels[u.status || 'active']?.[lang] || userStatusLabels[u.status || 'active']?.ar}</span></td>
                        <td>
                          <button className="action-btn action-btn-edit" onClick={() => openEditUser(u)}><i className="fas fa-pen"></i> {dt('common.edit')}</button>
                          <button className="action-btn action-btn-delete" onClick={() => handleDeleteUser(u)} disabled={u.id === auth?.id}><i className="fas fa-trash"></i> {dt('common.delete')}</button>
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
              <div className="dash-header-row" style={{ marginBottom: 0 }}>
                <div className="dashboard-title" style={{ margin: 0 }}>{dt('content.title')}</div>
                <button className="btn btn-green btn-sm" onClick={handleContentSave} disabled={contentLoading}>
                  {contentLoading ? <><i className="fas fa-spinner fa-spin"></i> {dt('common.saving')}</> : <><i className="fas fa-save"></i> {dt('content.saveAll')}</>}
                </button>
              </div>
              <p className="dash-section-desc" style={{ marginBottom: 16 }}>{lang === 'en' ? 'Control all texts and images across all site pages. Changes appear immediately after saving.' : 'تحكم في نصوص وصور كل صفحات الموقع. التغييرات تظهر فوراً بعد الحفظ.'}</p>

              {/* Sub-tabs */}
              <div className="content-tabs">
                {[
                  { id: 'home',    label: dt('content.home'),    icon: 'fa-house' },
                  { id: 'about',   label: dt('content.about'),   icon: 'fa-circle-info' },
                  { id: 'contact', label: dt('content.contact'), icon: 'fa-phone' },
                  { id: 'banners', label: dt('content.banners'), icon: 'fa-images' },
                  { id: 'general', label: dt('content.general'), icon: 'fa-gear' },
                ].map(t => (
                  <button key={t.id} className={`content-tab-btn${contentTab === t.id ? ' active' : ''}`} onClick={() => setContentTab(t.id)}>
                    <i className={`fas ${t.icon}`}></i> {t.label}
                  </button>
                ))}
              </div>

              {contentSaved && <AlertSuccess msg={lang === 'en' ? 'Site content saved successfully!' : 'تم حفظ محتوى الموقع بنجاح!'} />}
              {contentErr   && <AlertError  msg={contentErr} />}

              <form onSubmit={handleContentSave} className="content-form">

                {/* ═══ HOME ═══ */}
                {contentTab === 'home' && (<>
                  <div className="content-section-title"><i className="fas fa-film"></i> الهيرو — الصورة والفيديو</div>
                  <div className="content-grid">
                    <ContentImgField label="صورة الهيرو (Fallback)" field="heroImage" hint="تظهر إذا فشل تشغيل الفيديو أو على الموبايل" />
                    <div className="form-group">
                      <label className="form-label">رابط الفيديو (MP4)</label>
                      <input className="form-input" dir="ltr" value={cf('heroVideoUrl')} onChange={e => setCf('heroVideoUrl', e.target.value)} placeholder="https://example.com/video.mp4" />
                      <div className="form-hint">يُشغَّل تلقائياً في خلفية الهيرو</div>
                    </div>
                    <ContentImgField label="صورة Poster للفيديو" field="heroPosterImg" hint="تظهر أثناء تحميل الفيديو" />
                  </div>

                  <div className="content-section-title"><i className="fas fa-heading"></i> نصوص الهيرو</div>
                  <div className="content-grid">
                    <div className="form-group"><label className="form-label">شارة الهيرو</label><input className="form-input" value={cf('heroBadge')} onChange={e => setCf('heroBadge', e.target.value)} placeholder="رائدة في صناعة المناديل..." /></div>
                    <div className="form-group"><label className="form-label">عنوان الهيرو الرئيسي</label><input className="form-input" value={cf('heroTitle')} onChange={e => setCf('heroTitle', e.target.value)} placeholder="جودة الجوهرة في كل لمسة" /></div>
                    <div className="form-group content-span2"><label className="form-label">وصف الهيرو</label><textarea className="form-textarea" value={cf('heroSubtitle')} onChange={e => setCf('heroSubtitle', e.target.value)} style={{ minHeight: '70px' }} placeholder="شركة الجوهرة للمناديل..." /></div>
                    <div className="form-group"><label className="form-label">نص زر المنتجات</label><input className="form-input" value={cf('heroBtnProducts')} onChange={e => setCf('heroBtnProducts', e.target.value)} placeholder="تصفح منتجاتنا" /></div>
                    <div className="form-group"><label className="form-label">نص زر التواصل</label><input className="form-input" value={cf('heroBtnContact')} onChange={e => setCf('heroBtnContact', e.target.value)} placeholder="تواصل معنا" /></div>
                  </div>

                  <div className="content-section-title"><i className="fas fa-chart-bar"></i> أرقام وإحصائيات</div>
                  <div className="content-grid">
                    {[
                      { field: 'statsYear',          label: 'سنة التأسيس' },
                      { field: 'founded',             label: 'تاريخ التأسيس الكامل' },
                      { field: 'factoryArea',         label: 'مساحة المصنع (م²)' },
                      { field: 'productionCapacity',  label: 'الطاقة الإنتاجية (طن/سنة)' },
                      { field: 'statsClients',        label: 'عدد العملاء' },
                    ].map(({ field, label }) => (
                      <div key={field} className="form-group">
                        <label className="form-label">{label}</label>
                        <input className="form-input" dir="ltr" value={cf(field)} onChange={e => setCf(field, e.target.value)} />
                      </div>
                    ))}
                  </div>

                  <div className="content-section-title"><i className="fas fa-star"></i> قسم "لماذا الجوهرة"</div>
                  <div className="content-grid">
                    <div className="form-group"><label className="form-label">عنوان القسم</label><input className="form-input" value={cf('whyTitle')} onChange={e => setCf('whyTitle', e.target.value)} placeholder="لماذا تختار الجوهرة؟" /></div>
                    <div className="form-group"><label className="form-label">وصف القسم</label><input className="form-input" value={cf('whySub')} onChange={e => setCf('whySub', e.target.value)} placeholder="..." /></div>
                  </div>
                </>)}

                {/* ═══ ABOUT ═══ */}
                {contentTab === 'about' && (<>
                  <div className="content-section-title"><i className="fas fa-book-open"></i> قصة الشركة</div>
                  <div className="form-group">
                    <label className="form-label">النص الأول (قصة التأسيس)</label>
                    <textarea className="form-textarea" value={cf('aboutStory')} onChange={e => setCf('aboutStory', e.target.value)} style={{ minHeight: '130px' }} placeholder="تأسست الشركة عام 1998..." />
                  </div>
                  <div className="form-group">
                    <label className="form-label">النص الثاني (إضافي)</label>
                    <textarea className="form-textarea" value={cf('aboutStory2')} onChange={e => setCf('aboutStory2', e.target.value)} style={{ minHeight: '100px' }} />
                  </div>
                  <ContentImgField label="صورة قصة الشركة" field="aboutStoryImg" hint="تظهر بجانب النص في صفحة عن الشركة" />

                  <div className="content-section-title"><i className="fas fa-user-tie"></i> المدير العام</div>
                  <div className="content-grid">
                    <div className="form-group"><label className="form-label">الاسم الكامل</label><input className="form-input" value={cf('ceoName')} onChange={e => setCf('ceoName', e.target.value)} placeholder="Bilal Mohammad Ghadar" /></div>
                    <div className="form-group"><label className="form-label">المسمى الوظيفي</label><input className="form-input" value={cf('ceoTitle')} onChange={e => setCf('ceoTitle', e.target.value)} placeholder="المدير العام" /></div>
                    <div className="form-group content-span2">
                      <label className="form-label">اقتباس المدير (اتركه فارغاً للإخفاء)</label>
                      <textarea className="form-textarea" value={cf('ceoQuote')} onChange={e => setCf('ceoQuote', e.target.value)} style={{ minHeight: '80px' }} />
                    </div>
                    <ContentImgField label="صورة المدير العام" field="ceoImage" hint="صورة شخصية تظهر في الرئيسية وصفحة عن الشركة" />
                  </div>

                  <div className="content-section-title"><i className="fas fa-bullseye"></i> الرسالة والرؤية</div>
                  <div className="content-grid">
                    <div className="form-group">
                      <label className="form-label">نص الرسالة 🎯</label>
                      <textarea className="form-textarea" value={cf('missionText')} onChange={e => setCf('missionText', e.target.value)} style={{ minHeight: '100px' }} placeholder="توفير منتجات ورقية عالية الجودة..." />
                    </div>
                    <div className="form-group">
                      <label className="form-label">نص الرؤية 🔭</label>
                      <textarea className="form-textarea" value={cf('visionText')} onChange={e => setCf('visionText', e.target.value)} style={{ minHeight: '100px' }} placeholder="أن نكون الخيار الأول..." />
                    </div>
                  </div>
                </>)}

                {/* ═══ CONTACT ═══ */}
                {contentTab === 'contact' && (<>
                  <div className="content-section-title"><i className="fas fa-phone"></i> بيانات التواصل</div>
                  <div className="content-grid">
                    {[
                      { field: 'companyPhone',    label: 'رقم الهاتف' },
                      { field: 'companyWhatsapp', label: 'واتساب' },
                      { field: 'companyEmail',    label: 'البريد الإلكتروني' },
                      { field: 'workHours',       label: 'ساعات العمل' },
                    ].map(({ field, label }) => (
                      <div key={field} className="form-group">
                        <label className="form-label">{label}</label>
                        <input className="form-input" dir="ltr" value={cf(field)} onChange={e => setCf(field, e.target.value)} />
                      </div>
                    ))}
                    <div className="form-group content-span2">
                      <label className="form-label">العنوان (عربي)</label>
                      <input className="form-input" value={cf('companyAddress')} onChange={e => setCf('companyAddress', e.target.value)} placeholder="المنطقة الصناعية — الشعيبة، الكويت" />
                    </div>
                    <div className="form-group content-span2">
                      <label className="form-label">العنوان (إنجليزي)</label>
                      <input className="form-input" dir="ltr" value={cf('companyAddressEn')} onChange={e => setCf('companyAddressEn', e.target.value)} placeholder="Industrial Area — Shuaiba, Kuwait" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">ساعات العمل (إنجليزي)</label>
                      <input className="form-input" dir="ltr" value={cf('workHoursEn')} onChange={e => setCf('workHoursEn', e.target.value)} placeholder="Sunday – Thursday: 8 AM – 5 PM" />
                    </div>
                  </div>

                  <div className="content-section-title"><i className="fas fa-map-location-dot"></i> خريطة جوجل</div>
                  <div className="form-group">
                    <label className="form-label">رابط Embed للخريطة</label>
                    <input className="form-input" dir="ltr" value={cf('mapEmbedUrl')} onChange={e => setCf('mapEmbedUrl', e.target.value)} placeholder="https://www.google.com/maps/embed?pb=..." />
                    <div className="form-hint">من Google Maps ← Share ← Embed a map ← انسخ الرابط من src="..."</div>
                  </div>
                  {cf('mapEmbedUrl') && (
                    <div style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
                      <iframe src={cf('mapEmbedUrl')} width="100%" height="250" style={{ border: 0 }} allowFullScreen loading="lazy" title="map-preview" />
                    </div>
                  )}

                  <div className="content-section-title"><i className="fas fa-share-nodes"></i> وسائل التواصل الاجتماعي</div>
                  <div className="content-grid">
                    {[
                      { field: 'instagramUrl', label: 'Instagram', icon: 'fa-instagram' },
                      { field: 'twitterUrl',   label: 'X (Twitter)', icon: 'fa-x-twitter' },
                      { field: 'linkedinUrl',  label: 'LinkedIn', icon: 'fa-linkedin-in' },
                      { field: 'facebookUrl',  label: 'Facebook', icon: 'fa-facebook-f' },
                      { field: 'tiktokUrl',    label: 'TikTok', icon: 'fa-tiktok' },
                      { field: 'youtubeUrl',   label: 'YouTube', icon: 'fa-youtube' },
                    ].map(({ field, label, icon }) => (
                      <div key={field} className="form-group">
                        <label className="form-label"><i className={`fab ${icon}`}></i> {label}</label>
                        <input className="form-input" dir="ltr" value={cf(field)} onChange={e => setCf(field, e.target.value)} placeholder="https://..." />
                      </div>
                    ))}
                  </div>
                </>)}

                {/* ═══ BANNERS ═══ */}
                {contentTab === 'banners' && (<>
                  <p className="dash-section-desc">صور الهيدر التي تظهر في أعلى كل صفحة. الحجم المناسب: 1920×400 بكسل.</p>

                  <div className="content-section-title"><i className="fas fa-house"></i> الرئيسية</div>
                  <div className="content-grid">
                    <ContentImgField label="صورة Hero الرئيسية" field="heroImage" hint="تظهر خلف النص في الهيرو (fallback للفيديو)" />
                    <ContentImgField label="صورة Poster الفيديو" field="heroPosterImg" hint="تظهر أثناء تحميل الفيديو" />
                  </div>

                  <div className="content-section-title"><i className="fas fa-circle-info"></i> صفحة عن الشركة</div>
                  <ContentImgField label="صورة الهيدر (عن الشركة)" field="aboutHeaderImg" hint="الصورة الكبيرة في أعلى صفحة عن الشركة" />
                  <ContentImgField label="صورة القصة" field="aboutStoryImg" hint="تظهر بجانب نص قصة الشركة" />

                  <div className="content-section-title"><i className="fas fa-box-open"></i> صفحة المنتجات</div>
                  <ContentImgField label="صورة الهيدر (المنتجات)" field="productsHeaderImg" hint="الصورة الكبيرة في أعلى صفحة المنتجات" />

                  <div className="content-section-title"><i className="fas fa-users"></i> صفحة العملاء</div>
                  <ContentImgField label="صورة الهيدر (العملاء)" field="clientsHeaderImg" hint="الصورة الكبيرة في أعلى صفحة عملاؤنا" />

                  <div className="content-section-title"><i className="fas fa-phone"></i> صفحة التواصل</div>
                  <ContentImgField label="صورة الهيدر (التواصل)" field="contactHeaderImg" hint="الصورة الكبيرة في أعلى صفحة تواصل معنا" />
                </>)}

                {/* ═══ GENERAL ═══ */}
                {contentTab === 'general' && (<>
                  <div className="content-section-title"><i className="fas fa-gem"></i> هوية الموقع</div>
                  <div className="content-grid">
                    <div className="form-group"><label className="form-label">اسم الموقع / الشركة</label><input className="form-input" value={cf('siteName')} onChange={e => setCf('siteName', e.target.value)} placeholder="الجوهرة للمناديل الورقية" /></div>
                    <div className="form-group"><label className="form-label">وصف الموقع (SEO)</label><input className="form-input" value={cf('siteDesc')} onChange={e => setCf('siteDesc', e.target.value)} placeholder="رائدة في صناعة المناديل بالكويت..." /></div>
                    <ContentImgField label="شعار الموقع (Logo)" field="siteLogoUrl" hint="PNG شفاف / SVG — الحجم المناسب: 200×60 بكسل" />
                    <ContentImgField label="Favicon (أيقونة التبويب)" field="faviconUrl" hint="ICO أو PNG 32×32 بكسل" />
                  </div>

                  <div className="content-section-title"><i className="fas fa-copyright"></i> الفوتر</div>
                  <div className="content-grid">
                    <div className="form-group"><label className="form-label">نص الفوتر السفلي</label><input className="form-input" value={cf('footerTagline')} onChange={e => setCf('footerTagline', e.target.value)} placeholder="جودة تثق بها..." /></div>
                    <div className="form-group"><label className="form-label">نص حقوق الملكية</label><input className="form-input" value={cf('footerCopyright')} onChange={e => setCf('footerCopyright', e.target.value)} placeholder="© 2025 شركة الجوهرة. جميع الحقوق محفوظة." /></div>
                  </div>

                  <div className="content-section-title"><i className="fas fa-palette"></i> ألوان الموقع</div>
                  <div className="content-grid">
                    {[
                      { field: 'colorPrimary', label: 'اللون الرئيسي', def: '#065089' },
                      { field: 'colorSecondary', label: 'اللون الثانوي', def: '#0d47a1' },
                      { field: 'colorAccent', label: 'لون التمييز', def: '#16a34a' },
                    ].map(({ field, label, def }) => (
                      <div key={field} className="form-group">
                        <label className="form-label">{label}</label>
                        <div style={{ display:'flex', gap: 8, alignItems:'center' }}>
                          <input type="color" value={cf(field) || def} onChange={e => setCf(field, e.target.value)} style={{ width: 44, height: 36, border:'1px solid var(--border)', borderRadius: 8, padding: 2, cursor:'pointer' }} />
                          <input className="form-input" dir="ltr" value={cf(field) || def} onChange={e => setCf(field, e.target.value)} style={{ flex: 1 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </>)}

                <div className="content-save-row">
                  <button type="submit" className="btn btn-green" disabled={contentLoading}>
                    {contentLoading ? <><i className="fas fa-spinner fa-spin"></i> {dt('common.saving')}</> : <><i className="fas fa-save"></i> {dt('common.saveDB')}</>}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ══ SHIPPING ══ */}
          {view === 'shipping' && shippingZones && shipCompanies && (
            <div>
              <div className="dash-header-row">
                <div className="dashboard-title">{dt('shipping.title')}</div>
                <button className="btn btn-green btn-sm" onClick={saveShipping}><i className="fas fa-save"></i> {dt('shipping.save')}</button>
              </div>
              {shippingSaved && <AlertSuccess msg={lang === 'en' ? 'Shipping settings saved successfully!' : 'تم حفظ إعدادات الشحن بنجاح!'} />}

              {/* Tab switcher */}
              <div className="shipping-tabs">
                <button className={`shipping-tab-btn${shippingTab === 'zones' ? ' active' : ''}`} onClick={() => setShippingTab('zones')}>
                  <i className="fas fa-map-marker-alt"></i> {dt('shipping.zones')}
                </button>
                <button className={`shipping-tab-btn${shippingTab === 'companies' ? ' active' : ''}`} onClick={() => setShippingTab('companies')}>
                  <i className="fas fa-truck"></i> {dt('shipping.companies')}
                </button>
              </div>

              {/* ── Zones ── */}
              {shippingTab === 'zones' && (
                <>
                  <p className="dash-section-desc">{lang === 'en' ? 'Control delivery zones and fees within Kuwait.' : 'تحكم في مناطق التوصيل ورسومها داخل الكويت.'}</p>
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
                          <label className="form-label" style={{ marginBottom: 0 }}>{lang === 'en' ? 'Delivery Fee (KD)' : 'رسوم التوصيل (د.ك)'}</label>
                          <input className="form-input zone-fee-input" type="number" step="0.250" min="0" value={zone.fee} onChange={e => updateZoneFee(zone.id, e.target.value)} dir="ltr" disabled={!zone.enabled} />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* ── Companies ── */}
              {shippingTab === 'companies' && (
                <>
                  <p className="dash-section-desc">{lang === 'en' ? 'Enable shipping companies and enter API credentials for automatic tracking.' : 'فعّل شركات الشحن وأدخل بيانات API لكل شركة لتفعيل التتبع التلقائي.'}</p>
                  <div className="payment-gateways-grid">
                    {[
                      { key: 'aramex',    nameAr: 'أرامكس الكويت',  nameEn: 'Aramex Kuwait',     emoji: '📦', bg: '#fff3e0', color: '#e65100', site: 'aramex.com' },
                      { key: 'dhl',       nameAr: 'DHL الكويت',      nameEn: 'DHL Express Kuwait', emoji: '✈️', bg: '#fff9c4', color: '#d32f2f', site: 'dhl.com' },
                      { key: 'zajel',     nameAr: 'زاجل إكسبريس',   nameEn: 'Zajel Express',      emoji: '🚀', bg: '#e8f5e9', color: '#2e7d32', site: 'zajel.com' },
                      { key: 'fetchr',    nameAr: 'فيتشر الكويت',   nameEn: 'Fetchr Kuwait',      emoji: '🔄', bg: '#e3f2fd', color: '#1565c0', site: 'fetchr.com' },
                      { key: 'mawasalat', nameAr: 'مواصلات',         nameEn: 'Mawasalat Express',  emoji: '🏠', bg: '#f3e5f5', color: '#6a1b9a', site: 'mawasalat.com' },
                    ].map(co => (
                      <div key={co.key} className="gateway-card">
                        <div className="gateway-header">
                          <div className="gateway-info">
                            <div className="gateway-icon" style={{ background: co.bg, fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{co.emoji}</div>
                            <div>
                              <div className="gateway-name">{lang === 'en' ? co.nameEn : co.nameAr}</div>
                              <div className="gateway-sub">{lang === 'en' ? co.nameAr : co.nameEn}</div>
                            </div>
                          </div>
                          <label className="toggle-switch">
                            <input type="checkbox" checked={shipCompanies[co.key]?.enabled || false} onChange={() => toggleShipCompany(co.key)} />
                            <span className="toggle-slider"></span>
                          </label>
                        </div>
                        {shipCompanies[co.key]?.enabled && (
                          <div className="gateway-fields">
                            <div className="form-group">
                              <label className="form-label">API Key</label>
                              <input className="form-input" dir="ltr" value={shipCompanies[co.key]?.apiKey || ''} onChange={e => setShipCompanyField(co.key, 'apiKey', e.target.value)} placeholder={`Enter ${co.nameEn} API key...`} />
                            </div>
                            <div className="form-group">
                              <label className="form-label">{lang === 'en' ? 'Account Number' : 'رقم الحساب'}</label>
                              <input className="form-input" dir="ltr" value={shipCompanies[co.key]?.accountNumber || ''} onChange={e => setShipCompanyField(co.key, 'accountNumber', e.target.value)} placeholder="Account / Customer Number" />
                            </div>
                            <p className="gateway-coming-soon">
                              <i className="fas fa-circle-info"></i> {lang === 'en' ? 'To get an API Key, visit' : 'للحصول على API Key تفضل بزيارة'} <a href={`https://${co.site}`} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>{co.site}</a>
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ══ PAYMENTS ══ */}
          {view === 'payments' && paySettings && (
            <div>
              <div className="dash-header-row">
                <div className="dashboard-title">{dt('payments.title')}</div>
                <button className="btn btn-green btn-sm" onClick={savePayments}><i className="fas fa-save"></i> {dt('payments.save')}</button>
              </div>
              {paySaved && <AlertSuccess msg={lang === 'en' ? 'Payment settings saved successfully!' : 'تم حفظ إعدادات الدفع بنجاح!'} />}
              <p className="dash-section-desc">{lang === 'en' ? 'Enable payment gateways and enter API keys to connect each gateway.' : 'فعّل بوابات الدفع وأدخل مفاتيح API للربط مع كل بوابة.'}</p>

              <div className="payment-gateways-grid">
                {/* Cash */}
                <div className="gateway-card">
                  <div className="gateway-header">
                    <div className="gateway-info"><div className="gateway-icon" style={{ background: '#dcfce7' }}><i className="fas fa-money-bills" style={{ color: '#16a34a' }}></i></div><div><div className="gateway-name">{lang === 'en' ? 'Cash on Delivery' : 'كاش عند الاستلام'}</div><div className="gateway-sub">Cash on Delivery</div></div></div>
                    <label className="toggle-switch"><input type="checkbox" checked={paySettings.cash?.enabled} onChange={() => toggleGateway('cash')} /><span className="toggle-slider"></span></label>
                  </div>
                </div>

                {/* Bank Transfer */}
                <div className="gateway-card">
                  <div className="gateway-header">
                    <div className="gateway-info"><div className="gateway-icon" style={{ background: '#dbeafe' }}><i className="fas fa-building-columns" style={{ color: '#1d4ed8' }}></i></div><div><div className="gateway-name">{lang === 'en' ? 'Bank Transfer' : 'تحويل بنكي'}</div><div className="gateway-sub">Bank Transfer</div></div></div>
                    <label className="toggle-switch"><input type="checkbox" checked={paySettings.transfer?.enabled} onChange={() => toggleGateway('transfer')} /><span className="toggle-slider"></span></label>
                  </div>
                  {paySettings.transfer?.enabled && (
                    <div className="gateway-fields">
                      <div className="form-group"><label className="form-label">{lang === 'en' ? 'Bank Name' : 'اسم البنك'}</label><input className="form-input" value={paySettings.transfer?.bankName || ''} onChange={e => setGatewayField('transfer', 'bankName', e.target.value)} /></div>
                      <div className="form-group"><label className="form-label">{lang === 'en' ? 'IBAN Number' : 'رقم الآيبان (IBAN)'}</label><input className="form-input" dir="ltr" value={paySettings.transfer?.iban || ''} onChange={e => setGatewayField('transfer', 'iban', e.target.value)} placeholder="KW81NBKU..." /></div>
                    </div>
                  )}
                </div>

                {/* KNET */}
                <div className="gateway-card">
                  <div className="gateway-header">
                    <div className="gateway-info"><div className="gateway-icon" style={{ background: '#e0e7ff' }}><i className="fas fa-credit-card" style={{ color: '#003087' }}></i></div><div><div className="gateway-name">K-NET</div><div className="gateway-sub">{lang === 'en' ? 'Kuwait Network' : 'الشبكة الكويتية'}</div></div></div>
                    <label className="toggle-switch"><input type="checkbox" checked={paySettings.knet?.enabled} onChange={() => toggleGateway('knet')} /><span className="toggle-slider"></span></label>
                  </div>
                  {paySettings.knet?.enabled && (
                    <div className="gateway-fields">
                      <div className="form-group"><label className="form-label">API Key</label><input className="form-input" dir="ltr" value={paySettings.knet?.apiKey || ''} onChange={e => setGatewayField('knet', 'apiKey', e.target.value)} placeholder="sk_..." /></div>
                      <label className="gateway-test-toggle"><input type="checkbox" checked={paySettings.knet?.testMode} onChange={() => setGatewayField('knet', 'testMode', !paySettings.knet?.testMode)} /> {lang === 'en' ? 'Test Mode' : 'وضع الاختبار (Test Mode)'}</label>
                    </div>
                  )}
                </div>

                {/* MyFatoorah */}
                <div className="gateway-card">
                  <div className="gateway-header">
                    <div className="gateway-info"><div className="gateway-icon" style={{ background: '#fff7ed' }}><i className="fas fa-wallet" style={{ color: '#e67e22' }}></i></div><div><div className="gateway-name">MyFatoorah</div><div className="gateway-sub">{lang === 'en' ? 'My Fatoorah' : 'ماي فاتورة'}</div></div></div>
                    <label className="toggle-switch"><input type="checkbox" checked={paySettings.myfatoorah?.enabled} onChange={() => toggleGateway('myfatoorah')} /><span className="toggle-slider"></span></label>
                  </div>
                  {paySettings.myfatoorah?.enabled && (
                    <div className="gateway-fields">
                      <div className="form-group"><label className="form-label">API Key</label><input className="form-input" dir="ltr" value={paySettings.myfatoorah?.apiKey || ''} onChange={e => setGatewayField('myfatoorah', 'apiKey', e.target.value)} placeholder="rLtt7iI3-..." /></div>
                      <label className="gateway-test-toggle"><input type="checkbox" checked={paySettings.myfatoorah?.testMode} onChange={() => setGatewayField('myfatoorah', 'testMode', !paySettings.myfatoorah?.testMode)} /> {lang === 'en' ? 'Test Mode' : 'وضع الاختبار'}</label>
                    </div>
                  )}
                </div>

                {/* Tap */}
                <div className="gateway-card">
                  <div className="gateway-header">
                    <div className="gateway-info"><div className="gateway-icon" style={{ background: '#f0fdf4' }}><i className="fas fa-mobile-screen" style={{ color: '#000' }}></i></div><div><div className="gateway-name">Tap Payments</div><div className="gateway-sub">{lang === 'en' ? 'Tap Payments' : 'تاب للمدفوعات'}</div></div></div>
                    <label className="toggle-switch"><input type="checkbox" checked={paySettings.tap?.enabled} onChange={() => toggleGateway('tap')} /><span className="toggle-slider"></span></label>
                  </div>
                  {paySettings.tap?.enabled && (
                    <div className="gateway-fields">
                      <div className="form-group"><label className="form-label">Secret Key</label><input className="form-input" dir="ltr" value={paySettings.tap?.apiKey || ''} onChange={e => setGatewayField('tap', 'apiKey', e.target.value)} placeholder="sk_test_..." /></div>
                      <label className="gateway-test-toggle"><input type="checkbox" checked={paySettings.tap?.testMode} onChange={() => setGatewayField('tap', 'testMode', !paySettings.tap?.testMode)} /> {lang === 'en' ? 'Test Mode' : 'وضع الاختبار'}</label>
                    </div>
                  )}
                </div>

                {/* Benefit Pay */}
                {[
                  { key: 'benefitpay', name: 'Benefit Pay', sub: lang === 'en' ? 'Benefit Pay' : 'بيفيت باي', color: '#00843d', bg: '#dcfce7' },
                ].map(gw => (
                  <div key={gw.key} className="gateway-card">
                    <div className="gateway-header">
                      <div className="gateway-info"><div className="gateway-icon" style={{ background: gw.bg }}><i className="fas fa-mobile-screen" style={{ color: gw.color }}></i></div><div><div className="gateway-name">{gw.name}</div><div className="gateway-sub">{gw.sub}</div></div></div>
                      <label className="toggle-switch"><input type="checkbox" checked={paySettings[gw.key]?.enabled} onChange={() => toggleGateway(gw.key)} /><span className="toggle-slider"></span></label>
                    </div>
                    {paySettings[gw.key]?.enabled && (
                      <div className="gateway-fields">
                        <p className="gateway-coming-soon"><i className="fas fa-circle-info"></i> {lang === 'en' ? 'Direct integration coming soon. You can enable this option now so it appears on the checkout page.' : 'سيتوفر الربط المباشر قريباً. يمكنك تفعيل الخيار الآن ليظهر في صفحة الدفع.'}</p>
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
                <div className="dashboard-title">{lang === 'en' ? 'Coupons & Discounts' : 'الكوبونات والخصومات'}</div>
                <button className="btn btn-green btn-sm" onClick={openAddCoupon}><i className="fas fa-plus"></i> {dt('coupons.add')}</button>
              </div>
              <div className="dash-search-bar">
                <i className="fas fa-magnifying-glass dash-search-icon" aria-hidden="true"></i>
                <input type="search" className="dash-search-input" placeholder={lang === 'en' ? 'Search by code, type or status...' : 'ابحث بالكود أو النوع أو الحالة...'} value={dashSearch} onChange={e => setDashSearch(e.target.value)} autoComplete="off" />
                {dashSearch && <button className="dash-search-clear" onClick={() => setDashSearch('')}><i className="fas fa-xmark"></i></button>}
                {dashSearch && <span className="dash-search-count">{filteredCoupons.length} {lang === 'en' ? 'results' : 'نتيجة'}</span>}
              </div>
              <div className="data-table">
                <table>
                  <thead><tr><th>{dt('coupons.code')}</th><th>{dt('coupons.type')}</th><th>{dt('coupons.value')}</th><th>{dt('coupons.minOrder')}</th><th>{lang === 'en' ? 'Usage' : 'الاستخدام'}</th><th>{dt('coupons.expiry')}</th><th>{dt('coupons.status')}</th><th>{dt('coupons.actions')}</th></tr></thead>
                  <tbody>
                    {filteredCoupons.map(c => (
                      <tr key={c.id}>
                        <td className="td-primary" dir="ltr">{c.code}</td>
                        <td><span className="badge-cat">{c.type === 'percent' ? (lang === 'en' ? 'Percent %' : 'نسبة %') : (lang === 'en' ? 'Fixed Amount' : 'مبلغ ثابت')}</span></td>
                        <td className="td-bold">{c.type === 'percent' ? `${c.value}%` : `${c.value} د.ك`}</td>
                        <td className="td-light">{c.minOrder ? `${c.minOrder} د.ك` : '—'}</td>
                        <td className="td-light">{c.usedCount || 0} / {c.maxUses || '∞'}</td>
                        <td className="td-light" dir="ltr">{c.expiry || '—'}</td>
                        <td><span className={`status-badge status-${c.status}`}>{c.status === 'active' ? dt('common.active') : dt('common.inactive')}</span></td>
                        <td>
                          <button className="action-btn action-btn-edit" onClick={() => openEditCoupon(c)}><i className="fas fa-pen"></i> {dt('common.edit')}</button>
                          <button className="action-btn action-btn-delete" onClick={async () => { if(window.confirm(`حذف كوبون "${c.code}"؟`)) await deleteCoupon(c.id); }}><i className="fas fa-trash"></i> {dt('common.delete')}</button>
                        </td>
                      </tr>
                    ))}
                    {coupons.length === 0 && <tr><td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-light)', padding: '40px' }}>{lang === 'en' ? 'No coupons yet' : 'لا توجد كوبونات بعد'}</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══ ANALYTICS ══ */}
          {view === 'reports' && (
            <div className="analytics-page">
              <div className="analytics-header">
                <div className="dashboard-title" style={{ margin: 0 }}>{dt('analytics.title')}</div>
                <div className="analytics-range-pills">
                  {[
                    { id: 'today', label: dt('analytics.today') },
                    { id: '7d',    label: dt('analytics.7d') },
                    { id: '30d',   label: dt('analytics.30d') },
                    { id: 'month', label: dt('analytics.month') },
                    { id: 'all',   label: dt('analytics.all') },
                  ].map(r => (
                    <button key={r.id} className={`analytics-pill${analyticsRange === r.id ? ' active' : ''}`} onClick={() => setAnalyticsRange(r.id)}>{r.label}</button>
                  ))}
                </div>
              </div>

              {/* ── KPI Cards ── */}
              <div className="analytics-kpi-row">
                {[
                  { label: dt('overview.totalRev'),                                         value: `${analyticsData.grossRevenue.toFixed(3)} د.ك`, icon: 'fa-coins',         cls: 'kpi-blue'   },
                  { label: lang === 'en' ? 'Total Orders' : 'عدد الطلبات',                  value: analyticsData.completed.length,                  icon: 'fa-bag-shopping',  cls: 'kpi-purple' },
                  { label: lang === 'en' ? 'Avg Order Value' : 'متوسط قيمة الطلب',         value: `${analyticsData.avgOrder.toFixed(3)} د.ك`,      icon: 'fa-chart-simple',  cls: 'kpi-green'  },
                  { label: dt('overview.activeProds'),                                       value: activeCount,                                      icon: 'fa-box-open',      cls: 'kpi-orange' },
                  { label: lang === 'en' ? 'Unique Clients' : 'العملاء الفريدون',           value: analyticsData.uniqueClients,                      icon: 'fa-users',         cls: 'kpi-teal'   },
                ].map((k, i) => (
                  <Reveal key={i} delay={i * 70} direction="up">
                  <div className={`analytics-kpi-card ${k.cls}`}>
                    <div className="kpi-icon"><i className={`fas ${k.icon}`}></i></div>
                    <div className="kpi-body">
                      <div className="kpi-value">{k.value}</div>
                      <div className="kpi-label">{k.label}</div>
                    </div>
                  </div>
                  </Reveal>
                ))}
              </div>

              {/* ── Line Chart + Breakdown ── */}
              <div className="analytics-row2">
                <div className="analytics-card analytics-card-wide">
                  <div className="analytics-card-title"><i className="fas fa-chart-area"></i> {lang === 'en' ? 'Sales Over Time' : 'المبيعات عبر الزمن'}</div>
                  <MiniLineChart data={analyticsData.lineData} height={140} />
                </div>
                <div className="analytics-card">
                  <div className="analytics-card-title"><i className="fas fa-receipt"></i> {lang === 'en' ? 'Sales Summary' : 'ملخص المبيعات'}</div>
                  <table className="analytics-breakdown-table">
                    <tbody>
                      <tr><td>{lang === 'en' ? 'Gross Revenue' : 'الإيرادات الإجمالية'}</td><td>{analyticsData.grossRevenue.toFixed(3)} د.ك</td></tr>
                      <tr><td>{lang === 'en' ? 'Discounts' : 'الخصومات'}</td><td className="text-red">- {analyticsData.discounts.toFixed(3)} د.ك</td></tr>
                      <tr><td>{lang === 'en' ? 'Shipping Fees' : 'رسوم الشحن'}</td><td>{analyticsData.shipping.toFixed(3)} د.ك</td></tr>
                      <tr className="breakdown-net"><td>{lang === 'en' ? 'Net' : 'الصافي'}</td><td>{analyticsData.net.toFixed(3)} د.ك</td></tr>
                      <tr><td>{lang === 'en' ? 'Cancelled' : 'ملغاة'}</td><td>{analyticsData.inRange.filter(o=>o.status==='cancelled').length} {lang === 'en' ? 'orders' : 'طلب'}</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ── Status Donut + Top Products + Top Regions ── */}
              <div className="analytics-row3">
                <div className="analytics-card">
                  <div className="analytics-card-title"><i className="fas fa-circle-half-stroke"></i> {lang === 'en' ? 'Orders by Status' : 'الطلبات حسب الحالة'}</div>
                  <DonutChart slices={analyticsData.statusSlices} />
                </div>
                <div className="analytics-card">
                  <div className="analytics-card-title"><i className="fas fa-trophy"></i> {lang === 'en' ? 'Top Products (by revenue)' : 'أفضل المنتجات (مبيعاً)'}</div>
                  {analyticsData.topProducts.length ? <HBar items={analyticsData.topProducts} unit=" د.ك" /> : <div className="analytics-empty-chart">{dt('common.noData')}</div>}
                </div>
                <div className="analytics-card">
                  <div className="analytics-card-title"><i className="fas fa-map-location-dot"></i> {lang === 'en' ? 'Top Regions' : 'أفضل المناطق'}</div>
                  {analyticsData.topGov.length ? <HBar items={analyticsData.topGov} unit={lang === 'en' ? ' orders' : ' طلب'} /> : <div className="analytics-empty-chart">{dt('common.noData')}</div>}
                </div>
              </div>

              {/* ── Top Clients + Payment Method ── */}
              <div className="analytics-row2">
                <div className="analytics-card analytics-card-wide">
                  <div className="analytics-card-title"><i className="fas fa-star"></i> {lang === 'en' ? 'Top Clients' : 'أفضل العملاء'}</div>
                  {analyticsData.topClients.length ? (
                    <div className="analytics-table-wrap">
                      <table className="analytics-table">
                        <thead><tr><th>#</th><th>{dt('orders.client')}</th><th>{dt('orders.phone')}</th><th>{lang === 'en' ? 'Orders' : 'الطلبات'}</th><th>{dt('orders.total')}</th></tr></thead>
                        <tbody>
                          {analyticsData.topClients.map((c, i) => (
                            <tr key={i}>
                              <td className="analytics-rank">{i+1}</td>
                              <td>
                                <button className="client-name-btn" onClick={() => { setClientFilter(c.name); setView('orders'); }}>
                                  {c.name}
                                </button>
                              </td>
                              <td className="text-muted" dir="ltr">{c.phone || '—'}</td>
                              <td>{c.orders}</td>
                              <td className="analytics-money">{c.total.toFixed(3)} د.ك</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : <div className="analytics-empty-chart">{dt('common.noData')}</div>}
                </div>
                <div className="analytics-card">
                  <div className="analytics-card-title"><i className="fas fa-credit-card"></i> {lang === 'en' ? 'Payment Methods' : 'طرق الدفع'}</div>
                  {analyticsData.payData.length ? <HBar items={analyticsData.payData} unit={lang === 'en' ? ' orders' : ' طلب'} /> : <div className="analytics-empty-chart">{dt('common.noData')}</div>}
                </div>
              </div>

            </div>
          )}

        </div>{/* /dashboard-main */}

        {/* ══ Product Modal ══ */}
        {productModal && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeProductModal()}>
            <div className="modal modal-xl" role="dialog">
              <div className="modal-header">
                <h3>{productModal === 'add' ? (lang === 'en' ? 'Add New Product' : 'إضافة منتج جديد') : (lang === 'en' ? 'Edit Product' : 'تعديل المنتج')}</h3>
                <button className="modal-close" onClick={closeProductModal}><i className="fas fa-xmark"></i></button>
              </div>
              {productSaved && <AlertSuccess msg={dt('common.savedOk')} />}
              {productErr   && <AlertError  msg={productErr} />}
              <form onSubmit={handleProductSave}>

                {/* ── Images ── */}
                <div className="product-lang-divider">🖼️ {lang === 'en' ? 'Images' : 'الصور'}</div>
                <div className="modal-grid2">
                  <div className="form-group">
                    <label className="form-label">{dt('products.image')}</label>
                    <label className="img-upload-box">
                      {(productForm.image || productImagePreview)
                        ? <img src={productForm.image || productImagePreview} alt="main" className="img-upload-preview" />
                        : <div className="img-upload-placeholder"><i className="fas fa-image"></i><span>{lang === 'en' ? 'Choose image' : 'اختر صورة'}</span></div>}
                      <input type="file" accept="image/*" onChange={handleMainImageChange} style={{display:'none'}} />
                      {(productForm.image || productImagePreview) && (
                        <button type="button" className="img-upload-remove" onClick={e => { e.preventDefault(); setProductForm(p=>({...p,image:''})); setProductImagePreview(''); }}>
                          <i className="fas fa-xmark"></i>
                        </button>
                      )}
                    </label>
                    {uploadingImg && <div style={{fontSize:'11px',color:'var(--text-light)',marginTop:'4px'}}><i className="fas fa-spinner fa-spin"></i> {lang === 'en' ? 'Uploading...' : 'جاري الرفع...'}</div>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">{dt('products.gallery')}</label>
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
                  <div className="form-group"><label className="form-label">{lang === 'en' ? 'Product Name (Arabic) *' : 'اسم المنتج (عربي) *'}</label><input className="form-input" name="name" value={productForm.name} onChange={e => setProductForm(p=>({...p,[e.target.name]:e.target.value}))} required /></div>
                  <div className="form-group"><label className="form-label">{dt('products.desc')}</label><input className="form-input" name="desc" value={productForm.desc} onChange={e => setProductForm(p=>({...p,[e.target.name]:e.target.value}))} /></div>
                </div>

                {/* ── English ── */}
                <div className="product-lang-divider">🇬🇧 English</div>
                <div className="modal-grid2">
                  <div className="form-group"><label className="form-label">Product Name (English)</label><input className="form-input" name="nameEn" value={productForm.nameEn} onChange={e => setProductForm(p=>({...p,[e.target.name]:e.target.value}))} dir="ltr" placeholder="e.g. Classic Facial Tissues" /></div>
                  <div className="form-group"><label className="form-label">Description (English)</label><input className="form-input" name="descEn" value={productForm.descEn} onChange={e => setProductForm(p=>({...p,[e.target.name]:e.target.value}))} dir="ltr" placeholder="e.g. Soft 3-layer tissues..." /></div>
                </div>

                {/* ── Product Data ── */}
                <div className="product-lang-divider">⚙️ {lang === 'en' ? 'Product Data' : 'بيانات المنتج'}</div>
                <div className="modal-grid2">
                  <div className="form-group"><label className="form-label">SKU ({lang === 'en' ? 'Product Code' : 'رمز المنتج'})</label><input className="form-input" name="sku" value={productForm.sku} onChange={e => setProductForm(p=>({...p,[e.target.name]:e.target.value}))} dir="ltr" placeholder="e.g. JAW-FAC-001" /></div>
                  <div className="form-group"><label className="form-label">{dt('products.badge')} ({lang === 'en' ? 'optional' : 'اختياري'})</label><input className="form-input" name="badge" value={productForm.badge} onChange={e => setProductForm(p=>({...p,[e.target.name]:e.target.value}))} /></div>
                </div>
                <div className="modal-grid2">
                  <div className="form-group"><label className="form-label">{dt('products.category')}</label><select className="form-select" name="category" value={productForm.category} onChange={e => setProductForm(p=>({...p,[e.target.name]:e.target.value}))}>{flattenTree(buildCatTree(categories)).map(c => (<option key={c.slug} value={c.slug}>{'　'.repeat(c.depth)}{c.depth > 0 ? '└ ' : ''}{c.nameAr}</option>))}</select></div>
                  <div className="form-group"><label className="form-label">{dt('products.status')}</label><select className="form-select" name="status" value={productForm.status} onChange={e => setProductForm(p=>({...p,[e.target.name]:e.target.value}))}>{Object.entries(productStatusLabels).map(([k,v])=><option key={k} value={k}>{v?.[lang] || v?.ar}</option>)}</select></div>
                </div>
                <div className="modal-grid2">
                  <div className="form-group"><label className="form-label">{dt('products.price')} *</label><input className="form-input" type="number" step="0.001" min="0" name="price" value={productForm.price} onChange={e => setProductForm(p=>({...p,[e.target.name]:e.target.value}))} required dir="ltr" /></div>
                  <div className="form-group"><label className="form-label">{dt('products.stock')} *</label><input className="form-input" type="number" min="0" name="stock" value={productForm.stock} onChange={e => setProductForm(p=>({...p,[e.target.name]:e.target.value}))} required dir="ltr" /></div>
                </div>
                {/* ── Shipping ── */}
                <div className="product-lang-divider">🚚 {lang === 'en' ? 'Shipping' : 'الشحن'} / Shipping</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={productForm.isPhysical} onChange={e => setProductForm(p => ({ ...p, isPhysical: e.target.checked }))} />
                    <span className="toggle-slider"></span>
                  </label>
                  <span style={{ fontWeight: 600, fontSize: '14px' }}>{lang === 'en' ? 'Physical product' : 'منتج مادي'} / Physical product</span>
                </div>
                {productForm.isPhysical && (
                  <>
                    <div className="modal-grid2">
                      <div className="form-group">
                        <label className="form-label">{lang === 'en' ? 'Weight (kg)' : 'الوزن (كغ)'}</label>
                        <input className="form-input" type="number" step="0.01" min="0" value={productForm.weight} onChange={e => setProductForm(p => ({ ...p, weight: e.target.value }))} dir="ltr" placeholder="0.50" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">{lang === 'en' ? 'Dimensions: L × W × H (cm)' : 'الأبعاد: طول × عرض × ارتفاع (سم)'}</label>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <input className="form-input" type="number" step="0.1" min="0" value={productForm.dimLength} onChange={e => setProductForm(p => ({ ...p, dimLength: e.target.value }))} dir="ltr" placeholder="L" />
                          <span style={{ color: 'var(--text-light)', flexShrink: 0 }}>×</span>
                          <input className="form-input" type="number" step="0.1" min="0" value={productForm.dimWidth}  onChange={e => setProductForm(p => ({ ...p, dimWidth:  e.target.value }))} dir="ltr" placeholder="W" />
                          <span style={{ color: 'var(--text-light)', flexShrink: 0 }}>×</span>
                          <input className="form-input" type="number" step="0.1" min="0" value={productForm.dimHeight} onChange={e => setProductForm(p => ({ ...p, dimHeight: e.target.value }))} dir="ltr" placeholder="H" />
                        </div>
                      </div>
                    </div>
                    <div className="modal-grid2">
                      <div className="form-group">
                        <label className="form-label">{lang === 'en' ? 'Country of Origin' : 'بلد المنشأ'}</label>
                        <select className="form-select" value={productForm.countryOfOrigin} onChange={e => setProductForm(p => ({ ...p, countryOfOrigin: e.target.value }))}>
                          <option value="KW">🇰🇼 الكويت (KW)</option>
                          <option value="SA">🇸🇦 السعودية (SA)</option>
                          <option value="AE">🇦🇪 الإمارات (AE)</option>
                          <option value="CN">🇨🇳 الصين (CN)</option>
                          <option value="TR">🇹🇷 تركيا (TR)</option>
                          <option value="IN">🇮🇳 الهند (IN)</option>
                          <option value="US">🇺🇸 أمريكا (US)</option>
                          <option value="DE">🇩🇪 ألمانيا (DE)</option>
                          <option value="EG">🇪🇬 مصر (EG)</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">HS Code <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>{lang === 'en' ? 'Customs Tariff Code' : 'رمز التعريفة الجمركية'}</span></label>
                        <input className="form-input" dir="ltr" value={productForm.hsCode} onChange={e => setProductForm(p => ({ ...p, hsCode: e.target.value }))} placeholder="e.g. 4818.10.00" />
                      </div>
                    </div>
                  </>
                )}

                {/* ── Variants / Packages ── */}
                <div className="product-lang-divider">📦 {lang === 'en' ? 'Packages / Variants' : 'الباقات / الأنواع'}</div>
                <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '12px' }}>
                  {lang === 'en'
                    ? 'If the product comes in multiple packages (e.g. 1 box, 5 boxes, carton), add them here. Leave empty to use the main price above.'
                    : 'إذا كان المنتج يأتي بأحجام أو باقات مختلفة (مثل علبة، 5 علب، كرتون)، أضفها هنا. إذا تركتها فارغة يُستخدم السعر الرئيسي بالأعلى.'}
                </p>
                <div className="variants-list">
                  {(productForm.variants || []).map((v, vi) => (
                    <div key={vi} className="variant-row">
                      <div className="variant-row-fields">
                        <div className="form-group" style={{ flex: 2 }}>
                          <label className="form-label" style={{ fontSize: '11px' }}>{lang === 'en' ? 'Arabic Name' : 'الاسم بالعربي'}</label>
                          <input className="form-input" value={v.nameAr} onChange={e => { const vs=[...(productForm.variants||[])]; vs[vi]={...vs[vi],nameAr:e.target.value}; setProductForm(p=>({...p,variants:vs})); }} placeholder="علبة واحدة" />
                        </div>
                        <div className="form-group" style={{ flex: 2 }}>
                          <label className="form-label" style={{ fontSize: '11px' }}>{lang === 'en' ? 'English Name' : 'الاسم بالإنجليزي'}</label>
                          <input className="form-input" dir="ltr" value={v.nameEn} onChange={e => { const vs=[...(productForm.variants||[])]; vs[vi]={...vs[vi],nameEn:e.target.value}; setProductForm(p=>({...p,variants:vs})); }} placeholder="Single Box" />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                          <label className="form-label" style={{ fontSize: '11px' }}>{lang === 'en' ? 'Price' : 'السعر'} (KD)</label>
                          <input className="form-input" type="number" step="0.001" min="0" dir="ltr" value={v.price} onChange={e => { const vs=[...(productForm.variants||[])]; vs[vi]={...vs[vi],price:e.target.value}; setProductForm(p=>({...p,variants:vs})); }} placeholder="1.500" />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                          <label className="form-label" style={{ fontSize: '11px' }}>{lang === 'en' ? 'Stock' : 'المخزون'}</label>
                          <input className="form-input" type="number" min="0" dir="ltr" value={v.stock} onChange={e => { const vs=[...(productForm.variants||[])]; vs[vi]={...vs[vi],stock:e.target.value}; setProductForm(p=>({...p,variants:vs})); }} placeholder="100" />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                          <label className="form-label" style={{ fontSize: '11px' }}>SKU</label>
                          <input className="form-input" dir="ltr" value={v.sku} onChange={e => { const vs=[...(productForm.variants||[])]; vs[vi]={...vs[vi],sku:e.target.value}; setProductForm(p=>({...p,variants:vs})); }} placeholder="SKU-001-1" />
                        </div>
                      </div>
                      <button type="button" className="variant-remove-btn" onClick={() => setProductForm(p => ({ ...p, variants: (p.variants||[]).filter((_,i)=>i!==vi) }))}>
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  ))}
                  <button type="button" className="btn btn-sm btn-outline" style={{ marginTop: '8px' }} onClick={() => setProductForm(p => ({ ...p, variants: [...(p.variants||[]), { nameAr: '', nameEn: '', price: '', stock: '', sku: '' }] }))}>
                    <i className="fas fa-plus"></i> {lang === 'en' ? 'Add Package' : 'إضافة باقة'}
                  </button>
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={closeProductModal} className="btn btn-outline">{dt('common.cancel')}</button>
                  <button type="submit" className="btn btn-green" disabled={uploadingImg}><i className="fas fa-save"></i> {dt('common.save')}</button>
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
                <h3>{userModal === 'add' ? (lang === 'en' ? 'Add New User' : 'إضافة مستخدم جديد') : (lang === 'en' ? 'Edit User' : 'تعديل المستخدم')}</h3>
                <button className="modal-close" onClick={closeUserModal}><i className="fas fa-xmark"></i></button>
              </div>
              {userSaved && <AlertSuccess msg={lang === 'en' ? 'User saved successfully!' : 'تم حفظ المستخدم بنجاح!'} />}
              {userErr   && <AlertError  msg={userErr} />}
              <form onSubmit={handleUserSave}>
                <div className="modal-grid2">
                  <div className="form-group"><label className="form-label">{lang === 'en' ? 'Full Name *' : 'الاسم الكامل *'}</label><input className="form-input" name="name" value={userForm.name} onChange={e => setUserForm(p=>({...p,[e.target.name]:e.target.value}))} required /></div>
                  <div className="form-group"><label className="form-label">{lang === 'en' ? 'Username * (letters and numbers only)' : 'اسم المستخدم * (أحرف وأرقام فقط)'}</label><input className="form-input" name="username" value={userForm.username} onChange={e => setUserForm(p=>({...p,[e.target.name]:e.target.value}))} required dir="ltr" /></div>
                </div>

                {/* Password with strength */}
                <div className="form-group">
                  <label className="form-label">{userModal === 'edit' ? (lang === 'en' ? 'New Password (leave empty to keep current)' : 'كلمة المرور الجديدة (اتركها فارغة للإبقاء)') : (lang === 'en' ? 'Password *' : 'كلمة المرور *')}</label>
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
                          { test: userForm.password.length >= 8,            label: lang === 'en' ? 'At least 8 characters' : '8 أحرف على الأقل' },
                          { test: /[A-Z]/.test(userForm.password),          label: lang === 'en' ? 'Uppercase letter (A-Z)' : 'حرف كبير (A-Z)' },
                          { test: /[0-9]/.test(userForm.password),          label: lang === 'en' ? 'At least one number' : 'رقم واحد على الأقل' },
                          { test: /[^A-Za-z0-9]/.test(userForm.password),  label: lang === 'en' ? 'Special character (!@#$...)' : 'رمز خاص (!@#$...)' },
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
                  <div className="form-group"><label className="form-label">{lang === 'en' ? 'Email' : 'البريد الإلكتروني'}</label><input className="form-input" type="email" name="email" value={userForm.email} onChange={e => setUserForm(p=>({...p,[e.target.name]:e.target.value}))} dir="ltr" placeholder="email@example.com" /></div>
                  <div className="form-group"><label className="form-label">{lang === 'en' ? 'Phone (Kuwait)' : 'رقم الهاتف (كويتي)'}</label><input className="form-input" name="phone" value={userForm.phone} onChange={e => setUserForm(p=>({...p,[e.target.name]:e.target.value}))} dir="ltr" placeholder="+96512345678" /></div>
                </div>

                <div className="modal-grid2">
                  <div className="form-group">
                    <label className="form-label">{lang === 'en' ? 'Role' : 'الصلاحية'}</label>
                    <select className="form-select" name="role" value={userForm.role} onChange={e => setUserForm(p=>({...p,[e.target.name]:e.target.value}))}>
                      {Object.entries(roleLabels).map(([k,v])=><option key={k} value={k}>{v?.[lang] || v?.ar}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">{lang === 'en' ? 'Account Status' : 'حالة الحساب'}</label>
                    <select className="form-select" name="status" value={userForm.status || 'active'} onChange={e => setUserForm(p=>({...p,[e.target.name]:e.target.value}))}>
                      {Object.entries(userStatusLabels).map(([k,v])=><option key={k} value={k}>{v?.[lang] || v?.ar}</option>)}
                    </select>
                  </div>
                </div>

                {/* Permissions preview */}
                <button type="button" className="perms-toggle-btn" onClick={() => setShowPerms(p=>!p)}>
                  <i className={`fas fa-chevron-${showPerms?'up':'down'}`}></i>
                  {lang === 'en' ? `Permissions for this role (${roleLabels[userForm.role]?.en || userForm.role})` : `صلاحيات هذه الوظيفة (${roleLabels[userForm.role]?.ar || userForm.role})`}
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
                  <button type="button" onClick={closeUserModal} className="btn btn-outline">{dt('common.cancel')}</button>
                  <button type="submit" className="btn btn-green"><i className="fas fa-save"></i> {dt('common.save')}</button>
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
                <h3>{couponModal === 'add' ? (lang === 'en' ? 'Add New Coupon' : 'إضافة كوبون جديد') : (lang === 'en' ? 'Edit Coupon' : 'تعديل الكوبون')}</h3>
                <button className="modal-close" onClick={closeCouponModal}><i className="fas fa-xmark"></i></button>
              </div>
              {couponSaved && <AlertSuccess msg={lang === 'en' ? 'Coupon saved successfully!' : 'تم حفظ الكوبون بنجاح!'} />}
              {couponErr   && <AlertError  msg={couponErr} />}
              <form onSubmit={handleCouponSave}>
                <div className="modal-grid2">
                  <div className="form-group"><label className="form-label">{lang === 'en' ? 'Discount Code *' : 'كود الخصم *'}</label><input className="form-input" name="code" value={couponForm.code} onChange={e => setCouponForm(p=>({...p,[e.target.name]:e.target.value.toUpperCase()}))} dir="ltr" placeholder="WELCOME10" required /></div>
                  <div className="form-group"><label className="form-label">{lang === 'en' ? 'Discount Type' : 'نوع الخصم'}</label>
                    <select className="form-select" name="type" value={couponForm.type} onChange={e => setCouponForm(p=>({...p,[e.target.name]:e.target.value}))}>
                      <option value="percent">{lang === 'en' ? 'Percentage (%)' : 'نسبة مئوية (%)'}</option>
                      <option value="fixed">{lang === 'en' ? 'Fixed Amount (KD)' : 'مبلغ ثابت (د.ك)'}</option>
                    </select>
                  </div>
                </div>
                <div className="modal-grid2">
                  <div className="form-group"><label className="form-label">{lang === 'en' ? 'Discount Value *' : 'قيمة الخصم *'} {couponForm.type === 'percent' ? '(%)' : '(د.ك)'}</label><input className="form-input" type="number" min="0" name="value" value={couponForm.value} onChange={e => setCouponForm(p=>({...p,[e.target.name]:e.target.value}))} dir="ltr" required /></div>
                  <div className="form-group"><label className="form-label">{lang === 'en' ? 'Min Order (KD)' : 'الحد الأدنى للطلب (د.ك)'}</label><input className="form-input" type="number" min="0" step="0.001" name="minOrder" value={couponForm.minOrder} onChange={e => setCouponForm(p=>({...p,[e.target.name]:e.target.value}))} dir="ltr" placeholder="0" /></div>
                </div>
                <div className="modal-grid2">
                  <div className="form-group"><label className="form-label">{lang === 'en' ? 'Max Uses (0 = unlimited)' : 'الحد الأقصى للاستخدام (0 = غير محدود)'}</label><input className="form-input" type="number" min="0" name="maxUses" value={couponForm.maxUses} onChange={e => setCouponForm(p=>({...p,[e.target.name]:e.target.value}))} dir="ltr" /></div>
                  <div className="form-group"><label className="form-label">{lang === 'en' ? 'Expiry Date' : 'تاريخ الانتهاء'}</label><input className="form-input" type="date" name="expiry" value={couponForm.expiry} onChange={e => setCouponForm(p=>({...p,[e.target.name]:e.target.value}))} dir="ltr" /></div>
                </div>
                <div className="modal-grid2">
                  <div className="form-group"><label className="form-label">{dt('common.status')}</label><select className="form-select" name="status" value={couponForm.status} onChange={e => setCouponForm(p=>({...p,[e.target.name]:e.target.value}))}><option value="active">{dt('common.active')}</option><option value="inactive">{dt('common.inactive')}</option></select></div>
                  <div className="form-group"><label className="form-label">{lang === 'en' ? 'Coupon Description' : 'وصف الكوبون'}</label><input className="form-input" name="desc" value={couponForm.desc} onChange={e => setCouponForm(p=>({...p,[e.target.name]:e.target.value}))} /></div>
                </div>
                <div className="modal-actions">
                  <button type="button" onClick={closeCouponModal} className="btn btn-outline">{dt('common.cancel')}</button>
                  <button type="submit" className="btn btn-green"><i className="fas fa-save"></i> {dt('common.save')}</button>
                </div>
              </form>
            </div>
          </div>
        )}

          {/* ══ SETTINGS ══ */}
          {view === 'settings' && waNumbers !== null && (
            <div>
              <div className="dashboard-title">إشعارات واتساب</div>

              <div className="dash-card" style={{ maxWidth: 720 }}>

                {/* شرح CallMeBot */}
                <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: '16px 20px', marginBottom: 24, fontSize: 13, lineHeight: 1.9 }}>
                  <strong style={{ fontSize: 14, color: '#15803d' }}>⚙️ طريقة الحصول على API Key (مجاني)</strong><br/>
                  <span style={{ color: '#166534' }}>
                    1. سيف الرقم ده في واتساب: <strong dir="ltr">+34 644 60 49 16</strong><br/>
                    2. ابعتله الرسالة دي بالضبط: <strong>I allow callmebot to send me messages</strong><br/>
                    3. هيرد عليك برقم الـ <strong>API Key</strong> — حطه هنا
                  </span>
                </div>

                {waNumbers.map((n, i) => (
                  <div key={i} style={{ background: '#f9fafb', border: '1px solid var(--border)', borderRadius: 10, padding: 18, marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                      <span style={{ fontWeight: 700, fontSize: 15, color: '#25d366' }}>
                        <i className="fab fa-whatsapp" style={{ marginLeft: 6 }}></i>
                        رقم {i + 1} {n.label ? `— ${n.label}` : ''}
                      </span>
                      <button onClick={() => removeWaNumber(i)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 13 }}>
                        <i className="fas fa-trash"></i> حذف
                      </button>
                    </div>

                    <div className="modal-grid2">
                      <div className="form-group">
                        <label className="form-label">اسم/تعريف (اختياري)</label>
                        <input className="form-input" value={n.label || ''} onChange={e => editWaNumber(i, 'label', e.target.value)} placeholder="مثال: المدير" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">رقم الواتساب اللي هيستلم الإشعار</label>
                        <input className="form-input" dir="ltr" value={n.phone || ''} onChange={e => editWaNumber(i, 'phone', e.target.value)} placeholder="+96512345678" />
                      </div>
                    </div>
                    <div className="form-group" style={{ marginTop: 10 }}>
                      <label className="form-label">API Key (CallMeBot)</label>
                      <input className="form-input" dir="ltr" value={n.apiKey || ''} onChange={e => editWaNumber(i, 'apiKey', e.target.value)} placeholder="1234567" />
                    </div>
                  </div>
                ))}

                <button onClick={addWaNumber} className="btn btn-outline" style={{ marginBottom: 16, width: '100%' }}>
                  <i className="fas fa-plus"></i> إضافة رقم
                </button>

                <button onClick={saveWaSettings} className="btn btn-green" style={{ width: '100%' }}>
                  {waSaved
                    ? <><i className="fas fa-check"></i> تم الحفظ!</>
                    : <><i className="fas fa-save"></i> حفظ الإعدادات</>}
                </button>
              </div>
            </div>
          )}

      </div>
    </>
  );
};

export default Dashboard;
