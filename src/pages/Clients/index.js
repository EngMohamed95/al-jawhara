import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useApp } from '../../context/AppContext';
import Seo from '../../components/Seo';
import Reveal from '../../components/Reveal';
import './index.css';

const getInitials = (name) => name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

const ClientCard = ({ client, sectorLabel, lang }) => {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div className="client-card">
      <div className="client-logo-wrap">
        {!imgFailed ? (
          <img
            className="client-logo-img"
            src={client.logo}
            alt={client.name}
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="client-logo-fallback">
            {getInitials(client.name)}
          </div>
        )}
      </div>
      <div className="client-name">{lang === 'en' ? client.name : client.nameAr}</div>
      <div className="client-sector">
        <i className="fas fa-tag" aria-hidden="true"></i>
        {sectorLabel}
      </div>
    </div>
  );
};

const Clients = () => {
  const { t, lang } = useLanguage();
  const { clients, clientSectors } = useApp();
  const [activeSectorKey, setActiveSectorKey] = useState('all');

  // Only display active clients that have a logo, ordered as set in the dashboard
  const clientsWithLogos = clients
    .filter(c => c.logo && c.status !== 'inactive')
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0) || a.name.localeCompare(b.name));

  const sectorKeys = ['all', ...new Set(clientsWithLogos.map(c => c.sectorKey))];

  const getSectorLabel = (key) => {
    if (key === 'all') return t('clients.all');
    const s = clientSectors.find(x => x.key === key);
    if (!s) return key;
    return (lang === 'en' ? s.nameEn : s.nameAr) || s.nameAr || s.nameEn || key;
  };

  const filtered = activeSectorKey === 'all'
    ? clientsWithLogos
    : clientsWithLogos.filter(c => c.sectorKey === activeSectorKey);

  const stats = t('clients.stats');

  return (
    <>
      <Seo
        title={t('clients.title')}
        description={t('clients.sub')}
        keywords="عملاء الجوهرة، كارفور الكويت، سلطان سنتر، جمعيات تعاونية، مطاعم الكويت"
      />

      <header className="page-header clients-header">
        <div className="container">
          <div className="page-header-content">
            <div className="page-header-icon" aria-hidden="true"><i className="fas fa-handshake"></i></div>
            <h1>{t('clients.title')}</h1>
            <p>{t('clients.sub')}</p>
          </div>
        </div>
      </header>

      <section className="section">
        <div className="container">

          <div className="clients-stats" role="list" aria-label="إحصائيات">
            {Array.isArray(stats) && stats.map((s, i) => (
              <Reveal key={i} delay={i * 80} direction="up">
                <div className="clients-stat-card" role="listitem">
                  <i className={`fas ${s.icon} clients-stat-icon`} aria-hidden="true"></i>
                  <div className="clients-stat-num">{s.num}</div>
                  <div className="clients-stat-label">{typeof s.label === 'object' ? (s.label[lang] || s.label.ar) : s.label}</div>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="filters filters-center" role="group" aria-label="تصفية حسب القطاع">
            {sectorKeys.map(key => (
              <button
                key={key}
                className={`filter-btn${activeSectorKey === key ? ' active' : ''}`}
                onClick={() => setActiveSectorKey(key)}
                aria-pressed={activeSectorKey === key}
              >
                {getSectorLabel(key)}
              </button>
            ))}
          </div>

          <div className="clients-grid" role="list" aria-label="قائمة العملاء">
            {filtered.map((c, i) => (
              <Reveal key={i} delay={(i % 5) * 60} direction="up">
                <div role="listitem">
                  <ClientCard
                    client={c}
                    sectorLabel={getSectorLabel(c.sectorKey)}
                    lang={lang}
                  />
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal direction="up" delay={100}>
            <div className="clients-cta">
              <i className="fas fa-handshake clients-cta-icon" aria-hidden="true"></i>
              <h3 className="clients-cta-title">{t('clients.ctaTitle')}</h3>
              <p className="clients-cta-text">{t('clients.ctaText')}</p>
              <Link to="/contact" className="btn btn-green">
                <i className="fas fa-envelope" aria-hidden="true"></i>
                {t('clients.ctaBtn')}
              </Link>
            </div>
          </Reveal>

        </div>
      </section>
    </>
  );
};

export default Clients;
