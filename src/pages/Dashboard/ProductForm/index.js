import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../../context/AppContext';
import { useLanguage } from '../../../context/LanguageContext';
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

const AlertSuccess = ({ msg }) => (
  <div className="pf-alert pf-alert-success"><i className="fas fa-circle-check"></i> {msg}</div>
);
const AlertError = ({ msg }) => (
  <div className="pf-alert pf-alert-error"><i className="fas fa-triangle-exclamation"></i> {msg}</div>
);

/* ── Accordion Section ── */
const AccSection = ({ id, icon, title, badge, open, onToggle, order, isDragging, isDragOver, onDragStart, onDragOver, onDrop, onDragEnd, children }) => (
  <div
    className={`pf-acc${open ? ' pf-acc-open' : ''}${isDragOver ? ' pf-acc-drag-over' : ''}`}
    style={{ order, opacity: isDragging ? 0.35 : 1, transition: 'opacity 0.15s' }}
    onDragOver={e => { e.preventDefault(); onDragOver(id); }}
    onDrop={e => { e.preventDefault(); onDrop(id); }}
  >
    <div className="pf-acc-header-row">
      <span
        className="pf-acc-grip"
        draggable="true"
        onDragStart={e => { e.stopPropagation(); onDragStart(id); }}
        onDragEnd={onDragEnd}
        title="اسحب لتغيير الترتيب"
      >
        <i className="fas fa-grip-vertical"></i>
      </span>
      <button type="button" className="pf-acc-header" onClick={() => onToggle(id)}>
        <span className="pf-acc-icon-wrap"><i className={`fas ${icon}`}></i></span>
        <span className="pf-acc-title">{title}</span>
        {badge != null && <span className="pf-acc-badge">{badge}</span>}
        <i className="fas fa-chevron-down pf-acc-arrow"></i>
      </button>
    </div>
    <div className="pf-acc-body">
      <div className="pf-acc-inner">{children}</div>
    </div>
  </div>
);

