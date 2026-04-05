import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import Seo from '../../components/Seo';
import './index.css';

const whyFeatures = [
  { icon: 'fa-medal',      title: 'جودة معتمدة',   desc: 'منتجاتنا تستوفي أعلى معايير الجودة الخليجية والدولية' },
  { icon: 'fa-leaf',       title: 'صديق للبيئة',   desc: 'نستخدم مواد خام قابلة للتدوير ونلتزم بمعايير الاستدامة' },
  { icon: 'fa-truck-fast', title: 'توصيل سريع',    desc: 'شبكة توزيع واسعة تضمن وصول منتجاتنا في الوقت المحدد' },
  { icon: 'fa-headset',    title: 'دعم 24/7',       desc: 'فريق متخصص لخدمة العملاء على مدار الساعة' },
];

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
  const featured = products.filter(p => p.status === 'active').slice(0, 4);

  const heroBadge   = sc?.heroBadge   || 'الرائد في صناعة المناديل الورقية بالكويت';
  const heroTitle   = sc?.heroTitle   || 'شركة الجوهرة للمناديل الورقية';
  const heroSub     = sc?.heroSubtitle|| 'جودة استثنائية في كل ورقة';
  const ceoName     = sc?.ceoName     || 'بلال محمد غدار';
  const ceoTitle    = sc?.ceoTitle    || 'المدير العام';
  const ceoQuote    = sc?.ceoQuote    || '';
  const statsYear   = sc?.statsYear   || '1998';
  const statsArea   = sc?.factoryArea || '4,500';
  const statsProd   = sc?.productionCapacity || '20,000';
  const statsClients= sc?.statsClients|| '+25';

  const stats = [
    { icon: 'fa-calendar-check', number: statsYear,    label: 'سنة التأسيس' },
    { icon: 'fa-industry',       number: statsArea,    label: 'م² مساحة المصنع' },
    { icon: 'fa-weight-hanging', number: statsProd,    label: 'طن إنتاج سنوي' },
    { icon: 'fa-handshake',      number: statsClients, label: 'عميل معتمد' },
  ];

  return (
    <>
      <Seo
        title="الصفحة الرئيسية"
        description="شركة الجوهرة للمناديل الورقية — رائدة في تصنيع المناديل وأوراق التواليت والمناشف في الكويت منذ 1998."
        keywords="الجوهرة للمناديل، مناديل الكويت، tissue paper Kuwait, مناديل ورقية، رولات مطبخ"
      />

      {/* ── Hero ── */}
      <section className="hero" aria-label="القسم التعريفي">
        <span className="hero-bg-icon" aria-hidden="true">🧻</span>
        <div className="container">
          <div className="hero-content">
            <p className="hero-badge">
              <i className="fas fa-star" aria-hidden="true"></i>
              {heroBadge}
            </p>
            <h1 className="hero-title" dangerouslySetInnerHTML={{
              __html: heroTitle.replace('الجوهرة', '<span>الجوهرة</span>')
            }} />
            <p className="hero-subtitle">{heroSub}</p>
            <div className="hero-actions">
              <Link to="/products" className="btn btn-primary">
                <i className="fas fa-box-open" aria-hidden="true"></i>تصفح منتجاتنا
              </Link>
              <Link to="/contact" className="btn btn-outline">
                <i className="fas fa-envelope" aria-hidden="true"></i>تواصل معنا
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

      {/* ── Featured Products (from DB) ── */}
      <section className="section home-featured-section" aria-label="المنتجات المميزة">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">منتجاتنا المميزة</h2>
            <p className="section-subtitle">مجموعة متكاملة من المنتجات الورقية عالية الجودة</p>
          </div>
          {loading ? (
            <div className="home-loading" role="status" aria-live="polite">
              <i className="fas fa-spinner fa-spin" aria-hidden="true"></i>
              <span>جاري تحميل المنتجات...</span>
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
              عرض جميع المنتجات
            </Link>
          </div>
        </div>
      </section>

      {/* ── Why Us ── */}
      <section className="section home-why-section" aria-label="لماذا الجوهرة">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">لماذا تختار الجوهرة؟</h2>
            <p className="section-subtitle">نقدم لك أفضل تجربة من الجودة والخدمة</p>
          </div>
          <div className="home-why-grid">
            {whyFeatures.map((f, i) => (
              <div key={i} className="home-why-card">
                <div className="home-why-icon" aria-hidden="true">
                  <i className={`fas ${f.icon}`}></i>
                </div>
                <h3 className="home-why-title">{f.title}</h3>
                <p className="home-why-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Clients ── */}
      <section className="section home-clients-section" aria-label="عملاؤنا">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">عملاؤنا المميزون</h2>
            <p className="section-subtitle">نفخر بثقة كبرى الشركات والمؤسسات في منتجاتنا</p>
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
              <i className="fas fa-users" aria-hidden="true"></i>عرض جميع العملاء
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
