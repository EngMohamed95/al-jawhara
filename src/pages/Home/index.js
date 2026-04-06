import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import translations from '../../translations';
import Seo from '../../components/Seo';
import './index.css';

const HERO_VIDEO = 'https://al-jawhara.co/wp-content/uploads/2022/10/JawharaNewIntro.mp4';

const featuredClients = [
  { name: 'Carrefour',     color: '#003087' },
  { name: 'Starbucks',     color: '#00704A' },
  { name: 'Talabat',       color: '#FF5A00' },
  { name: "Chili's",       color: '#C41230' },
  { name: 'Sultan Center', color: '#1A237E' },
  { name: 'LuLu',          color: '#E53935' },
];

const Home = () => {
  const { products, loading, siteContent: sc } = useApp();
  const { t, lang } = useLanguage();
  const featured = products.filter(p => p.status === 'active').slice(0, 4);

  /* Hero content — use DB value only in Arabic, always use translation in English */
  const heroBadge = lang === 'ar' ? (sc?.heroBadge   || t('home.heroBadge'))    : t('home.heroBadge');
  const heroTitle = lang === 'ar' ? (sc?.heroTitle   || t('home.heroTitle'))    : t('home.heroTitle');
  const heroSub   = lang === 'ar' ? (sc?.heroSubtitle|| t('home.heroSubtitle')) : t('home.heroSubtitle');

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

        {/* Background video */}
        <video
          className="hero-video-bg"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="https://al-jawhara.co/wp-content/uploads/revslider/video-media/JawharaNewIntro_59_layer.jpeg"
          aria-hidden="true"
        >
          <source src={HERO_VIDEO} type="video/mp4" />
        </video>

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
              <div className="stat-card" key={i}>
                <div className="stat-icon" aria-hidden="true"><i className={`fas ${s.icon}`}></i></div>
                <div className="stat-number">{s.number}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="section home-featured-section" aria-label="المنتجات المميزة">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{t('home.featuredTitle')}</h2>
            <p className="section-subtitle">{t('home.featuredSub')}</p>
          </div>
          {loading ? (
            <div className="home-loading" role="status" aria-live="polite">
              <i className="fas fa-spinner fa-spin" aria-hidden="true"></i>
              <span>{t('home.loading')}</span>
            </div>
          ) : (
            <div className="home-featured-grid">
              {featured.map(p => (
                <article key={p.id} className="card home-featured-card">
                  <span className="home-featured-icon" aria-hidden="true">{p.icon}</span>
                  <h3 className="home-featured-name">{p.name}</h3>
                  <p className="home-featured-desc">{p.desc}</p>
                </article>
              ))}
            </div>
          )}
          <div className="section-center" style={{ marginTop: '35px' }}>
            <Link to="/products" className="btn btn-green">
              <i className="fas fa-arrow-left" aria-hidden="true"></i>
              {t('home.viewAll')}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Why Us ── */}
      <section className="section home-why-section" aria-label="لماذا الجوهرة">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{t('home.whyTitle')}</h2>
            <p className="section-subtitle">{t('home.whySub')}</p>
          </div>
          <div className="home-why-grid">
            {whyFeatures.map((f, i) => (
              <div key={i} className="home-why-card">
                <div className="home-why-icon" aria-hidden="true">
                  <i className={`fas ${f.icon}`}></i>
                </div>
                <h3 className="home-why-title">{f.title[lang] || f.title.ar}</h3>
                <p className="home-why-desc">{f.desc[lang] || f.desc.ar}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Clients ── */}
      <section className="section home-clients-section" aria-label="عملاؤنا">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{t('home.clientsTitle')}</h2>
            <p className="section-subtitle">{t('home.clientsSub')}</p>
          </div>
          <div className="client-tags" role="list">
            {featuredClients.map((c, i) => (
              <div key={i} className="client-tag" role="listitem">
                <span className="client-tag-dot" style={{ background: c.color }} aria-hidden="true"></span>
                <span style={{ color: c.color }}>{c.name}</span>
              </div>
            ))}
          </div>
          <div className="section-center">
            <Link to="/clients" className="btn btn-green">
              <i className="fas fa-users" aria-hidden="true"></i>
              {t('home.viewClients')}
            </Link>
          </div>
        </div>
      </section>

      {/* ── CEO Quote ── */}
      {ceoQuote && (
        <section className="quote-section" aria-label="كلمة المدير العام">
          <div className="container">
            <div className="quote-icon" aria-hidden="true"><i className="fas fa-quote-right"></i></div>
            <blockquote className="quote-text">"{ceoQuote}"</blockquote>
            <p className="quote-author">{ceoName}</p>
            <p className="quote-author-title">{ceoTitle}</p>
          </div>
        </section>
      )}
    </>
  );
};

export default Home;