export default function ProductForm({ mode, productId, onBack }) {
  const isEdit = mode === 'edit';
  const { products, categories, addProduct, updateProduct } = useApp();
  const { lang } = useLanguage();
  const ar = (a, e) => lang === 'en' ? e : a;

  const [form,      setForm]      = useState(emptyProduct);
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [err,       setErr]       = useState('');
  const [uploading, setUploading] = useState(false);

  /* All sections open by default */
  const [openSections, setOpenSections] = useState(new Set(['images','content','details','shipping','variants']));
  const toggleSection = (id) => setOpenSections(s => {
    const n = new Set(s);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });
  const expandAll  = () => setOpenSections(new Set(['images','content','details','shipping','variants']));
  const collapseAll = () => setOpenSections(new Set());

  /* Section drag-and-drop ordering */
  const [sectionOrder, setSectionOrder] = useState(['images','content','details','shipping','variants']);
  const [dragId,       setDragId]       = useState(null);
  const [dragOverId,   setDragOverId]   = useState(null);

  const onSecDragStart  = (id) => setDragId(id);
  const onSecDragOver   = (id) => { if (id !== dragId) setDragOverId(id); };
  const onSecDrop       = (targetId) => {
    if (!dragId || dragId === targetId) { setDragId(null); setDragOverId(null); return; }
    setSectionOrder(prev => {
      const arr = [...prev];
      const from = arr.indexOf(dragId);
      const to   = arr.indexOf(targetId);
      arr.splice(from, 1);
      arr.splice(to, 0, dragId);
      return arr;
    });
    setDragId(null); setDragOverId(null);
  };
  const onSecDragEnd = () => { setDragId(null); setDragOverId(null); };

  const secProps = (id) => ({
    order:      sectionOrder.indexOf(id),
    isDragging: dragId === id,
    isDragOver: dragOverId === id,
    onDragStart: onSecDragStart,
    onDragOver:  onSecDragOver,
    onDrop:      onSecDrop,
    onDragEnd:   onSecDragEnd,
  });

  /* Load existing product when editing */
  useEffect(() => {
    if (!isEdit || !productId) { setForm(emptyProduct); return; }
    const p = products.find(x => x.id === productId);
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
  }, [isEdit, productId, products]);

  /* Upload helpers */
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

  const addVariant    = () => setForm(p => ({ ...p, variants: [...p.variants, emptyVariant()] }));
  const removeVariant = (vi) => setForm(p => ({ ...p, variants: p.variants.filter((_, i) => i !== vi) }));
  const moveVariant   = (vi, dir) => setForm(p => {
    const vs = [...p.variants]; const to = vi + dir;
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

  const set     = (field, val) => setForm(p => ({ ...p, [field]: val }));
  const onInput = (e) => set(e.target.name, e.target.value);

  /* Save */
  const handleSave = async (e) => {
    e.preventDefault();
    setErr('');
    if (!form.name.trim()) { setErr(ar('اسم المنتج مطلوب', 'Product name is required')); return; }
    if (!form.price)        { setErr(ar('السعر مطلوب', 'Price is required')); return; }

    setSaving(true);
    const data = {
      ...form,
      price:     parseFloat(form.price),
      stock:     parseInt(form.stock) || 0,
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
        const orig = products.find(x => x.id === productId);
        await updateProduct(productId, { ...orig, ...data });
      } else {
        await addProduct(data);
      }
      setSaved(true);
      setTimeout(() => onBack(), 900);
    } catch {
      setErr(ar('حدث خطأ أثناء الحفظ.', 'An error occurred while saving.'));
    } finally {
      setSaving(false);
    }
  };

  const catFlat = flattenTree(buildCatTree(categories));

  return (
    <div className="pf-wrap">

      {/* ── Page header ── */}
      <div className="pf-page-header">
        <button className="pf-back-btn" type="button" onClick={onBack}>
          <i className="fas fa-arrow-right"></i>
        </button>
        <div>
          <div className="pf-page-title">
            {isEdit ? ar('تعديل المنتج', 'Edit Product') : ar('إضافة منتج جديد', 'New Product')}
          </div>
          <div className="pf-page-sub">
            {isEdit
              ? ar('تعديل بيانات المنتج والخيارات', 'Edit product data and options')
              : ar('أدخل بيانات المنتج الجديد', 'Enter new product details')}
          </div>
        </div>
        <div className="pf-header-actions">
          <button type="button" className="btn btn-outline btn-sm" onClick={onBack}>
            {ar('إلغاء', 'Cancel')}
          </button>
          <button type="button" className="btn btn-green btn-sm" onClick={handleSave} disabled={saving || uploading}>
            {saving
              ? <><i className="fas fa-spinner fa-spin"></i> {ar('جاري الحفظ...', 'Saving...')}</>
              : <><i className="fas fa-save"></i> {ar('حفظ المنتج', 'Save')}</>}
          </button>
        </div>
      </div>

      {/* ── Alerts ── */}
      {saved     && <AlertSuccess msg={ar('تم الحفظ بنجاح!', 'Saved successfully!')} />}
      {err       && <AlertError   msg={err} />}
      {uploading && (
        <div className="pf-uploading-bar">
          <i className="fas fa-spinner fa-spin"></i> {ar('جاري رفع الصورة...', 'Uploading image...')}
        </div>
      )}

      {/* ── Expand / Collapse all ── */}
      <div className="pf-acc-controls">
        <button type="button" className="pf-acc-ctrl-btn" onClick={expandAll}>
          <i className="fas fa-expand"></i> {ar('فتح الكل', 'Expand All')}
        </button>
        <button type="button" className="pf-acc-ctrl-btn" onClick={collapseAll}>
          <i className="fas fa-compress"></i> {ar('إغلاق الكل', 'Collapse All')}
        </button>
      </div>

      <form onSubmit={handleSave} noValidate style={{ display:'flex', flexDirection:'column', gap:'16px' }}>

        {/* ══ IMAGES ══ */}
        <AccSection id="images" icon="fa-image" title={ar('الصور', 'Images')}
          badge={form.image ? (1 + (form.gallery?.length || 0)) : null}
          open={openSections.has('images')} onToggle={toggleSection} {...secProps('images')}>
          <div className="pf-images-layout">
            <div>
              <div className="pf-field-label">{ar('الصورة الرئيسية', 'Main Image')}</div>
              <label className="pf-img-box pf-img-main">
                {form.image
                  ? <img src={form.image} alt="main" className="pf-img-preview" />
                  : <div className="pf-img-placeholder">
                      <i className="fas fa-cloud-arrow-up"></i>
                      <span>{ar('اختر صورة', 'Choose image')}</span>
                    </div>}
                <input type="file" accept="image/*" onChange={handleMainImage} style={{ display: 'none' }} />
                {form.image && (
                  <button type="button" className="pf-img-remove"
                    onClick={e => { e.preventDefault(); set('image', ''); }}>
                    <i className="fas fa-xmark"></i>
                  </button>
                )}
              </label>
            </div>
            <div>
              <div className="pf-field-label">
                {ar('معرض الصور', 'Gallery')}
                <span className="pf-field-hint"> ({(form.gallery || []).length}/6)</span>
              </div>
              <div className="pf-gallery-grid">
                {(form.gallery || []).map((url, idx) => (
                  <div key={idx} className="pf-gallery-thumb">
                    <img src={url} alt="" />
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
          </div>
        </AccSection>

        {/* ══ CONTENT ══ */}
        <AccSection id="content" icon="fa-pen" title={ar('المحتوى (عربي / إنجليزي)', 'Content (AR / EN)')}
          open={openSections.has('content')} onToggle={toggleSection} {...secProps('content')}>
          <div className="pf-two-col">
            <div>
              <div className="pf-lang-badge pf-lang-ar">🇸🇦 عربي</div>
              <div className="pf-field">
                <label className="pf-label">{ar('اسم المنتج *', 'Product Name *')}</label>
                <input className="form-input" name="name" value={form.name} onChange={onInput}
                  placeholder={ar('مثال: مناديل الوجه الكلاسيكية', 'e.g. Classic Facial Tissues')} required />
              </div>
              <div className="pf-field">
                <label className="pf-label">{ar('الوصف', 'Description')}</label>
                <textarea className="form-textarea" name="desc" value={form.desc} onChange={onInput}
                  placeholder={ar('وصف المنتج بالعربي...', 'Product description...')} rows={4} />
              </div>
            </div>
            <div>
              <div className="pf-lang-badge pf-lang-en">🇬🇧 English</div>
              <div className="pf-field">
                <label className="pf-label">Product Name (English)</label>
                <input className="form-input" name="nameEn" value={form.nameEn} onChange={onInput}
                  dir="ltr" placeholder="e.g. Classic Facial Tissues" />
              </div>
              <div className="pf-field">
                <label className="pf-label">Description (English)</label>
                <textarea className="form-textarea" name="descEn" value={form.descEn} onChange={onInput}
                  dir="ltr" placeholder="Product description in English..." rows={4} />
              </div>
            </div>
          </div>
        </AccSection>

        {/* ══ DETAILS ══ */}
        <AccSection id="details" icon="fa-sliders" title={ar('تفاصيل المنتج', 'Product Details')}
          open={openSections.has('details')} onToggle={toggleSection} {...secProps('details')}>
          <div className="pf-grid-3">
            <div className="pf-field">
              <label className="pf-label">SKU / {ar('رمز المنتج', 'Code')}</label>
              <input className="form-input" name="sku" value={form.sku} onChange={onInput}
                dir="ltr" placeholder="JAW-FAC-001" />
            </div>
            <div className="pf-field">
              <label className="pf-label">{ar('الشارة (اختياري)', 'Badge (optional)')}</label>
              <input className="form-input" name="badge" value={form.badge} onChange={onInput}
                placeholder={ar('مثال: الأكثر مبيعاً', 'e.g. Best Seller')} />
            </div>
            <div className="pf-field">
              <label className="pf-label">{ar('الحالة', 'Status')}</label>
              <select className="form-select" name="status" value={form.status} onChange={onInput}>
                {Object.entries(productStatusLabels).map(([k, v]) => (
                  <option key={k} value={k}>{lang === 'en' ? v.en : v.ar}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="pf-grid-3">
            <div className="pf-field">
              <label className="pf-label">{ar('الفئة', 'Category')}</label>
              <select className="form-select" name="category" value={form.category} onChange={onInput}>
                {catFlat.map(c => (
                  <option key={c.slug} value={c.slug}>
                    {'　'.repeat(c.depth)}{c.depth > 0 ? '└ ' : ''}{c.nameAr}
                  </option>
                ))}
              </select>
            </div>
            <div className="pf-field">
              <label className="pf-label">{ar('السعر (د.ك) *', 'Price (KD) *')}</label>
              <input className="form-input" type="number" step="0.001" min="0" name="price"
                value={form.price} onChange={onInput} dir="ltr" placeholder="0.000" required />
              <span className="pf-field-hint">{ar('يُستخدم إن لم تكن هناك خيارات', 'Used if no options')}</span>
            </div>
            <div className="pf-field">
              <label className="pf-label">{ar('المخزون *', 'Stock *')}</label>
              <input className="form-input" type="number" min="0" name="stock"
                value={form.stock} onChange={onInput} dir="ltr" placeholder="0" required />
              <span className="pf-field-hint">{ar('المجموع إن لم تكن هناك خيارات', 'Total if no options')}</span>
            </div>
          </div>
        </AccSection>

        {/* ══ SHIPPING ══ */}
        <AccSection id="shipping" icon="fa-truck" title={ar('الشحن', 'Shipping')}
          open={openSections.has('shipping')} onToggle={toggleSection} {...secProps('shipping')}>
          <div className="pf-toggle-row">
            <label className="toggle-switch">
              <input type="checkbox" checked={form.isPhysical}
                onChange={e => set('isPhysical', e.target.checked)} />
              <span className="toggle-slider"></span>
            </label>
            <span style={{ fontWeight: 600, fontSize: '14px' }}>
              {ar('منتج مادي (يحتاج شحن)', 'Physical product (requires shipping)')}
            </span>
          </div>
          {form.isPhysical && (
            <>
              <div className="modal-grid2">
                <div className="pf-field">
                  <label className="pf-label">{ar('الوزن (كغ)', 'Weight (kg)')}</label>
                  <input className="form-input" type="number" step="0.01" min="0"
                    value={form.weight} onChange={e => set('weight', e.target.value)}
                    dir="ltr" placeholder="0.50" />
                </div>
                <div className="pf-field">
                  <label className="pf-label">{ar('الأبعاد: طول × عرض × ارتفاع (سم)', 'Dimensions: L × W × H (cm)')}</label>
                  <div className="pf-dims-row">
                    <input className="form-input" type="number" step="0.1" min="0"
                      value={form.dimLength} onChange={e => set('dimLength', e.target.value)} dir="ltr" placeholder="L" />
                    <span className="pf-dims-sep">×</span>
                    <input className="form-input" type="number" step="0.1" min="0"
                      value={form.dimWidth} onChange={e => set('dimWidth', e.target.value)} dir="ltr" placeholder="W" />
                    <span className="pf-dims-sep">×</span>
                    <input className="form-input" type="number" step="0.1" min="0"
                      value={form.dimHeight} onChange={e => set('dimHeight', e.target.value)} dir="ltr" placeholder="H" />
                  </div>
                </div>
              </div>
              <div className="modal-grid2">
                <div className="pf-field">
                  <label className="pf-label">{ar('بلد المنشأ', 'Country of Origin')}</label>
                  <select className="form-select" value={form.countryOfOrigin}
                    onChange={e => set('countryOfOrigin', e.target.value)}>
                    <option value="KW">🇰🇼 {ar('الكويت', 'Kuwait')}</option>
                    <option value="SA">🇸🇦 {ar('السعودية', 'Saudi Arabia')}</option>
                    <option value="AE">🇦🇪 {ar('الإمارات', 'UAE')}</option>
                    <option value="CN">🇨🇳 {ar('الصين', 'China')}</option>
                    <option value="TR">🇹🇷 {ar('تركيا', 'Turkey')}</option>
                    <option value="IN">🇮🇳 {ar('الهند', 'India')}</option>
                    <option value="US">🇺🇸 {ar('أمريكا', 'USA')}</option>
                    <option value="DE">🇩🇪 {ar('ألمانيا', 'Germany')}</option>
                    <option value="EG">🇪🇬 {ar('مصر', 'Egypt')}</option>
                  </select>
                </div>
                <div className="pf-field">
                  <label className="pf-label">HS Code <span className="pf-field-hint">{ar('رمز التعريفة الجمركية', 'Customs Tariff Code')}</span></label>
                  <input className="form-input" dir="ltr" value={form.hsCode}
                    onChange={e => set('hsCode', e.target.value)} placeholder="e.g. 4818.10.00" />
                </div>
              </div>
            </>
          )}
        </AccSection>

        {/* ══ VARIANTS ══ */}
        <AccSection id="variants" icon="fa-layer-group"
          title={ar('الخيارات / الباقات', 'Options / Packages')}
          badge={form.variants.length || null}
          open={openSections.has('variants')} onToggle={toggleSection} {...secProps('variants')}>
          <p className="pf-section-desc">
            {ar(
              'أضف خيارات أو باقات مختلفة للمنتج (مثل علبة، 5 علب، كرتون). كل خيار له سعر ومخزون وصورة مستقلة.',
              'Add options or packages (e.g. Single Box, 5 Boxes, Carton). Each has its own price, stock and image.'
            )}
          </p>

          {form.variants.length === 0 && (
            <div className="pf-variants-empty">
              <i className="fas fa-layer-group"></i>
              <p>{ar('لا توجد خيارات — اضغط الزر أدناه للإضافة', 'No options yet — click below to add')}</p>
            </div>
          )}

          <div className="pf-variants-list">
            {form.variants.map((v, vi) => (
              <div key={vi} className="pf-variant-card">
                <div className="pf-variant-header">
                  <span className="pf-variant-num">#{vi + 1}</span>
                  <span className="pf-variant-name-preview">
                    {v.nameAr || v.nameEn || ar('خيار جديد', 'New Option')}
                  </span>
                  {v.price && <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 700 }}>{Number(v.price).toFixed(3)} د.ك</span>}
                  <div className="pf-variant-controls">
                    <button type="button" className="pf-variant-ctrl-btn"
                      onClick={() => moveVariant(vi, -1)} disabled={vi === 0}>
                      <i className="fas fa-chevron-up"></i>
                    </button>
                    <button type="button" className="pf-variant-ctrl-btn"
                      onClick={() => moveVariant(vi, 1)} disabled={vi === form.variants.length - 1}>
                      <i className="fas fa-chevron-down"></i>
                    </button>
                    <button type="button" className="pf-variant-ctrl-btn pf-variant-del"
                      onClick={() => removeVariant(vi)}>
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
                <div className="pf-variant-body">
                  <div className="pf-variant-img-col">
                    <label className="pf-img-box pf-variant-img-box">
                      {v.image
                        ? <img src={v.image} alt="" className="pf-img-preview" />
                        : <div className="pf-img-placeholder pf-img-sm">
                            <i className="fas fa-image"></i>
                            <span>{ar('صورة', 'Img')}</span>
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
                  <div className="pf-variant-fields">
                    <div className="modal-grid2">
                      <div className="pf-field">
                        <label className="pf-label pf-label-sm">🇸🇦 {ar('الاسم عربي', 'Arabic Name')}</label>
                        <input className="form-input" value={v.nameAr}
                          onChange={e => setVariant(vi, 'nameAr', e.target.value)}
                          placeholder={ar('علبة واحدة', 'Single Box')} />
                      </div>
                      <div className="pf-field">
                        <label className="pf-label pf-label-sm">🇬🇧 English Name</label>
                        <input className="form-input" dir="ltr" value={v.nameEn}
                          onChange={e => setVariant(vi, 'nameEn', e.target.value)}
                          placeholder="Single Box" />
                      </div>
                    </div>
                    <div className="pf-grid-3">
                      <div className="pf-field">
                        <label className="pf-label pf-label-sm">💰 {ar('السعر (د.ك)', 'Price (KD)')}</label>
                        <input className="form-input" type="number" step="0.001" min="0" dir="ltr"
                          value={v.price} onChange={e => setVariant(vi, 'price', e.target.value)}
                          placeholder="1.500" />
                      </div>
                      <div className="pf-field">
                        <label className="pf-label pf-label-sm">📦 {ar('المخزون', 'Stock')}</label>
                        <input className="form-input" type="number" min="0" dir="ltr"
                          value={v.stock} onChange={e => setVariant(vi, 'stock', e.target.value)}
                          placeholder="100" />
                      </div>
                      <div className="pf-field">
                        <label className="pf-label pf-label-sm">🏷️ SKU</label>
                        <input className="form-input" dir="ltr" value={v.sku}
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
            {ar('إضافة خيار جديد', 'Add New Option')}
          </button>
        </AccSection>

        {/* ── Bottom save — order:999 keeps it always last ── */}
        <div className="pf-bottom-bar" style={{ order: 999 }}>
          <button type="button" className="btn btn-outline" onClick={onBack}>
            {ar('إلغاء والرجوع', 'Cancel')}
          </button>
          <button type="submit" className="btn btn-green" disabled={saving || uploading}>
            {saving
              ? <><i className="fas fa-spinner fa-spin"></i> {ar('جاري الحفظ...', 'Saving...')}</>
              : <><i className="fas fa-save"></i> {ar('حفظ المنتج', 'Save Product')}</>}
          </button>
        </div>
      </form>
    </div>
  );
}
