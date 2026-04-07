import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import Seo from '../../components/Seo';
import './index.css';

const CAT_ICONS = {
  all:     'fa-border-all',
  facial:  'fa-face-smile',
  rolls:   'fa-scroll',
  pocket:  'fa-briefcase',
  towels:  'fa-hand-sparkles',
  napkins: 'fa-utensils',
  family:  'fa-box-open',
};

const normalizeQ = (s = '') =>
  String(s).toLowerCase()
    .replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');

const Products = () => {
  const { products, loading, error, addToCart, cartTotalQty, siteContent: sc } = useApp();
  const { t, lang } = useLanguage();
  const [activeCat,    setActiveCat]    = useState('all');
  const [addedId,      setAddedId]      = useState(null);
  const [searchQuery,  setSearchQuery]  = useState('');

  const categories = [
    { id: 'all',     label: t('products.all') },
    { id: 'facial',  label: t('products.cats.facial') },
    { id: 'rolls',   label: t('products.cats.rolls') },
    { id: 'pocket',  label: t('products.cats.pocket') },
    { id: 'towels',  label: t('products.cats.towels') },
    { id: 'napkins', label: t('products.cats.napkins') },
    { id: 'family',  label: t('products.cats.family') },
  ];

  const sq = normalizeQ(searchQuery);
  const filtered = products
    .filter(p => activeCat === 'all' || p.category === activeCat)
    .filter(p => !sq || [p.name, p.nameEn, p.desc, p.descEn, ...(p.specs || [])].some(
      f => normalizeQ(f).includes(sq)
    ));

  const handleAdd = (product) => {
    addToCart(product);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1200);
  };

  return (
    <>
      <Seo
        title={t('products.title')}
        description={lang === 'ar'
          ? 'تشكيلة متكاملة من المناديل الورقية — مناديل وجه، رولات مطبخ، محارم جيب، مناشف ورق، مناديل مائدة.'
          : 'A complete range of tissue paper products — facial tissues, kitchen rolls, pocket tissues, paper towels, napkins.'}
        keywords="منتجات الجوهرة، مناديل وجه، رولات مطبخ، محارم جيب، مناشف ورق"
      />

      <header className="page-header" style={sc?.productsHeaderImg ? { backgroundImage: `url(${sc.productsHeaderImg})`, backgroundSize:'cover', backgroundPosition:'center' } : {}}>
        <div className="container">
          <div className="page-header-content">
            <div className="page-header-icon" aria-hidden="true"><i className="fas fa-box-open"></i></div>
            <h1>{t('products.title')}</h1>
            <p>{t('products.sub')}</p>
          </div>
        </div>
      </header>

      <section className="section">
        <div className="container">

          {loading && (
            <div className="products-loading" role="status">
              <i className="fas fa-spinner fa-spin" aria-hidden="true"></i>
              <span>{t('products.loading')}</span>
            </div>
          )}

          {error && !loading && (
            <div className="products-error" role="alert">
              <i className="fas fa-circle-exclamation" aria-hidden="true"></i>
              <p>{t('products.error')}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Search box */}
              <div className="products-search-wrap">
                <div className="products-search-box">
                  <i className="fas fa-magnifying-glass products-search-icon" aria-hidden="true"></i>
                  <input
                    type="search"
                    className="products-search-input"
                    placeholder={lang === 'ar' ? 'ابحث عن منتج...' : 'Search products...'}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    autoComplete="off"
                    aria-label="بحث المنتجات"
                  />
                  {searchQuery && (
                    <button className="products-search-clear" onClick={() => setSearchQuery('')} aria-label="مسح">
                      <i className="fas fa-xmark"></i>
                    </button>
                  )}
                </div>
                {searchQuery && (
                  <span className="products-search-count">
                    {filtered.length} {lang === 'ar' ? 'نتيجة' : 'result(s)'}
                  </span>
                )}
              </div>

              <div className="filters" role="group" aria-label={t('products.title')}>
                {categories.map(c => (
                  <button
                    key={c.id}
                    className={`filter-btn${activeCat === c.id ? ' active' : ''}`}
                    onClick={() => setActiveCat(c.id)}
                    aria-pressed={activeCat === c.id}
                  >
                    <i className={`fas ${CAT_ICONS[c.id]}`} aria-hidden="true" style={{ marginInlineEnd: '6px' }}></i>
                    {c.label}
                  </button>
                ))}
              </div>

              <div className="products-grid" role="list">
                {filtered.length === 0 ? (
                  <div className="no-products">
                    <i className="fas fa-box-open" aria-hidden="true"></i>
                    <p>{t('products.empty')}</p>
                  </div>
                ) : filtered.map(p => (
                  <article key={p.id} className="product-card" role="listitem">
                    <div className="product-card-img" aria-hidden="true">
                      {p.badge && <span className="product-badge">{p.badge}</span>}
                      {p.image
                        ? <img src={p.image} alt={lang === 'en' && p.nameEn ? p.nameEn : p.name} className="product-card-photo" />
                        : p.icon || '📦'}
                    </div>
                    <div className="product-card-body">
                      <h2 className="product-name">{lang === 'en' && p.nameEn ? p.nameEn : p.name}</h2>
                      <p className="product-description">{lang === 'en' && p.descEn ? p.descEn : p.desc}</p>
                      <div className="product-specs">
                        {p.specs?.map((s, i) => <span key={i} className="product-spec">{s}</span>)}
                      </div>
                      <div className="product-footer">
                        <div className="product-price">
                          {Number(p.price).toFixed(3)} <span>{t('products.currency')}</span>
                        </div>
                        <button
                          className={`btn btn-sm ${addedId === p.id ? 'btn-green' : 'btn-primary'}`}
                          onClick={() => handleAdd(p)}
                          aria-label={`${t('products.add')} ${p.name}`}
                        >
                          {addedId === p.id
                            ? <><i className="fas fa-check" aria-hidden="true"></i> {t('products.added')}</>
                            : <><i className="fas fa-cart-plus" aria-hidden="true"></i> {t('products.add')}</>
                          }
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Cart float button */}
      {cartTotalQty > 0 && (
        <Link to="/cart" className="cart-float-btn" aria-label={`${t('nav.cart')} — ${cartTotalQty}`}>
          <i className="fas fa-shopping-cart" aria-hidden="true"></i>
          {t('nav.cart')}
          <span className="cart-count" aria-hidden="true">{cartTotalQty}</span>
        </Link>
      )}
    </>
  );
};

export default Products;
