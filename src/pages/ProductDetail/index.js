import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import Seo from '../../components/Seo';
import Reveal from '../../components/Reveal';
import './index.css';

const ProductDetail = () => {
  const { id } = useParams();
  const { products, loading, addToCart, cart, updateCartQty } = useApp();
  const { t, lang } = useLanguage();

  const [selVarIdx, setSelVarIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded] = useState(false);

  const p = products.find(pr => String(pr.id) === String(id));

  if (loading) {
    return (
      <div className="pd-loading" role="status">
        <i className="fas fa-spinner fa-spin"></i>
        <span>{lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}</span>
      </div>
    );
  }

  if (!p) {
    return (
      <div className="pd-not-found">
        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>😕</div>
        <h2>{lang === 'ar' ? 'المنتج غير موجود' : 'Product Not Found'}</h2>
        <p style={{ color: 'var(--text-light)', marginBottom: '24px' }}>
          {lang === 'ar' ? 'لم نتمكن من العثور على هذا المنتج.' : 'We could not find this product.'}
        </p>
        <Link to="/products" className="btn btn-primary">
          <i className="fas fa-arrow-right"></i>
          {lang === 'ar' ? 'العودة للمنتجات' : 'Back to Products'}
        </Link>
      </div>
    );
  }

  const variants = p.variants || [];
  const hasVariants = variants.length > 0;
  const selVar = hasVariants ? variants[selVarIdx] : null;
  const price = selVar ? selVar.price : p.price;
  const stock = selVar ? (selVar.stock ?? p.stock) : p.stock;

  const cartKey = hasVariants ? `${p.id}_v${selVarIdx}` : String(p.id);
  const productToAdd = hasVariants
    ? {
        ...p,
        _cartKey: cartKey,
        price: selVar.price,
        name: `${p.name} — ${selVar.nameAr}`,
        nameEn: p.nameEn ? `${p.nameEn} — ${selVar.nameEn}` : undefined,
      }
    : { ...p, _cartKey: cartKey };

  const handleAdd = () => {
    const existing = cart.find(i => (i._cartKey || i.id) === cartKey);
    if (existing) {
      updateCartQty(cartKey, existing.qty + qty);
    } else {
      addToCart(productToAdd, qty);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const name = lang === 'en' && p.nameEn ? p.nameEn : p.name;
  const desc = lang === 'en' && p.descEn ? p.descEn : p.desc;

  const allImages = [];
  if (p.image) allImages.push(p.image);
  if (p.gallery && p.gallery.length) {
    p.gallery.forEach(img => { if (img && img !== p.image) allImages.push(img); });
  }

  const related = products
    .filter(pr => pr.id !== p.id && pr.category === p.category && pr.status === 'active')
    .slice(0, 4);

  const stockClass = stock > 10 ? 'pd-stock-ok' : stock > 0 ? 'pd-stock-low' : 'pd-stock-out';
  const stockLabel = stock > 10
    ? (lang === 'ar' ? 'متوفر في المخزن' : 'In Stock')
    : stock > 0
    ? (lang === 'ar' ? `كميات محدودة — ${stock} متبقي` : `Low Stock — ${stock} left`)
    : (lang === 'ar' ? 'غير متوفر' : 'Out of Stock');

  return (
    <>
      <Seo
        title={name}
        description={desc}
        keywords={`${p.name}, ${p.nameEn || ''}, الجوهرة`}
      />

      <div className="container">
        {/* Breadcrumb */}
        <nav className="pd-breadcrumb" aria-label="breadcrumb">
          <Link to="/">{lang === 'ar' ? 'الرئيسية' : 'Home'}</Link>
          <span className="pd-bc-sep">›</span>
          <Link to="/products">{lang === 'ar' ? 'المنتجات' : 'Products'}</Link>
          <span className="pd-bc-sep">›</span>
          <span>{name}</span>
        </nav>

        {/* Main section */}
        <div className="pd-main">
          {/* Left: Image gallery */}
          <div className="pd-gallery">
            <div className="pd-img-main">
              {allImages.length > 0
                ? <img src={allImages[activeImg]} alt={name} />
                : <div className="pd-emoji-large">{p.icon || '📦'}</div>
              }
            </div>
            {allImages.length > 1 && (
              <div className="pd-thumbnails">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    className={`pd-thumb${activeImg === idx ? ' active' : ''}`}
                    onClick={() => setActiveImg(idx)}
                    aria-label={`${lang === 'ar' ? 'صورة' : 'Image'} ${idx + 1}`}
                  >
                    <img src={img} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product info */}
          <div className="pd-info">
            {p.badge && <span className="pd-badge">{p.badge}</span>}
            <h1 className="pd-name">{name}</h1>
            {desc && <p className="pd-short-desc">{desc}</p>}

            {p.specs && p.specs.length > 0 && (
              <div className="pd-specs">
                {p.specs.map((s, i) => (
                  <span key={i} className="pd-spec">{s}</span>
                ))}
              </div>
            )}

            <hr className="pd-divider" />

            {/* Variants */}
            {hasVariants && (
              <div className="pd-variants">
                <p className="pd-variants-label">
                  {lang === 'ar' ? 'الحجم / النوع' : 'Size / Type'}
                </p>
                <div className="variant-picker">
                  {variants.map((v, vi) => (
                    <button
                      key={vi}
                      type="button"
                      className={`variant-pill${selVarIdx === vi ? ' active' : ''}`}
                      onClick={() => { setSelVarIdx(vi); setActiveImg(0); }}
                    >
                      {lang === 'en' && v.nameEn ? v.nameEn : v.nameAr}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price */}
            <div className="pd-price">
              {Number(price).toFixed(3)}
              <span> {lang === 'ar' ? 'د.ك' : 'KWD'}</span>
            </div>

            {/* SKU */}
            {hasVariants && selVar?.sku && (
              <p className="pd-sku">SKU: {selVar.sku}</p>
            )}

            {/* Stock indicator */}
            <p className={stockClass}>{stockLabel}</p>

            {/* Qty stepper + Add to cart */}
            <div className="pd-qty-row">
              <div className="pd-qty">
                <button
                  className="pd-qty-btn"
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  aria-label={lang === 'ar' ? 'تقليل' : 'Decrease'}
                  disabled={qty <= 1}
                >
                  <i className="fas fa-minus"></i>
                </button>
                <span className="pd-qty-val">{qty}</span>
                <button
                  className="pd-qty-btn plus"
                  onClick={() => setQty(q => q + 1)}
                  aria-label={lang === 'ar' ? 'زيادة' : 'Increase'}
                >
                  <i className="fas fa-plus"></i>
                </button>
              </div>

              <button
                className={`pd-add-btn${added ? ' added' : ''}`}
                onClick={handleAdd}
                disabled={stock === 0}
              >
                <i className={`fas ${added ? 'fa-check' : 'fa-shopping-cart'}`}></i>
                {added
                  ? (lang === 'ar' ? 'تمت الإضافة!' : 'Added!')
                  : (lang === 'ar' ? 'أضف للسلة' : 'Add to Cart')}
              </button>
            </div>
          </div>
        </div>

        {/* Description section */}
        {desc && (
          <Reveal direction="up">
            <div className="pd-desc-section">
              <h2 className="pd-desc-title">
                {lang === 'ar' ? 'وصف المنتج' : 'Product Description'}
              </h2>
              <p className="pd-desc-text">{desc}</p>
            </div>
          </Reveal>
        )}

        {/* Related products */}
        {related.length > 0 && (
          <Reveal direction="up">
            <div className="pd-related">
              <h2 className="section-title" style={{ marginBottom: '20px' }}>
                {lang === 'ar' ? 'منتجات مشابهة' : 'Related Products'}
              </h2>
              <div className="pd-related-grid">
                {related.map(rp => {
                  const rpName = lang === 'en' && rp.nameEn ? rp.nameEn : rp.name;
                  const rpPrice = (rp.variants && rp.variants.length > 0)
                    ? rp.variants[0].price
                    : rp.price;
                  return (
                    <Link key={rp.id} to={`/products/${rp.id}`} className="pd-related-card">
                      <div className="pd-related-img">
                        {rp.image
                          ? <img src={rp.image} alt={rpName} />
                          : <span className="pd-related-emoji">{rp.icon || '📦'}</span>
                        }
                      </div>
                      <div className="pd-related-body">
                        <p className="pd-related-name">{rpName}</p>
                        <p className="pd-related-price">
                          {Number(rpPrice).toFixed(3)} <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{lang === 'ar' ? 'د.ك' : 'KWD'}</span>
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </Reveal>
        )}
      </div>
    </>
  );
};

export default ProductDetail;
