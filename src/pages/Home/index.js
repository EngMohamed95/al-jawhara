import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import translations from '../../translations';
import Seo from '../../components/Seo';
import Reveal from '../../components/Reveal';
import ProductImageSlider from '../../components/ProductImageSlider';
import './index.css';

const DEFAULT_HERO_VIDEO = '/videos/herosection.mp4';

const Home = () => {
  const { groupedProducts, clients, loading, siteContent: sc } = useApp();
  const { t, lang } = useLanguage();
  const featured = groupedProducts
    .filter(p => p.status === 'active')
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    .slice(0, 8);
  const featuredClients = clients
    .filter(c => c.logo && c.status !== 'inactive')
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  /* Hero content — DB value in the matching language, translation as fallback */
  const heroBadge   = lang === 'ar' ? (sc?.heroBadge    || t('home.heroBadge'))    : (sc?.heroBadgeEn    || t('home.heroBadge'));
  const heroTitle   = lang === 'ar' ? (sc?.heroTitle    || t('home.heroTitle'))    : (sc?.heroTitleEn    || t('home.heroTitle'));
  const heroSub     = lang === 'ar' ? (sc?.heroSubtitle || t('home.heroSubtitle')) : (sc?.heroSubtitleEn || t('home.heroSubtitle'));
  const heroBtnProducts = lang === 'ar' ? (sc?.heroBtnProducts || t('home.browseProducts')) : (sc?.heroBtnProductsEn || t('home.browseProducts'));
  const heroBtnContact  = lang === 'ar' ? (sc?.heroBtnContact  || t('home.contactUs'))      : (sc?.heroBtnContactEn  || t('home.contactUs'));
  const heroVideo     = sc?.heroVideoUrl  || DEFAULT_HERO_VIDEO;

  const ceoName      = sc?.ceoName  || 'Bilal Mohammad Ghadar';
  /* Job title — DB value in the matching language, translation as fallback */
  const ceoTitle     = lang === 'ar' ? (sc?.ceoTitle || 'رئيس مجلس الإدارة') : (sc?.ceoTitleEn || 'CEO');
  const ceoQuote     = lang === 'ar' ? (sc?.ceoQuote || '') : (sc?.ceoQuoteEn || '');
  const whyTitle     = lang === 'ar' ? (sc?.whyTitle || t('home.whyTitle')) : (sc?.whyTitleEn || t('home.whyTitle'));
  const whySub       = lang === 'ar' ? (sc?.whySub   || t('home.whySub'))   : (sc?.whySubEn   || t('home.whySub'));
  const statsYear    = sc?.statsYear            || '1998';
  const statsArea    = sc?.factoryArea          || '4,500';
  const statsProd    = sc?.productionCapacity   || '20,000';
  const statsClients = sc?.statsClients         || '+100';

  const stats = [
    { icon: 'fa-calendar-check', number: statsYear,    label: t('home.statsYear') },
    { icon: 'fa-industry',       number: statsArea,    label: t('home.statsFactory') },
    { icon: 'fa-weight-hanging', number: statsProd,    label: t('home.statsProd') },
    { icon: 'fa-handshake',      number: statsClients, label: t('home.statsClients') },
  ];

  const whyFeatures = translations.why;

  /* Highlight brand name in hero title */
  const highlightTitle = heroTitle
    .replace('الجوهرة',  '<span class="hero-title-accent">الجوهرة</span>')
    .replace('Al-Jawhra', '<span class="hero-title-accent">Al-Jawhra</span>');

  return (
    <>
      <Seo
        title={lang === 'ar' ? 'الصفحة الرئيسية' : 'Home'}
        description={lang === 'ar'
          ? 'شركة الجوهرة لإنتاج محارم الورق ومشتقاته — رائدة في تصنيع المناديل وأوراق التواليت والمناشف في الكويت منذ 1998.'
          : "Al-Jawhra Tissue Paper & Derivatives Co. — Kuwait's leading tissue paper manufacturer since 1998."}
        keywords="الجوهرة للمناديل، مناديل الكويت، tissue paper Kuwait"
      />

      {/* ── Hero: full-width video showcase + content below ── */}
      <section className="hero hero-video-section" aria-label="القسم التعريفي">
        <Reveal direction="up">
          <div className="hero-video-frame">
            <video
              className="hero-video-bg"
              src={heroVideo}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              aria-hidden="true"
              onError={e => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
        </Reveal>

        <div className="container">
          <div className="hero-content" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <p className="hero-badge">
              <i className="fas fa-star" aria-hidden="true"></i>
              {heroBadge}
            </p>
            <h1
              className="hero-title"
              dangerouslySetInnerHTML={{ __html: highlightTitle }}
            />
            <p className="hero-subtitle">{heroSub}</p>
            <div className="hero-actions">
              <Link to="/products" className="btn btn-primary">
                <i className="fas fa-box-open" aria-hidden="true"></i>
                {heroBtnProducts}
              </Link>
              <Link to="/contact" className="btn btn-outline">
                <i className="fas fa-envelope" aria-hidden="true"></i>
                {heroBtnContact}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="stats-section" aria-label="إحصائيات الشركة">
        <div className="container">
          <div className="stats-grid">
            {stats.map((s, i) => (
              <Reveal key={i} delay={i * 80} direction="up">
                <div className="stat-card">
                  <div className="stat-icon" aria-hidden="true"><i className={`fas ${s.icon}`}></i></div>
                  <div className="stat-number">{s.number}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="section home-featured-section" aria-label="المنتجات المميزة">
        <div className="container">
          <Reveal direction="up">
            <div className="section-header">
              <h2 className="section-title">{t('home.featuredTitle')}</h2>
              <p className="section-subtitle">{t('home.featuredSub')}</p>
            </div>
          </Reveal>
          {loading ? (
            <div className="home-loading" role="status" aria-live="polite">
              <i className="fas fa-spinner fa-spin" aria-hidden="true"></i>
              <span>{t('home.loading')}</span>
            </div>
          ) : (
            <div className="home-products-grid">
              {featured.map((p, i) => {
                const productImages = [];
                if (p.image) productImages.push(p.image);
                if (p.gallery && Array.isArray(p.gallery)) {
                  p.gallery.forEach(img => {
                    if (img && !productImages.includes(img)) productImages.push(img);
                  });
                }
                return (
                  <Reveal key={p.id} delay={(i % 4) * 80} direction="up">
                    <Link to={`/products/${p.id}`} className="home-product-card" style={{ textDecoration: 'none' }}>
                      {p.badge && <span className="home-prod-badge">{p.badge}</span>}
                      <div className="home-prod-img-wrap">
                        <ProductImageSlider images={productImages} alt={lang === 'en' && p.nameEn ? p.nameEn : p.name} />
                      </div>
                      <div className="home-prod-body">
                        <span className="home-prod-name">{lang === 'en' && p.nameEn ? p.nameEn : p.name}</span>
                        <p className="home-prod-desc">{lang === 'en' && p.descEn ? p.descEn : p.desc}</p>
                        <span className="home-prod-view-btn">
                          <i className="fas fa-eye"></i>
                          {lang === 'ar' ? 'عرض المنتج' : 'View Product'}
                        </span>
                      </div>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          )}
          <Reveal direction="up" delay={200}>
            <div className="section-center" style={{ marginTop: '35px' }}>
              <Link to="/products" className="btn btn-green">
                <i className="fas fa-arrow-left" aria-hidden="true"></i>
                {t('home.viewAll')}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Why Us ── */}
      <section className="section home-why-section" style={{ position: 'relative', overflow: 'hidden' }} aria-label="لماذا الجوهرة">
        <video
          className="why-video-bg"
          autoPlay muted loop playsInline preload="auto"
        >
          <source src="/videos/AlJawharaUV.mp4" type="video/mp4" />
        </video>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(4,61,107,0.85) 0%, rgba(6,80,137,0.75) 100%)',
          zIndex: 1
        }}></div>

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <Reveal direction="up">
            <div className="section-header" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              <h2 className="section-title">{whyTitle}</h2>
              <p className="section-subtitle">{whySub}</p>
            </div>
          </Reveal>
          <div className="home-why-grid">
            {whyFeatures.map((f, i) => (
              <Reveal key={i} delay={i * 100} direction="up">
                <div className="home-why-card">
                  <div className="home-why-icon" aria-hidden="true"><i className={`fas ${f.icon}`}></i></div>
                  <h3 className="home-why-title">{f.title[lang] || f.title.ar}</h3>
                  <p className="home-why-desc">{f.desc[lang] || f.desc.ar}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Clients ── */}
      <section className="section home-clients-section" aria-label="عملاؤنا">
        <div className="container">
          <Reveal direction="up">
            <div className="section-header">
              <h2 className="section-title">{t('home.clientsTitle')}</h2>
              <p className="section-subtitle">{t('home.clientsSub')}</p>
            </div>
          </Reveal>
          <div className="clients-slider-wrap">
            <div className="clients-slider-track">
              {/* نسختين كافيين للـ loop اللانهائي */}
              {[...featuredClients, ...featuredClients].map((c, i) => (
                <div key={i} className="clients-slider-item">
                  <img src={c.logo} alt={c.name} className="clients-slider-logo" loading="lazy" />
                </div>
              ))}
            </div>
          </div>
          <Reveal direction="up" delay={200}>
            <div className="section-center">
              <Link to="/clients" className="btn btn-green">
                <i className="fas fa-users" aria-hidden="true"></i>
                {t('home.viewClients')}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CEO Quote ── */}
      {ceoQuote && (
        <Reveal direction="up">
          <section className="quote-section" aria-label="كلمة المدير العام">
            <div className="container">
              <div className="quote-icon" aria-hidden="true"><i className="fas fa-quote-right"></i></div>
              <blockquote className="quote-text" dir={lang === 'ar' ? 'rtl' : 'ltr'}>"{ceoQuote}"</blockquote>
              <div className="quote-ceo-wrap">
                <img src="/ceo.jpg" alt={ceoName} className="quote-ceo-img" />
                <div className="quote-ceo-info">
                  <p className="quote-author">{ceoName}</p>
                  <p className="quote-author-title">{ceoTitle}</p>
                </div>
              </div>
            </div>
          </section>
        </Reveal>
      )}
    </>
  );
};

export default Home;
