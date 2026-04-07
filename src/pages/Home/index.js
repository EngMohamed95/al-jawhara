import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import translations from '../../translations';
import Seo from '../../components/Seo';
import Reveal from '../../components/Reveal';
import './index.css';

const DEFAULT_HERO_VIDEO  = 'https://al-jawhara.co/wp-content/uploads/2022/10/JawharaNewIntro.mp4';
const DEFAULT_HERO_POSTER = 'https://al-jawhara.co/wp-content/uploads/revslider/video-media/JawharaNewIntro_59_layer.jpeg';

const featuredClients = [
  { name: 'Carrefour',     color: '#003087' },
  { name: 'Starbucks',     color: '#00704A' },
  { name: 'Talabat',       color: '#FF5A00' },
  { name: "Chili's",       color: '#C41230' },
  { name: 'Sultan Center', color: '#1A237E' },
  { name: 'LuLu',          color: '#E53935' },
];

const Home = () => {
  const { products, loading, siteContent: sc, addToCart, cart, updateCartQty } = useApp();
  const { t, lang } = useLanguage();
  const [addedId, setAddedId] = useState(null);
  const [localQtys, setLocalQtys] = useState({});
  const featured = products.filter(p => p.status === 'active').slice(0, 8);
  const getCartItem = (id) => cart.find(i => i.id === id);
  const getLocalQty = (id) => localQtys[id] ?? 1;
  const changeLocalQty = (id, delta) => setLocalQtys(prev => ({
    ...prev, [id]: Math.max(1, (prev[id] ?? 1) + delta)
  }));
  const handleAdd = (p) => {
    const qty = getLocalQty(p.id);
    const cartItem = getCartItem(p.id);
    if (cartItem) { updateCartQty(p.id, qty); }
    else { addToCart(p); if (qty > 1) updateCartQty(p.id, qty); }
    setAddedId(p.id);
    setTimeout(() => setAddedId(null), 1200);
  };

  /* Hero content — use DB value only in Arabic, always use translation in English */
  const heroBadge   = lang === 'ar' ? (sc?.heroBadge    || t('home.heroBadge'))    : t('home.heroBadge');
  const heroTitle   = lang === 'ar' ? (sc?.heroTitle    || t('home.heroTitle'))    : t('home.heroTitle');
  const heroSub     = lang === 'ar' ? (sc?.heroSubtitle || t('home.heroSubtitle')) : t('home.heroSubtitle');
  const heroVideoUrl  = sc?.heroVideoUrl  || DEFAULT_HERO_VIDEO;
  const heroPosterImg = sc?.heroPosterImg || DEFAULT_HERO_POSTER;
  const heroImage     = sc?.heroImage     || '';

  const ceoName      = sc?.ceoName  || 'Bilal Mohammad Ghadar';
  const ceoTitle     = sc?.ceoTitle || (lang === 'ar' ? 'المدير العام' : 'General Manager');
  const ceoQuote     = sc?.ceoQuote || '';
  const statsYear    = sc?.statsYear            || '1998';
  const statsArea    = sc?.factoryArea          || '4,500';
  const statsProd    = sc?.productionCapacity   || '20,000';
  const statsClients = sc?.statsClients         || '+25';

  const stats = [
    { icon: 'fa-calendar-check', number: statsYear,    label: t('home.statsYear') },
    { icon: 'fa-industry',       number: statsArea,    label: t('home.statsFactory') },
    { icon: 'fa-weight-hanging', number: statsProd,    label: t('home.statsProd') },
    { icon: 'fa-handshake',      number: statsClients, label: t('home.statsClients') },
  ];

  const whyFeatures = translations.why;

  /* Highlight brand name in hero title */
  const highlightTitle = heroTitle
    .replace('الجوهرة',    '<span class="hero-title-accent">الجوهرة</span>')
    .replace('Al-Jawhara', '<span class="hero-title-accent">Al-Jawhara</span>');

  return (
    <>
      <Seo
        title={lang === 'ar' ? 'الصفحة الرئيسية' : 'Home'}
        description={lang === 'ar'
          ? 'شركة الجوهرة للمناديل الورقية — رائدة في تصنيع المناديل وأوراق التواليت والمناشف في الكويت منذ 1998.'
          : "Al-Jawhara Tissue Paper Co. — Kuwait's leading tissue paper manufacturer since 1998."}
        keywords="الجوهرة للمناديل، مناديل الكويت، tissue paper Kuwait"
      />

      {/* ── Hero with video background ── */}
      <section className="hero hero-video-section" aria-label="القسم التعريفي">

        {/* Background: video or fallback image */}
        {heroImage && !heroVideoUrl ? (
          <div className="hero-video-bg" style={{ backgroundImage: `url(${heroImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }} aria-hidden="true" />
        ) : (
          <video
            className="hero-video-bg"
            autoPlay muted loop playsInline preload="auto"
            poster={heroPosterImg}
            aria-hidden="true"
          >
            <source src={heroVideoUrl} type="video/mp4" />
            {heroImage && <img src={heroImage} alt="" />}
          </video>
        )}

        {/* Dark overlay so text is readable */}
        <div className="hero-video-overlay" aria-hidden="true"></div>

        <div className="container hero-video-content">
          <div className="hero-content">
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
                {t('home.browseProducts')}
              </Link>
              <Link to="/contact" className="btn btn-outline">
                <i className="fas fa-envelope" aria-hidden="true"></i>
                {t('home.contactUs')}
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
                const cartItem = getCartItem(p.id);
                return (
                  <Reveal key={p.id} delay={(i % 4) * 80} direction="up">
                    <article className="home-product-card">
                      {p.badge && <span className="home-prod-badge">{p.badge}</span>}
                      <div className="home-prod-img-wrap">
                        {p.image
                          ? <img src={p.image} alt={lang === 'en' && p.nameEn ? p.nameEn : p.name} className="home-prod-img" loading="lazy" />
                          : <span className="home-prod-emoji">{p.icon || '📦'}</span>}
                      </div>
                      <div className="home-prod-body">
                        <h3 className="home-prod-name">{lang === 'en' && p.nameEn ? p.nameEn : p.name}</h3>
                        <p className="home-prod-desc">{lang === 'en' && p.descEn ? p.descEn : p.desc}</p>
                        <div className="home-prod-footer">
                          <div className="home-prod-price">
                            {Number(p.price).toFixed(3)} <span>{t('products.currency')}</span>
                          </div>
                          <div className="home-prod-qty">
                            <button className="hqty-btn hqty-plus" onClick={() => changeLocalQty(p.id, 1)}><i className="fas fa-plus"></i></button>
                            <span className="hqty-val">{getLocalQty(p.id)}</span>
                            <button className="hqty-btn" onClick={() => changeLocalQty(p.id, -1)}><i className="fas fa-minus"></i></button>
                          </div>
                        </div>
                        <button
                          className={`home-prod-cart-btn${addedId === p.id ? ' added' : ''}`}
                          onClick={() => handleAdd(p)}
                        >
                          <i className={`fas ${addedId === p.id ? 'fa-check' : 'fa-shopping-cart'}`}></i>
                          {addedId === p.id
                            ? (lang === 'ar' ? 'تمت الإضافة' : 'Added!')
                            : t('products.add')}
                        </button>
                      </div>
                    </article>
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
      {/* ── Why Us ── */}
      <section className="section home-why-section" aria-label="لماذا الجوهرة">
        <div className="container">
          <Reveal direction="up">
            <div className="section-header">
              <h2 className="section-title">{t('home.whyTitle')}</h2>
              <p className="section-subtitle">{t('home.whySub')}</p>
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
          <Reveal direction="up" delay={100}>
            <div className="client-tags" role="list">
              {featuredClients.map((c, i) => (
                <div key={i} className="client-tag" role="listitem">
                  <span className="client-tag-dot" style={{ background: c.color }} aria-hidden="true"></span>
                  <span style={{ color: c.color }}>{c.name}</span>
                </div>
              ))}
            </div>
          </Reveal>
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
              <blockquote className="quote-text">"{ceoQuote}"</blockquote>
              <p className="quote-author">{ceoName}</p>
              <p className="quote-author-title">{ceoTitle}</p>
            </div>
          </section>
        </Reveal>
      )}
    </>
  );
};

export default Home;
