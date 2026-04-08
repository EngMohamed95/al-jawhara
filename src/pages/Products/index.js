import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import Seo from '../../components/Seo';
import Reveal from '../../components/Reveal';
import './index.css';


const normalizeQ = (s = '') =>
  String(s).toLowerCase()
    .replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');

const Products = () => {
  const { products, loading, error, cartTotalQty, siteContent: sc, categories } = useApp();
  const { t, lang } = useLanguage();
  const [activeCat,   setActiveCat]   = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const getDescendantSlugs = (slug) => {
    const cat = (categories || []).find(c => c.slug === slug);
    if (!cat) return [];
    const children = (categories || []).filter(c => c.parentId === cat.id);
    return [...children.map(c => c.slug), ...children.flatMap(c => getDescendantSlugs(c.slug))];
  };

  const catTree = (categories || []).filter(c => (c.parentId ?? null) === null).sort((a, b) => a.sortOrder - b.sortOrder);
  const getCatChildren = (parentId) => (categories || []).filter(c => c.parentId === parentId).sort((a, b) => a.sortOrder - b.sortOrder);

  const sq = normalizeQ(searchQuery);
  const filtered = products
    .filter(p => {
      if (activeCat === 'all') return true;
      const slugs = [activeCat, ...getDescendantSlugs(activeCat)];
      return slugs.includes(p.category);
    })
    .filter(p => !sq || [p.name, p.nameEn, p.desc, p.descEn, ...(p.specs || [])].some(
      f => normalizeQ(f).includes(sq)
    ));


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
                <button className={`filter-btn${activeCat === 'all' ? ' active' : ''}`} onClick={() => setActiveCat('all')} aria-pressed={activeCat === 'all'}>
                  <i className="fas fa-border-all" aria-hidden="true" style={{ marginInlineEnd: '6px' }}></i>
                  {t('products.all')}
                </button>
                {catTree.map(parent => {
                  const children = getCatChildren(parent.id);
                  return (
                    <div key={parent.id} className="filter-group">
                      <button
                        className={`filter-btn${activeCat === parent.slug ? ' active' : ''}`}
                        onClick={() => setActiveCat(parent.slug)}
                        aria-pressed={activeCat === parent.slug}
                      >
                        <span style={{ marginInlineEnd: '5px' }}>{parent.emoji}</span>
                        {lang === 'en' && parent.nameEn ? parent.nameEn : parent.nameAr}
                      </button>
                      {children.map(child => (
                        <button
                          key={child.id}
                          className={`filter-btn filter-btn-sub${activeCat === child.slug ? ' active' : ''}`}
                          onClick={() => setActiveCat(child.slug)}
                          aria-pressed={activeCat === child.slug}
                        >
                          <span style={{ marginInlineEnd: '4px', opacity: 0.6 }}>└</span>
                          {lang === 'en' && child.nameEn ? child.nameEn : child.nameAr}
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>

              <div className="products-grid" role="list">
                {filtered.length === 0 ? (
                  <div className="no-products">
                    <i className="fas fa-box-open" aria-hidden="true"></i>
                    <p>{t('products.empty')}</p>
                  </div>
                ) : filtered.map((p, i) => (
                  <Reveal key={p.id} delay={(i % 4) * 70} direction="up">
                  <Link to={`/products/${p.id}`} className="product-card" role="listitem" style={{ textDecoration: 'none' }}>
                    <div className="product-card-img">
                      {p.badge && <span className="product-badge">{p.badge}</span>}
                      {p.image
                        ? <img src={p.image} alt={lang === 'en' && p.nameEn ? p.nameEn : p.name} className="product-card-photo" />
                        : p.icon || '📦'}
                    </div>
                    <div className="product-card-body">
                      <span className="product-name">{lang === 'en' && p.nameEn ? p.nameEn : p.name}</span>
                      <p className="product-description">{lang === 'en' && p.descEn ? p.descEn : p.desc}</p>
                      <span className="product-view-btn">
                        <i className="fas fa-eye" aria-hidden="true"></i>
                        {lang === 'ar' ? 'عرض المنتج' : 'View Product'}
                      </span>
                    </div>
                  </Link>
                  </Reveal>
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
