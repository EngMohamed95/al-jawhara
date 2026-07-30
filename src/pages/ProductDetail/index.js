import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import Seo from '../../components/Seo';
import Reveal from '../../components/Reveal';
import './index.css';

const ProductDetail = () => {
  const { id } = useParams();
  const { groupedProducts, loading, addToCart, cart, updateCartQty } = useApp();
  const { lang } = useLanguage();

  // Find the product by its own ID, or by the ID of one of its variants
  const p = (groupedProducts || []).find(pr =>
    String(pr.id) === String(id) ||
    (pr.variants || []).some(v => String(v.id) === String(id))
  ) || null;

  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setActiveImg(0);
    setQty(1);
  }, [id, p]);

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
        <div style={{ fontSize: '4rem', color: 'var(--text-light)', marginBottom: '16px' }}><i className="fas fa-circle-question"></i></div>
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

  const hasVariants = false;
  const selVar = null;
  const price = p ? p.price : 0;
  const stock = p ? p.stock : 0;

  const cartKey = p ? String(p.id) : '';
  const productToAdd = p ? { ...p, _cartKey: cartKey } : null;

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

  /* Show variant image first if selected variant has one */
  const variantImg = hasVariants && selVar?.image ? selVar.image : null;
  const allImages = [];
  if (variantImg) allImages.push(variantImg);
  if (p.image && p.image !== variantImg) allImages.push(p.image);
  if (p.gallery && p.gallery.length) {
    p.gallery.forEach(img => { if (img && img !== p.image && img !== variantImg) allImages.push(img); });
  }

  const related = groupedProducts
    ? groupedProducts.filter(pr => pr.id !== p.id && pr.category === p.category && pr.status === 'active').slice(0, 4)
    : [];

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
                : <div className="pd-emoji-large"><i className={`fas ${p.icon || 'fa-box'}`} style={{fontSize: '4rem', opacity: 0.3}}></i></div>
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

            {/* Price */}
            <div className="pd-price">
              {Number(price).toFixed(3)}
              <span> {lang === 'ar' ? 'د.ك' : 'KWD'}</span>
            </div>

            {/* SKU */}
            {p && p.sku && (
              <p className="pd-sku">SKU: {p.sku}</p>
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
                          : <span className="pd-related-emoji"><i className={`fas ${rp.icon || 'fa-box'}`} style={{opacity:0.3}}></i></span>
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
