import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import translations from '../../translations';
import Seo from '../../components/Seo';
import Reveal from '../../components/Reveal';
import './index.css';

const About = () => {
  const { siteContent: sc } = useApp();
  const { t, lang } = useLanguage();

  const story       = lang === 'ar' ? (sc?.aboutStory  || t('about.storyFallback')) : t('about.story1');
  const story2      = sc?.aboutStory2 || '';
  const ceoName     = sc?.ceoName    || 'Bilal Mohammad Ghadar';
  const ceoTitle    = sc?.ceoTitle   || t('about.ceoTitleFallback');
  const ceoQuote    = sc?.ceoQuote   || '';
  const ceoImage    = sc?.ceoImage   || '';
  const aboutStoryImg   = sc?.aboutStoryImg   || '';
  const aboutHeaderImg  = sc?.aboutHeaderImg  || '';
  const missionText = sc?.missionText || t('about.missionText');
  const visionText  = sc?.visionText  || t('about.visionText');
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
      <header className="page-header" style={aboutHeaderImg ? { backgroundImage: `url(${aboutHeaderImg})`, backgroundSize:'cover', backgroundPosition:'center' } : {}}>
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
            <Reveal direction="right">
              <div>
                <span className="story-badge">
                  <i className="fas fa-star" aria-hidden="true"></i> {t('about.storyBadge')}
                </span>
                <h2 className="story-title">{t('about.storyTitle')} <span>{founded.split('/')[2] || '1998'}</span></h2>
                <p className="story-text">{story}</p>
                {story2 && <p className="story-text">{story2}</p>}
                {!story2 && <p className="story-text">{t('about.story2')}</p>}
              </div>
            </Reveal>
            {aboutStoryImg ? (
              <Reveal direction="left">
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <img src={aboutStoryImg} alt={t('about.storyBadge')} style={{ width:'100%', maxWidth:480, borderRadius:16, boxShadow:'0 8px 32px rgba(0,0,0,0.12)' }} />
                </div>
              </Reveal>
            ) : (
              <div className="story-stats-grid">
                {storyStats.map((s, i) => (
                  <Reveal key={i} delay={i * 80} direction="up">
                    <div className="story-stat" style={{ background: s.bg }}>
                      <i className={`fas ${s.icon} story-stat-icon`} aria-hidden="true"></i>
                      <div className="story-stat-num">{s.num}</div>
                      <div className="story-stat-label">{s.label[lang] || s.label.ar}</div>
                    </div>
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Info Cards */}
      <section className="section about-info-section" aria-label={t('about.infoTitle')}>
        <div className="container">
          <Reveal direction="up">
            <div className="section-header">
              <h2 className="section-title">{t('about.infoTitle')}</h2>
              <p className="section-subtitle">{t('about.infoSub')}</p>
            </div>
          </Reveal>
          <div className="info-grid">
            {infoCards.map((c, i) => (
              <Reveal key={i} delay={i * 80} direction="up">
                <div className="info-card">
                  <div className="info-card-icon" aria-hidden="true"><i className={`fas ${c.icon}`}></i></div>
                  <h3>{c.title[lang] || c.title.ar}</h3>
                  <div className="info-card-value">{c.value}</div>
                  <p>{c.desc[lang] || c.desc.ar}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section about-mv-section" aria-label={`${t('about.mission')} & ${t('about.vision')}`}>
        <div className="container">
          <div className="mv-grid">
            <Reveal direction="right">
              <div className="mv-card mv-card-green">
                <span className="mv-icon" aria-hidden="true">🎯</span>
                <h3 className="mv-title mv-title-green">{t('about.mission')}</h3>
                <p className="mv-text">{missionText}</p>
              </div>
            </Reveal>
            <Reveal direction="left" delay={100}>
              <div className="mv-card mv-card-orange">
                <span className="mv-icon" aria-hidden="true">🔭</span>
                <h3 className="mv-title mv-title-orange">{t('about.vision')}</h3>
                <p className="mv-text">{visionText}</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section about-timeline-section" aria-label={t('about.timeline')}>
        <div className="container">
          <Reveal direction="up">
            <div className="section-header">
              <h2 className="section-title">{t('about.timeline')}</h2>
              <p className="section-subtitle">{t('about.timelineSub')}</p>
            </div>
          </Reveal>
          <div className="timeline-wrap">
            <div className="timeline-line" aria-hidden="true"></div>
            {milestones.map((m, i) => (
              <Reveal key={i} delay={(i % 3) * 80} direction={i % 2 === 0 ? 'right' : 'left'}>
                <div className="timeline-item">
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
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CEO Card */}
      {ceoQuote && (
        <Reveal direction="up">
          <section className="section about-ceo-section" aria-label={t('about.ceoWord')}>
            <div className="container">
              <div className="ceo-card">
                <div className="ceo-avatar" aria-hidden="true">
                  <img src={ceoImage || '/ceo.jpg'} alt={ceoName} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', borderRadius: '50%' }} />
                </div>
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
        </Reveal>
      )}
    </>
  );
};

export default About;
