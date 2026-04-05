import { useApp } from '../../context/AppContext';
import Seo from '../../components/Seo';
import './index.css';

const milestones = [
  { year: '1998', title: 'التأسيس',        desc: 'تأسيس الشركة في الشعيبة الصناعية', last: false },
  { year: '2003', title: 'التوسع الأول',   desc: 'توسعة خطوط الإنتاج وإضافة منتجات جديدة', last: false },
  { year: '2010', title: 'شهادة الجودة',   desc: 'الحصول على شهادة ISO 9001 لضمان الجودة', last: false },
  { year: '2018', title: 'الاحتفال بـ 20 عاماً', desc: 'عشرون عاماً ناجحاً في خدمة العملاء', last: false },
  { year: '2024', title: 'قفزة نوعية',     desc: 'استثمارات جديدة في خطوط إنتاج حديثة', last: true },
];

const About = () => {
  const { siteContent: sc } = useApp();

  const story   = sc?.aboutStory   || 'بدأت شركة الجوهرة مسيرتها في 1998...';
  const ceoName  = sc?.ceoName     || 'بلال محمد غدار';
  const ceoTitle = sc?.ceoTitle    || 'المدير العام';
  const ceoQuote = sc?.ceoQuote    || '';
  const area     = sc?.factoryArea || '4,500';
  const prod     = sc?.productionCapacity || '20,000';
  const founded  = sc?.founded     || '18/2/1998';
  const phone    = sc?.companyPhone|| '(965) 23263824';
  const email    = sc?.companyEmail|| 'info@al-jawhara.com';

  const infoCards = [
    { icon: 'fa-calendar-check', title: 'تاريخ التأسيس',    value: founded,       desc: 'أكثر من 26 عاماً من الخبرة في الصناعة' },
    { icon: 'fa-industry',       title: 'مساحة المصنع',     value: `${area} م²`,  desc: 'منشأة إنتاجية متكاملة بأحدث المعدات' },
    { icon: 'fa-weight-hanging', title: 'الطاقة الإنتاجية', value: `${prod} طن/سنة`, desc: 'إنتاج سنوي ضخم يلبي احتياجات السوق' },
    { icon: 'fa-location-dot',   title: 'الموقع',            value: 'الشعيبة الصناعية', desc: 'المنطقة الصناعية بالشعيبة — الكويت' },
    { icon: 'fa-phone',          title: 'الهاتف',            value: phone,          desc: 'متاحون خلال ساعات العمل الرسمية' },
    { icon: 'fa-envelope',       title: 'البريد الإلكتروني', value: email,          desc: 'راسلونا وسنرد في أقرب وقت ممكن' },
  ];

  const storyStats = [
    { num: '26+', label: 'عاماً من الخبرة', icon: 'fa-clock',    bg: 'var(--primary-xlight)' },
    { num: prod,  label: 'طن/سنة',          icon: 'fa-industry',  bg: '#fdf0e6' },
    { num: area,  label: 'م² مساحة',         icon: 'fa-warehouse', bg: 'var(--primary-xlight)' },
    { num: '25+', label: 'عميل مميز',        icon: 'fa-users',     bg: '#fdf0e6' },
  ];

  return (
    <>
      <Seo
        title="من نحن"
        description={`شركة الجوهرة للمناديل الورقية — تأسست ${founded}. مصنع في الشعيبة، طاقة إنتاجية ${prod} طن/سنة.`}
        keywords="عن الجوهرة، تأسيس 1998، مصنع الكويت، مناديل ورقية الشعيبة"
      />

      {/* Header */}
      <header className="page-header">
        <div className="container">
          <div className="page-header-content">
            <div className="page-header-icon" aria-hidden="true"><i className="fas fa-circle-info"></i></div>
            <h1>من نحن</h1>
            <p>تعرف على شركة الجوهرة — قصة نجاح كويتية منذ 1998</p>
          </div>
        </div>
      </header>

      {/* Story */}
      <section className="section about-story-section" aria-label="قصتنا">
        <div className="container">
          <div className="story-grid">
            <div>
              <span className="story-badge">
                <i className="fas fa-star" aria-hidden="true"></i> قصتنا
              </span>
              <h2 className="story-title">رحلة الجودة منذ <span>{founded.split('/')[2] || '1998'}</span></h2>
              <p className="story-text">{story}</p>
              <p className="story-text">اليوم، نخدم أكثر من 25 عميلاً من كبرى الشركات والمؤسسات، ونواصل مسيرة التطوير والابتكار لتقديم الأفضل دائماً.</p>
            </div>
            <div className="story-stats-grid">
              {storyStats.map((s, i) => (
                <div key={i} className="story-stat" style={{ background: s.bg }}>
                  <i className={`fas ${s.icon} story-stat-icon`} aria-hidden="true"></i>
                  <div className="story-stat-num">{s.num}</div>
                  <div className="story-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Info Cards */}
      <section className="section about-info-section" aria-label="بيانات الشركة">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">بيانات الشركة</h2>
            <p className="section-subtitle">معلومات تفصيلية عن شركة الجوهرة للمناديل الورقية</p>
          </div>
          <div className="info-grid">
            {infoCards.map((c, i) => (
              <div key={i} className="info-card">
                <div className="info-card-icon" aria-hidden="true"><i className={`fas ${c.icon}`}></i></div>
                <h3>{c.title}</h3>
                <div className="info-card-value">{c.value}</div>
                <p>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section about-mv-section" aria-label="رسالتنا ورؤيتنا">
        <div className="container">
          <div className="mv-grid">
            <div className="mv-card mv-card-green">
              <span className="mv-icon" aria-hidden="true">🎯</span>
              <h3 className="mv-title mv-title-green">رسالتنا</h3>
              <p className="mv-text">تصنيع وتوريد منتجات ورقية عالية الجودة تلبي احتياجات عملائنا بأسعار تنافسية، مع الحفاظ على بيئة عمل آمنة ومستدامة.</p>
            </div>
            <div className="mv-card mv-card-orange">
              <span className="mv-icon" aria-hidden="true">🔭</span>
              <h3 className="mv-title mv-title-orange">رؤيتنا</h3>
              <p className="mv-text">أن نكون الخيار الأول للمنتجات الورقية في الكويت والخليج العربي من خلال الابتكار والالتزام بأعلى معايير الجودة والخدمة.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section about-timeline-section" aria-label="محطاتنا عبر الزمن">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">محطاتنا عبر الزمن</h2>
            <p className="section-subtitle">أبرز المحطات في مسيرة شركة الجوهرة</p>
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
                    <span className="timeline-title">{m.title}</span>
                  </div>
                  <p className="timeline-desc">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CEO Card */}
      {ceoQuote && (
        <section className="section about-ceo-section" aria-label="كلمة المدير العام">
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
