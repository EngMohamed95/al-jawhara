import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../../context/AppContext';
import { useLanguage } from '../../../context/LanguageContext';
import Seo from '../../../components/Seo';
import './index.css';

/* ── helpers ── */
const buildCatTree = (cats, parentId = null) =>
  cats.filter(c => (c.parentId ?? null) === parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(c => ({ ...c, children: buildCatTree(cats, c.id) }));
const flattenTree = (nodes, depth = 0) =>
  nodes.flatMap(n => [{ ...n, depth }, ...flattenTree(n.children || [], depth + 1)]);

const emptyVariant = () => ({ nameAr: '', nameEn: '', price: '', stock: '', sku: '', image: '' });
const emptyProduct = {
  name: '', nameEn: '', sku: '', category: 'facial', price: '', stock: '',
  status: 'active', image: '', gallery: [], desc: '', descEn: '', badge: '',
  isPhysical: true, weight: '', dimLength: '', dimWidth: '', dimHeight: '',
  countryOfOrigin: 'KW', hsCode: '', variants: [], icon: '📦',
};

const productStatusLabels = {
  active:  { ar: 'نشط',           en: 'Active' },
  pending: { ar: 'قيد المراجعة',  en: 'Pending' },
  inactive:{ ar: 'متوقف',         en: 'Inactive' },
};

const COMMON_ICONS = ['📦','🤧','🧻','🚽','🍽️','✨','💎','🛒','🎁','🏠','🏪','🌿','💧','🧼'];

const AlertSuccess = ({ msg }) => (
  <div className="pf-alert pf-alert-success"><i className="fas fa-circle-check"></i> {msg}</div>
);
const AlertError = ({ msg }) => (
  <div className="pf-alert pf-alert-error"><i className="fas fa-triangle-exclamation"></i> {msg}</div>
);

export default function ProductForm() {
  const navigate = useNavigate();
  const { id }   = useParams();           // undefined = new, number string = edit
  const isEdit   = Boolean(id);

  const { products, categories, addProduct, updateProduct } = useApp();
  const { lang } = useLanguage();
  const ar = (a, e) => lang === 'en' ? e : a;

  const [form,    setForm]    = useState(emptyProduct);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [err,     setErr]     = useState('');
  const [uploading, setUploading] = useState(false);
  const [activeSection, setActiveSection] = useState('images');

  /* Load existing product when editing */
  useEffect(() => {
    if (!isEdit) return;
    const p = products.find(x => String(x.id) === String(id));
    if (!p) return;
    setForm({
      name:            p.name            || '',
      nameEn:          p.nameEn          || '',
      sku:             p.sku             || '',
      category:        p.category        || 'facial',
      price:           p.price           ?? '',
      stock:           p.stock           ?? '',
      status:          p.status          || 'active',
      image:           p.image           || '',
      gallery:         p.gallery         || [],
      desc:            p.desc            || '',
      descEn:          p.descEn          || '',
      badge:           p.badge           || '',
      isPhysical:      p.isPhysical      !== false,
      weight:          p.weight          ?? '',
      dimLength:       p.dimLength       ?? '',
      dimWidth:        p.dimWidth        ?? '',
      dimHeight:       p.dimHeight       ?? '',
      countryOfOrigin: p.countryOfOrigin || 'KW',
      hsCode:          p.hsCode          || '',
      variants:        p.variants        || [],
      icon:            p.icon            || '📦',
    });
  }, [id, isEdit, products]);

  /* Upload helper */
  const uploadFile = useCallback(async (file) => {
    const IS_PROD = process.env.NODE_ENV === 'production';
    if (!IS_PROD) return URL.createObjectURL(file);
    const fd = new FormData(); fd.append('file', file);
    const res  = await fetch('/api/upload.php', { method: 'POST', body: fd });
    const json = await res.json();
    return json.url || null;
  }, []);

  const uploadFiles = useCallback(async (files) => {
    const IS_PROD = process.env.NODE_ENV === 'production';
    if (!IS_PROD) return Array.from(files).map(f => URL.createObjectURL(f));
    const fd = new FormData();
    Array.from(files).forEach(f => fd.append('files[]', f));
    const res  = await fetch('/api/upload.php', { method: 'POST', body: fd });
    const json = await res.json();
    return json.urls || (json.url ? [json.url] : []);
  }, []);

  const handleMainImage = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploading(true);
    const url = await uploadFile(file);
    if (url) setForm(p => ({ ...p, image: url }));
    setUploading(false);
  };

  const handleGallery = async (e) => {
    const files = e.target.files; if (!files.length) return;
    setUploading(true);
    const urls = await uploadFiles(files);
    setForm(p => ({ ...p, gallery: [...(p.gallery || []), ...urls] }));
    setUploading(false);
  };

  const removeGallery = (idx) =>
    setForm(p => ({ ...p, gallery: p.gallery.filter((_, i) => i !== idx) }));

  /* Variant helpers */
  const setVariant = (vi, field, val) =>
    setForm(p => {
      const vs = [...p.variants];
      vs[vi] = { ...vs[vi], [field]: val };
      return { ...p, variants: vs };
    });

  const addVariant = () =>
    setForm(p => ({ ...p, variants: [...p.variants, emptyVariant()] }));

  const removeVariant = (vi) =>
    setForm(p => ({ ...p, variants: p.variants.filter((_, i) => i !== vi) }));

  const moveVariant = (vi, dir) =>
    setForm(p => {
      const vs = [...p.variants];
      const to = vi + dir;
      if (to < 0 || to >= vs.length) return p;
      [vs[vi], vs[to]] = [vs[to], vs[vi]];
      return { ...p, variants: vs };
    });

  const handleVariantImage = async (vi, e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploading(true);
    const url = await uploadFile(file);
    if (url) setVariant(vi, 'image', url);
    setUploading(false);
  };

  const set = (field, val) => setForm(p => ({ ...p, [field]: val }));
  const onInput = (e) => set(e.target.name, e.target.value);

  /* Save */
  const handleSave = async (e) => {
    e.preventDefault();
    setErr('');
    if (!form.name.trim()) { setErr(ar('اسم المنتج مطلوب', 'Product name is required')); return; }
    if (!form.price)        { setErr(ar('السعر مطلوب', 'Price is required')); return; }
    if (!form.stock && form.stock !== 0) { setErr(ar('المخزون مطلوب', 'Stock is required')); return; }

    setSaving(true);
    const data = {
      ...form,
      price:     parseFloat(form.price),
      stock:     parseInt(form.stock),
      badge:     form.badge || null,
      weight:    form.weight    ? parseFloat(form.weight)    : null,
      dimLength: form.dimLength ? parseFloat(form.dimLength) : null,
      dimWidth:  form.dimWidth  ? parseFloat(form.dimWidth)  : null,
      dimHeight: form.dimHeight ? parseFloat(form.dimHeight) : null,
      variants:  form.variants.map(v => ({
        ...v,
        price: parseFloat(v.price) || 0,
        stock: parseInt(v.stock)   || 0,
      })),
    };

    try {
      if (isEdit) {
        const orig = products.find(x => String(x.id) === String(id));
        await updateProduct(Number(id), { ...orig, ...data });
      } else {
        await addProduct(data);
      }
      setSaved(true);
      setTimeout(() => navigate('/dashboard'), 900);
    } catch {
      setErr(ar('حدث خطأ أثناء الحفظ.', 'An error occurred while saving.'));
    } finally {
      setSaving(false);
    }
  };

  const catFlat = flattenTree(buildCatTree(categories));

  const SECTIONS = [
    { id: 'images',   icon: 'fa-image',      label: ar('الصور', 'Images') },
    { id: 'content',  icon: 'fa-pen',        label: ar('المحتوى', 'Content') },
    { id: 'details',  icon: 'fa-sliders',    label: ar('التفاصيل', 'Details') },
    { id: 'shipping', icon: 'fa-truck',      label: ar('الشحن', 'Shipping') },
    { id: 'variants', icon: 'fa-layer-group',label: ar('الفاريشنات', 'Variants') },
  ];

  return (
    <div className="pf-page">
      <Seo noIndex />

      {/* ── Top bar ── */}
      <div className="pf-topbar">
        <div className="pf-topbar-inner">
          <button className="pf-back-btn" onClick={() => navigate('/dashboard')}>
            <i className="fas fa-arrow-right"></i>
          </button>
          <div className="pf-breadcrumb">
            <span className="pf-breadcrumb-link" onClick={() => navigate('/dashboard')}>
              {ar('لوحة التحكم', 'Dashboard')}
            </span>
            <i className="fas fa-chevron-left pf-breadcrumb-sep"></i>
            <span className="pf-breadcrumb-link" onClick={() => navigate('/dashboard')}>
              {ar('المنتجات', 'Products')}
            </span>
            <i className="fas fa-chevron-left pf-breadcrumb-sep"></i>
            <span className="pf-breadcrumb-current">
              {isEdit ? ar('تعديل المنتج', 'Edit Product') : ar('منتج جديد', 'New Product')}
            </span>
          </div>
          <div className="pf-topbar-actions">
            <button type="button" className="pf-btn pf-btn-outline" onClick={() => navigate('/dashboard')}>
              {ar('إلغاء', 'Cancel')}
            </button>
            <button
              type="button"
              className="pf-btn pf-btn-primary"
              onClick={handleSave}
              disabled={saving || uploading}
            >
              {saving
                ? <><i className="fas fa-spinner fa-spin"></i> {ar('جاري الحفظ...', 'Saving...')}</>
                : <><i className="fas fa-save"></i> {ar('حفظ المنتج', 'Save Product')}</>}
            </button>
          </div>
        </div>
      </div>

      <div className="pf-body">
        {/* ── Section nav ── */}
        <nav className="pf-section-nav">
          {SECTIONS.map(s => (
            <button
              key={s.id}
              type="button"
              className={`pf-section-nav-btn${activeSection === s.id ? ' active' : ''}`}
              onClick={() => {
                setActiveSection(s.id);
                document.getElementById(`pf-sec-${s.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              <i className={`fas ${s.icon}`}></i>
              <span>{s.label}</span>
            </button>
          ))}
        </nav>

        {/* ── Form ── */}
        <form className="pf-form" onSubmit={handleSave} noValidate>
          {saved && <AlertSuccess msg={ar('تم الحفظ بنجاح! جاري الرجوع...', 'Saved! Redirecting...')} />}
          {err   && <AlertError  msg={err} />}
          {uploading && (
            <div className="pf-uploading-bar">
              <i className="fas fa-spinner fa-spin"></i> {ar('جاري رفع الصورة...', 'Uploading image...')}
            </div>
          )}

          {/* ══ IMAGES ══ */}
          <div id="pf-sec-images" className="pf-section">
            <div className="pf-section-header">
              <i className="fas fa-image"></i>
              <h2>{ar('الصور', 'Images')}</h2>
            </div>
            <div className="pf-images-layout">
              {/* Main image */}
              <div className="pf-main-img-wrap">
                <div className="pf-main-img-label">{ar('الصورة الرئيسية', 'Main Image')}</div>
                <label className="pf-img-upload-box pf-img-main">
                  {form.image
                    ? <img src={form.image} alt="main" className="pf-img-preview" />
                    : <div className="pf-img-placeholder">
                        <i className="fas fa-cloud-arrow-up"></i>
                        <span>{ar('اسحب صورة هنا أو اضغط للاختيار', 'Drop image here or click to choose')}</span>
                      </div>}
                  <input type="file" accept="image/*" onChange={handleMainImage} style={{ display: 'none' }} />
                  {form.image && (
                    <button
                      type="button" className="pf-img-remove"
                      onClick={e => { e.preventDefault(); set('image', ''); }}
                    ><i className="fas fa-xmark"></i></button>
                  )}
                </label>
              </div>

              {/* Gallery */}
              <div className="pf-gallery-wrap">
                <div className="pf-main-img-label">
                  {ar('معرض الصور', 'Gallery')}
                  <span className="pf-label-hint">({(form.gallery || []).length}/6)</span>
                </div>
                <div className="pf-gallery-grid">
                  {(form.gallery || []).map((url, idx) => (
                    <div key={idx} className="pf-gallery-thumb">
                      <img src={url} alt={`g${idx}`} />
                      <button type="button" className="pf-img-remove" onClick={() => removeGallery(idx)}>
                        <i className="fas fa-xmark"></i>
                      </button>
                    </div>
                  ))}
                  {(form.gallery || []).length < 6 && (
                    <label className="pf-gallery-add">
                      <i className="fas fa-plus"></i>
                      <span>{ar('إضافة', 'Add')}</span>
                      <input type="file" accept="image/*" multiple onChange={handleGallery} style={{ display: 'none' }} />
                    </label>
                  )}
                </div>
              </div>

              {/* Icon emoji */}
              <div className="pf-icon-wrap">
                <div className="pf-main-img-label">{ar('إيموجي المنتج', 'Product Icon')}</div>
                <div className="pf-icon-current">{form.icon || '📦'}</div>
                <div className="pf-icon-grid">
                  {COMMON_ICONS.map(ic => (
                    <button
                      key={ic} type="button"
                      className={`pf-icon-btn${form.icon === ic ? ' active' : ''}`}
                      onClick={() => set('icon', ic)}
                    >{ic}</button>
                  ))}
                  <input
                    className="pf-icon-input"
                    value={form.icon}
                    onChange={e => set('icon', e.target.value)}
                    placeholder="📦"
                    maxLength={4}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ══ CONTENT ══ */}
          <div id="pf-sec-content" className="pf-section">
            <div className="pf-section-header">
              <i className="fas fa-pen"></i>
              <h2>{ar('المحتوى', 'Content')}</h2>
            </div>
            <div className="pf-two-col">
              <div className="pf-lang-block">
                <div className="pf-lang-badge pf-lang-ar">🇸🇦 عربي</div>
                <div className="pf-field">
                  <label className="pf-label">{ar('اسم المنتج *', 'Product Name *')}</label>
                  <input className="pf-input" name="name" value={form.name} onChange={onInput}
                    placeholder="مثال: مناديل الوجه الكلاسيكية" required />
                </div>
                <div className="pf-field">
                  <label className="pf-label">{ar('الوصف', 'Description')}</label>
                  <textarea className="pf-textarea" name="desc" value={form.desc} onChange={onInput}
                    placeholder="وصف المنتج بالعربي..." rows={4} />
                </div>
              </div>
              <div className="pf-lang-block">
                <div className="pf-lang-badge pf-lang-en">🇬🇧 English</div>
                <div className="pf-field">
                  <label className="pf-label">Product Name (English)</label>
                  <input className="pf-input" name="nameEn" value={form.nameEn} onChange={onInput}
                    dir="ltr" placeholder="e.g. Classic Facial Tissues" />
                </div>
                <div className="pf-field">
                  <label className="pf-label">Description (English)</label>
                  <textarea className="pf-textarea" name="descEn" value={form.descEn} onChange={onInput}
                    dir="ltr" placeholder="Product description in English..." rows={4} />
                </div>
              </div>
            </div>
          </div>

          {/* ══ DETAILS ══ */}
          <div id="pf-sec-details" className="pf-section">
            <div className="pf-section-header">
              <i className="fas fa-sliders"></i>
              <h2>{ar('تفاصيل المنتج', 'Product Details')}</h2>
            </div>
            <div className="pf-grid-3">
              <div className="pf-field">
                <label className="pf-label">SKU / {ar('رمز المنتج', 'Product Code')}</label>
                <input className="pf-input" name="sku" value={form.sku} onChange={onInput}
                  dir="ltr" placeholder="e.g. JAW-FAC-001" />
              </div>
              <div className="pf-field">
                <label className="pf-label">{ar('الشارة (اختياري)', 'Badge (optional)')}</label>
                <input className="pf-input" name="badge" value={form.badge} onChange={onInput}
                  placeholder={ar('مثال: الأكثر مبيعاً', 'e.g. Best Seller')} />
              </div>
              <div className="pf-field">
                <label className="pf-label">{ar('الحالة', 'Status')}</label>
                <select className="pf-select" name="status" value={form.status} onChange={onInput}>
                  {Object.entries(productStatusLabels).map(([k, v]) => (
                    <option key={k} value={k}>{lang === 'en' ? v.en : v.ar}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="pf-grid-3">
              <div className="pf-field">
                <label className="pf-label">{ar('الفئة', 'Category')}</label>
                <select className="pf-select" name="category" value={form.category} onChange={onInput}>
                  {catFlat.map(c => (
                    <option key={c.slug} value={c.slug}>
                      {'　'.repeat(c.depth)}{c.depth > 0 ? '└ ' : ''}{c.nameAr}
                    </option>
                  ))}
                </select>
              </div>
              <div className="pf-field">
                <label className="pf-label">{ar('السعر الأساسي (د.ك) *', 'Base Price (KD) *')}</label>
                <input className="pf-input" type="number" step="0.001" min="0" name="price"
                  value={form.price} onChange={onInput} dir="ltr" placeholder="0.000" required />
                <span className="pf-hint">{ar('يُستخدم إذا لم تكن هناك فاريشنات', 'Used if no variants are defined')}</span>
              </div>
              <div className="pf-field">
                <label className="pf-label">{ar('المخزون الأساسي *', 'Base Stock *')}</label>
                <input className="pf-input" type="number" min="0" name="stock"
                  value={form.stock} onChange={onInput} dir="ltr" placeholder="0" required />
                <span className="pf-hint">{ar('مجموع المخزون إذا لم تكن هناك فاريشنات', 'Total stock if no variants')}</span>
              </div>
            </div>
          </div>

          {/* ══ SHIPPING ══ */}
          <div id="pf-sec-shipping" className="pf-section">
            <div className="pf-section-header">
              <i className="fas fa-truck"></i>
              <h2>{ar('الشحن', 'Shipping')}</h2>
            </div>
            <div className="pf-toggle-row">
              <label className="pf-toggle">
                <input type="checkbox" checked={form.isPhysical}
                  onChange={e => set('isPhysical', e.target.checked)} />
                <span className="pf-toggle-slider"></span>
              </label>
              <span className="pf-toggle-label">{ar('منتج مادي (يحتاج شحن)', 'Physical product (requires shipping)')}</span>
            </div>
            {form.isPhysical && (
              <div className="pf-shipping-fields">
                <div className="pf-grid-2">
                  <div className="pf-field">
                    <label className="pf-label">{ar('الوزن (كغ)', 'Weight (kg)')}</label>
                    <input className="pf-input" type="number" step="0.01" min="0"
                      value={form.weight} onChange={e => set('weight', e.target.value)}
                      dir="ltr" placeholder="0.50" />
                  </div>
                  <div className="pf-field">
                    <label className="pf-label">{ar('الأبعاد: طول × عرض × ارتفاع (سم)', 'Dimensions: L × W × H (cm)')}</label>
                    <div className="pf-dims-row">
                      <input className="pf-input" type="number" step="0.1" min="0"
                        value={form.dimLength} onChange={e => set('dimLength', e.target.value)}
                        dir="ltr" placeholder="L" />
                      <span className="pf-dims-sep">×</span>
                      <input className="pf-input" type="number" step="0.1" min="0"
                        value={form.dimWidth} onChange={e => set('dimWidth', e.target.value)}
                        dir="ltr" placeholder="W" />
                      <span className="pf-dims-sep">×</span>
                      <input className="pf-input" type="number" step="0.1" min="0"
                        value={form.dimHeight} onChange={e => set('dimHeight', e.target.value)}
                        dir="ltr" placeholder="H" />
                    </div>
                  </div>
                </div>
                <div className="pf-grid-2">
                  <div className="pf-field">
                    <label className="pf-label">{ar('بلد المنشأ', 'Country of Origin')}</label>
                    <select className="pf-select" value={form.countryOfOrigin}
                      onChange={e => set('countryOfOrigin', e.target.value)}>
                      <option value="KW">🇰🇼 {ar('الكويت', 'Kuwait')} (KW)</option>
                      <option value="SA">🇸🇦 {ar('السعودية', 'Saudi Arabia')} (SA)</option>
                      <option value="AE">🇦🇪 {ar('الإمارات', 'UAE')} (AE)</option>
                      <option value="CN">🇨🇳 {ar('الصين', 'China')} (CN)</option>
                      <option value="TR">🇹🇷 {ar('تركيا', 'Turkey')} (TR)</option>
                      <option value="IN">🇮🇳 {ar('الهند', 'India')} (IN)</option>
                      <option value="US">🇺🇸 {ar('أمريكا', 'USA')} (US)</option>
                      <option value="DE">🇩🇪 {ar('ألمانيا', 'Germany')} (DE)</option>
                      <option value="EG">🇪🇬 {ar('مصر', 'Egypt')} (EG)</option>
                    </select>
                  </div>
                  <div className="pf-field">
                    <label className="pf-label">
                      HS Code <span className="pf-label-hint">{ar('رمز التعريفة الجمركية', 'Customs Tariff Code')}</span>
                    </label>
                    <input className="pf-input" dir="ltr" value={form.hsCode}
                      onChange={e => set('hsCode', e.target.value)} placeholder="e.g. 4818.10.00" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ══ VARIANTS ══ */}
          <div id="pf-sec-variants" className="pf-section">
            <div className="pf-section-header">
              <i className="fas fa-layer-group"></i>
              <h2>{ar('الفاريشنات / الباقات', 'Variants / Packages')}</h2>
              <span className="pf-variant-count">{form.variants.length}</span>
            </div>
            <p className="pf-section-desc">
              {ar(
                'أضف فاريشنات أو باقات مختلفة للمنتج (مثل علبة واحدة، 5 علب، كرتون). كل فاريشن له سعر ومخزون وصورة مستقلة.',
                'Add variants or packages for the product (e.g. Single Box, 5 Boxes, Carton). Each variant has its own price, stock, and image.'
              )}
            </p>

            {form.variants.length === 0 && (
              <div className="pf-variants-empty">
                <i className="fas fa-layer-group"></i>
                <p>{ar('لا توجد فاريشنات بعد — اضغط الزر أدناه للإضافة', 'No variants yet — click the button below to add')}</p>
              </div>
            )}

            <div className="pf-variants-list">
              {form.variants.map((v, vi) => (
                <div key={vi} className="pf-variant-card">
                  {/* Variant header */}
                  <div className="pf-variant-header">
                    <div className="pf-variant-num">#{vi + 1}</div>
                    <div className="pf-variant-name-preview">
                      {v.nameAr || v.nameEn || ar('فاريشن جديد', 'New Variant')}
                    </div>
                    <div className="pf-variant-controls">
                      <button type="button" className="pf-variant-ctrl-btn"
                        onClick={() => moveVariant(vi, -1)} disabled={vi === 0}
                        title={ar('تحريك لأعلى', 'Move up')}>
                        <i className="fas fa-chevron-up"></i>
                      </button>
                      <button type="button" className="pf-variant-ctrl-btn"
                        onClick={() => moveVariant(vi, 1)} disabled={vi === form.variants.length - 1}
                        title={ar('تحريك لأسفل', 'Move down')}>
                        <i className="fas fa-chevron-down"></i>
                      </button>
                      <button type="button" className="pf-variant-ctrl-btn pf-variant-del"
                        onClick={() => removeVariant(vi)}
                        title={ar('حذف', 'Delete')}>
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>

                  {/* Variant body */}
                  <div className="pf-variant-body">
                    {/* Variant image */}
                    <div className="pf-variant-img-col">
                      <label className="pf-img-upload-box pf-variant-img-box">
                        {v.image
                          ? <img src={v.image} alt={`v${vi}`} className="pf-img-preview" />
                          : <div className="pf-img-placeholder pf-img-placeholder-sm">
                              <i className="fas fa-image"></i>
                              <span>{ar('صورة', 'Image')}</span>
                            </div>}
                        <input type="file" accept="image/*"
                          onChange={e => handleVariantImage(vi, e)} style={{ display: 'none' }} />
                        {v.image && (
                          <button type="button" className="pf-img-remove"
                            onClick={e => { e.preventDefault(); setVariant(vi, 'image', ''); }}>
                            <i className="fas fa-xmark"></i>
                          </button>
                        )}
                      </label>
                    </div>

                    {/* Variant fields */}
                    <div className="pf-variant-fields">
                      <div className="pf-grid-2">
                        <div className="pf-field">
                          <label className="pf-label pf-label-sm">🇸🇦 {ar('الاسم بالعربي', 'Arabic Name')}</label>
                          <input className="pf-input" value={v.nameAr}
                            onChange={e => setVariant(vi, 'nameAr', e.target.value)}
                            placeholder={ar('مثال: علبة واحدة', 'e.g. Single Box')} />
                        </div>
                        <div className="pf-field">
                          <label className="pf-label pf-label-sm">🇬🇧 English Name</label>
                          <input className="pf-input" dir="ltr" value={v.nameEn}
                            onChange={e => setVariant(vi, 'nameEn', e.target.value)}
                            placeholder="e.g. Single Box" />
                        </div>
                      </div>
                      <div className="pf-grid-3">
                        <div className="pf-field">
                          <label className="pf-label pf-label-sm">💰 {ar('السعر (د.ك)', 'Price (KD)')}</label>
                          <input className="pf-input" type="number" step="0.001" min="0" dir="ltr"
                            value={v.price} onChange={e => setVariant(vi, 'price', e.target.value)}
                            placeholder="1.500" />
                        </div>
                        <div className="pf-field">
                          <label className="pf-label pf-label-sm">📦 {ar('المخزون', 'Stock')}</label>
                          <input className="pf-input" type="number" min="0" dir="ltr"
                            value={v.stock} onChange={e => setVariant(vi, 'stock', e.target.value)}
                            placeholder="100" />
                        </div>
                        <div className="pf-field">
                          <label className="pf-label pf-label-sm">🏷️ SKU</label>
                          <input className="pf-input" dir="ltr" value={v.sku}
                            onChange={e => setVariant(vi, 'sku', e.target.value)}
                            placeholder="SKU-001-V1" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button type="button" className="pf-add-variant-btn" onClick={addVariant}>
              <i className="fas fa-plus"></i>
              {ar('إضافة فاريشن جديد', 'Add New Variant')}
            </button>
          </div>

          {/* ── Bottom actions ── */}
          <div className="pf-bottom-actions">
            <button type="button" className="pf-btn pf-btn-outline" onClick={() => navigate('/dashboard')}>
              <i className="fas fa-arrow-right"></i> {ar('رجوع بدون حفظ', 'Back without saving')}
            </button>
            <button type="submit" className="pf-btn pf-btn-primary pf-btn-lg" disabled={saving || uploading}>
              {saving
                ? <><i className="fas fa-spinner fa-spin"></i> {ar('جاري الحفظ...', 'Saving...')}</>
                : <><i className="fas fa-save"></i> {ar('حفظ المنتج', 'Save Product')}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
