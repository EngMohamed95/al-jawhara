import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import translations from '../../translations';
import Seo from '../../components/Seo';
import './index.css';

const About = () => {
  const { siteContent: sc } = useApp();
  const { t, lang } = useLanguage();

  const story    = lang === 'ar' ? (sc?.aboutStory || t('about.storyFallback')) : t('about.story1');
  const ceoName  = sc?.ceoName  || 'Bilal Mohammad Ghadar';
  const ceoTitle = sc?.ceoTitle || t('about.ceoTitleFallback');
  const ceoQuote = sc?.ceoQuote || '';
  const area     = sc?.factoryArea           || '4,500';
  const prod     = sc?.productionCapacity    || '20,000';
  const founded  = sc?.founded               || '18/2/1998';
  const phone    = sc?.companyPhone          || '(965) 23263824';
  const email    = sc?.companyEmail          || 'info@al-jawhara.com';

  const milestones = translations.about.milestones;

  const infoCards = translations.about.infoCards.map((c, i) => ({
    ...c,
    value: [founded, `${area} ${lang === 'ar' ? 'م²' : 'm²'}`, `${prod} ${lang === 'ar' ? 'طن/سنة' : 'tons/yr'}`, t('about.location'), phone, email][i],
  }));

  const storyStats = translations.about.storyStats.map((s, i) => ({
    ...s,
    num: s.num || [null, prod, area, null][i],
  }));

  return (
    <>
      <Seo
        title={t('about.title')}
        description={lang === 'ar'
          ? `شركة الجوهرة للمناديل الورقية — تأسست ${founded}. مصنع في الشعيبة، طاقة إنتاجية ${prod} طن/سنة.`
          : `Al-Jawhara Tissue Paper Co. — Founded ${founded}. Factory in Shuaiba, ${prod} tons/year capacity.`}
        keywords="عن الجوهرة، تأسيس 1998، مصنع الكويت، مناديل ورقية الشعيبة"
      />

      {/* Header */}
      <header className="page-header">
        <div className="container">
          <div className="page-header-content">
            <div className="page-header-icon" aria-hidden="true"><i className="fas fa-circle-info"></i></div>
            <h1>{t('about.title')}</h1>
            <p>{t('about.subtitle')}</p>
          </div>
        </div>
      </header>

      {/* Story */}
      <section className="section about-story-section" aria-label={t('about.storyBadge')}>
        <div className="container">
          <div className="story-grid">
            <div>
              <span className="story-badge">
                <i className="fas fa-star" aria-hidden="true"></i> {t('about.storyBadge')}
              </span>
              <h2 className="story-title">{t('about.storyTitle')} <span>{founded.split('/')[2] || '1998'}</span></h2>
              <p className="story-text">{story}</p>
              <p className="story-text">{t('about.story2')}</p>
            </div>
            <div className="story-stats-grid">
              {storyStats.map((s, i) => (
                <div key={i} className="story-stat" style={{ background: s.bg }}>
                  <i className={`fas ${s.icon} story-stat-icon`} aria-hidden="true"></i>
                  <div className="story-stat-num">{s.num}</div>
                  <div className="story-stat-label">{s.label[lang] || s.label.ar}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Info Cards */}
      <section className="section about-info-section" aria-label={t('about.infoTitle')}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{t('about.infoTitle')}</h2>
            <p className="section-subtitle">{t('about.infoSub')}</p>
          </div>
          <div className="info-grid">
            {infoCards.map((c, i) => (
              <div key={i} className="info-card">
                <div className="info-card-icon" aria-hidden="true"><i className={`fas ${c.icon}`}></i></div>
                <h3>{c.title[lang] || c.title.ar}</h3>
                <div className="info-card-value">{c.value}</div>
                <p>{c.desc[lang] || c.desc.ar}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section about-mv-section" aria-label={`${t('about.mission')} & ${t('about.vision')}`}>
        <div className="container">
          <div className="mv-grid">
            <div className="mv-card mv-card-green">
              <span className="mv-icon" aria-hidden="true">🎯</span>
              <h3 className="mv-title mv-title-green">{t('about.mission')}</h3>
              <p className="mv-text">{t('about.missionText')}</p>
            </div>
            <div className="mv-card mv-card-orange">
              <span className="mv-icon" aria-hidden="true">🔭</span>
              <h3 className="mv-title mv-title-orange">{t('about.vision')}</h3>
              <p className="mv-text">{t('about.visionText')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section about-timeline-section" aria-label={t('about.timeline')}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{t('about.timeline')}</h2>
            <p className="section-subtitle">{t('about.timelineSub')}</p>
          </div>
          <div className="timeline-wrap">
            <div className="timeline-line" aria-hidden="true"></div>
            {milestones.map((m, i) => (
              <div key={i} className="timeline-item">
                <div className={`timeline-dot ${m.last ? 'timeline-dot-orange' : 'timeline-dot-green'}`} aria-hidden="true">
                  {m.year.slice(2)}
                </div>
                <div className="timeline-content">
                  <div className="timeline-header">
                    <span className="timeline-year-badge">{m.year}</span>
                    <span className="timeline-title">{m.title[lang] || m.title.ar}</span>
                  </div>
                  <p className="timeline-desc">{m.desc[lang] || m.desc.ar}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CEO Card */}
      {ceoQuote && (
        <section className="section about-ceo-section" aria-label={t('about.ceoWord')}>
          <div className="container">
            <div className="ceo-card">
              <div className="ceo-avatar" aria-hidden="true"><i className="fas fa-user-tie"></i></div>
              <div>
                <div aria-hidden="true" style={{ fontSize: '2.5rem', opacity: 0.25, lineHeight: 1, marginBottom: '-8px' }}>
                  <i className="fas fa-quote-right"></i>
                </div>
                <blockquote className="ceo-quote">"{ceoQuote}"</blockquote>
                <cite className="ceo-name">{ceoName}</cite>
                <p className="ceo-role">{ceoTitle}</p>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default About;
