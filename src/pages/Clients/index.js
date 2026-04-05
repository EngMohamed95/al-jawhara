import { useState } from 'react';
import { Link } from 'react-router-dom';
import Seo from '../../components/Seo';
import './index.css';

const clients = [
  { name: 'Carrefour',       nameAr: 'كارفور',                   sector: 'تجزئة',        color: '#003087' },
  { name: 'Sultan Center',   nameAr: 'سلطان سنتر',               sector: 'تجزئة',        color: '#1A237E' },
  { name: 'LuLu Hypermarket',nameAr: 'لولو هايبر ماركت',         sector: 'تجزئة',        color: '#E53935' },
  { name: 'Saveco',          nameAr: 'سيفكو',                    sector: 'تجزئة',        color: '#2E7D32' },
  { name: 'Géant',           nameAr: 'جيان',                     sector: 'تجزئة',        color: '#D32F2F' },
  { name: 'Starbucks',       nameAr: 'ستاربكس',                  sector: 'كافيهات',      color: '#00704A' },
  { name: "Chili's",         nameAr: 'تشيليز',                   sector: 'مطاعم',        color: '#C41230' },
  { name: 'Talabat',         nameAr: 'طلبات',                    sector: 'توصيل طعام',   color: '#FF5A00' },
  { name: 'KFC',             nameAr: 'كنتاكي',                   sector: 'مطاعم',        color: '#E8000D' },
  { name: "McDonald's",      nameAr: 'ماكدونالدز',               sector: 'مطاعم',        color: '#FFC72C' },
  { name: 'Burger King',     nameAr: 'برجر كينج',                sector: 'مطاعم',        color: '#D62300' },
  { name: 'Pizza Hut',       nameAr: 'بيتزا هت',                 sector: 'مطاعم',        color: '#CC0000' },
  { name: 'Marriott',        nameAr: 'ماريوت',                   sector: 'فنادق',        color: '#8B0000' },
  { name: 'Hilton',          nameAr: 'هيلتون',                   sector: 'فنادق',        color: '#002244' },
  { name: 'Crowne Plaza',    nameAr: 'كراون بلازا',              sector: 'فنادق',        color: '#003580' },
  { name: 'Royale Hayat',    nameAr: 'مستشفى رويال حياة',        sector: 'رعاية صحية',  color: '#0277BD' },
  { name: 'Al Seef Hospital',nameAr: 'مستشفى السيف',             sector: 'رعاية صحية',  color: '#00695C' },
  { name: 'Kuwait University',nameAr: 'جامعة الكويت',            sector: 'تعليم',        color: '#1565C0' },
  { name: 'Ministry of Health',nameAr: 'وزارة الصحة',           sector: 'حكومي',        color: '#2E7D32' },
  { name: 'KNPC',            nameAr: 'مصافي البترول الكويتية',   sector: 'نفط وطاقة',   color: '#E65100' },
];

const allSectors = ['الكل', ...new Set(clients.map(c => c.sector))];
const getInitials = (name) => name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

const ClientCard = ({ client }) => (
  <div className="client-card">
    <div className="client-logo-wrap">
      <div className="client-logo-fallback" style={{ background: client.color }}>
        {getInitials(client.name)}
      </div>
    </div>
    <div className="client-name">{client.nameAr}</div>
    <div className="client-sector">
      <i className="fas fa-tag" aria-hidden="true"></i>
      {client.sector}
    </div>
  </div>
);

const statCards = [
  { icon: 'fa-users',   num: '20+', label: 'عميل معتمد' },
  { icon: 'fa-store',   num: '7',   label: 'قطاعات مختلفة' },
  { icon: 'fa-globe',   num: '3',   label: 'دول خليجية' },
  { icon: 'fa-star',    num: '26+', label: 'عام من الشراكة' },
];

const Clients = () => {
  const [activeSector, setActiveSector] = useState('الكل');

  const filtered = activeSector === 'الكل'
    ? clients
    : clients.filter(c => c.sector === activeSector);

  return (
    <>
      <Seo
        title="عملاؤنا"
        description="نخدم أكثر من 20 عميلاً من كبرى الشركات في الكويت — كارفور، سلطان سنتر، ماكدونالدز، ماريوت وغيرهم."
        keywords="عملاء الجوهرة، كارفور الكويت، سلطان سنتر، فنادق الكويت، مطاعم الكويت"
      />

      <header className="page-header">
        <div className="container">
          <div className="page-header-content">
            <div className="page-header-icon" aria-hidden="true"><i className="fas fa-handshake"></i></div>
            <h1>عملاؤنا</h1>
            <p>نخدم أكثر من 20 عميلاً من كبرى الشركات والمؤسسات في الكويت والخليج</p>
          </div>
        </div>
      </header>

      <section className="section">
        <div className="container">

          <div className="clients-stats" role="list" aria-label="إحصائيات">
            {statCards.map((s, i) => (
              <div key={i} className="clients-stat-card" role="listitem">
                <i className={`fas ${s.icon} clients-stat-icon`} aria-hidden="true"></i>
                <div className="clients-stat-num">{s.num}</div>
                <div className="clients-stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="filters filters-center" role="group" aria-label="تصفية حسب القطاع">
            {allSectors.map(s => (
              <button
                key={s}
                className={`filter-btn${activeSector === s ? ' active' : ''}`}
                onClick={() => setActiveSector(s)}
                aria-pressed={activeSector === s}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="clients-grid" role="list" aria-label="قائمة العملاء">
            {filtered.map((c, i) => (
              <div key={i} role="listitem">
                <ClientCard client={c} />
              </div>
            ))}
          </div>

          <div className="clients-cta">
            <i className="fas fa-handshake clients-cta-icon" aria-hidden="true"></i>
            <h3 className="clients-cta-title">كن شريكنا القادم</h3>
            <p className="clients-cta-text">
              انضم إلى عائلة الجوهرة المتنامية واستمتع بجودة عالمية وخدمة استثنائية
            </p>
            <Link to="/contact" className="btn btn-green">
              <i className="fas fa-envelope" aria-hidden="true"></i>
              تواصل معنا الآن
            </Link>
          </div>

        </div>
      </section>
    </>
  );
};

export default Clients;
