import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import Seo from '../../components/Seo';
import Reveal from '../../components/Reveal';
import './index.css';

const DEFAULT_SOCIAL = [
  { icon: 'fa-instagram',   label: 'Instagram',   field: 'instagramUrl' },
  { icon: 'fa-x-twitter',   label: 'X (Twitter)', field: 'twitterUrl'   },
  { icon: 'fa-linkedin-in', label: 'LinkedIn',     field: 'linkedinUrl'  },
  { icon: 'fa-facebook-f',  label: 'Facebook',    field: 'facebookUrl'  },
  { icon: 'fa-tiktok',      label: 'TikTok',      field: 'tiktokUrl'    },
  { icon: 'fa-youtube',     label: 'YouTube',     field: 'youtubeUrl'   },
];

const emptyForm = { name: '', company: '', phone: '', email: '', subject: '', message: '' };

const Contact = () => {
  const { siteContent: sc } = useApp();
  const { t, lang } = useLanguage();
  const [form, setForm]           = useState(emptyForm);
  const [sent, setSent]           = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const phone          = sc?.companyPhone    || '(965) 23263824';
  const whatsapp       = sc?.companyWhatsapp || '(965) 96625306';
  const email          = sc?.companyEmail    || 'info@al-jawhara.com';
  const address   = lang === 'en'
    ? (sc?.companyAddressEn || 'Industrial Area — Shuaiba, Kuwait')
    : (sc?.companyAddress   || t('contact.addressFallback'));
  const workHours = lang === 'en'
    ? (sc?.workHoursEn || 'Sunday – Thursday: 8 AM – 5 PM')
    : (sc?.workHours   || t('contact.workHoursFallback'));
  const mapEmbedUrl    = sc?.mapEmbedUrl     || '';
  const contactHeaderImg = sc?.contactHeaderImg || '';
  const socialLinks    = DEFAULT_SOCIAL.map(s => ({ ...s, href: sc?.[s.field] || '#' })).filter(s => s.href !== '#' || true);

  const waNum    = whatsapp.replace(/\D/g, '');
  const phoneNum = phone.replace(/\D/g, '');

  const contactItems = [
    { icon: 'fa-phone',          label: t('contact.labels.phone'),    value: phone,     dir: 'ltr', href: `tel:+${phoneNum}` },
    { icon: 'fa-whatsapp fab',   label: t('contact.labels.whatsapp'), value: whatsapp,  dir: 'ltr', href: `https://wa.me/${waNum}` },
    { icon: 'fa-envelope',       label: t('contact.labels.email'),    value: email,     dir: 'ltr', href: `mailto:${email}` },
    { icon: 'fa-location-dot',   label: t('contact.labels.address'),  value: address,   dir: lang === 'ar' ? 'rtl' : 'ltr', href: null },
    { icon: 'fa-clock',          label: t('contact.labels.hours'),    value: workHours, dir: lang === 'ar' ? 'rtl' : 'ltr', href: null },
  ];

  const subjects = t('contact.subjects');

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSent(true);
      setForm(emptyForm);
    }, 1500);
  };

  return (
    <>
      <Seo
        title={t('contact.title')}
        description={lang === 'ar'
          ? `تواصل مع شركة الجوهرة للمناديل الورقية — ${phone} — ${address}`
          : `Contact Al-Jawhara Tissue Paper Co. — ${phone} — ${address}`}
        keywords="تواصل الجوهرة، هاتف الجوهرة، عنوان الشعيبة، طلب عرض سعر"
      />

      <header className="page-header" style={contactHeaderImg ? { backgroundImage: `url(${contactHeaderImg})`, backgroundSize:'cover', backgroundPosition:'center' } : {}}>
        <div className="container">
          <div className="page-header-content">
            <div className="page-header-icon" aria-hidden="true"><i className="fas fa-envelope"></i></div>
            <h1>{t('contact.title')}</h1>
            <p>{t('contact.sub')}</p>
          </div>
        </div>
      </header>

      <section className="section">
        <div className="container">
          <div className="contact-layout">

            {/* ── Info Panel ── */}
            <Reveal direction="right">
            <div className="contact-info-card">
              <h2>{t('contact.infoTitle')}</h2>
              <p>{t('contact.infoSub')}</p>

              {contactItems.map((item, i) => {
                const isFab = item.icon.includes('fab');
                const iconClass = isFab
                  ? `fab ${item.icon.replace(' fab', '')}`
                  : `fas ${item.icon}`;
                return (
                  <div key={i} className="contact-item">
                    <div className="contact-item-icon">
                      <i className={iconClass} aria-hidden="true"></i>
                    </div>
                    <div>
                      <span className="contact-item-label">{item.label}</span>
                      {item.href ? (
                        <a
                          href={item.href}
                          className="contact-info-link"
                          dir={item.dir}
                          target={item.href.startsWith('http') ? '_blank' : undefined}
                          rel={item.href.startsWith('http') ? 'noreferrer' : undefined}
                        >
                          {item.value}
                        </a>
                      ) : (
                        <span className="contact-info-value" dir={item.dir}>{item.value}</span>
                      )}
                    </div>
                  </div>
                );
              })}

              <div className="contact-socials-divider">
                <div className="contact-socials-label">{t('contact.followUs')}</div>
                <div className="contact-social-links">
                  {socialLinks.filter(s => s.href && s.href !== '#').map((s, i) => (
                    <a key={i} href={s.href} className="contact-social-link" aria-label={s.label} target="_blank" rel="noopener noreferrer">
                      <i className={`fab ${s.icon}`} aria-hidden="true"></i>
                    </a>
                  ))}
                  {!socialLinks.some(s => s.href && s.href !== '#') && socialLinks.slice(0,4).map((s, i) => (
                    <a key={i} href="#top" className="contact-social-link" aria-label={s.label}>
                      <i className={`fab ${s.icon}`} aria-hidden="true"></i>
                    </a>
                  ))}
                </div>
              </div>
            </div>
            </Reveal>

            {/* ── Form ── */}
            <Reveal direction="left" delay={100}>
            <div className="contact-form-card">
              <h2 className="contact-form-title">{t('contact.formTitle')}</h2>
              <p className="contact-form-subtitle">{t('contact.formSub')}</p>

              {sent && (
                <div className="alert alert-success" role="alert">
                  <i className="fas fa-circle-check" aria-hidden="true"></i>
                  {t('contact.sent')}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">{t('contact.name')}</label>
                    <input className="form-input" name="name" value={form.name} onChange={handleChange} placeholder={t('contact.namePlaceholder')} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('contact.company')}</label>
                    <input className="form-input" name="company" value={form.company} onChange={handleChange} placeholder={t('contact.companyPlaceholder')} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">{t('contact.phone')}</label>
                    <input className="form-input" name="phone" value={form.phone} onChange={handleChange} placeholder="+965XXXXXXXX" dir="ltr" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('contact.email')}</label>
                    <input className="form-input" type="email" name="email" value={form.email} onChange={handleChange} placeholder="email@example.com" dir="ltr" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">{t('contact.subject')}</label>
                  <select className="form-select" name="subject" value={form.subject} onChange={handleChange} required>
                    {Array.isArray(subjects) && subjects.map((s, i) => (
                      <option key={i} value={s.val}>{typeof s.label === 'object' ? (s.label[lang] || s.label.ar) : s.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">{t('contact.message')}</label>
                  <textarea className="form-textarea" name="message" value={form.message} onChange={handleChange} placeholder={t('contact.messagePlaceholder')} required />
                </div>

                <button type="submit" className="btn btn-green contact-submit-btn" disabled={submitting}>
                  {submitting
                    ? <><i className="fas fa-spinner fa-spin" aria-hidden="true"></i> {t('contact.sending')}</>
                    : <><i className="fas fa-paper-plane" aria-hidden="true"></i> {t('contact.send')}</>
                  }
                </button>
              </form>
            </div>
            </Reveal>

          </div>

          {mapEmbedUrl ? (
            <div style={{ borderRadius: 16, overflow: 'hidden', marginTop: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
              <iframe src={mapEmbedUrl} width="100%" height="380" style={{ border: 0, display:'block' }} allowFullScreen loading="lazy" title={t('contact.map')} />
            </div>
          ) : (
            <div className="map-placeholder" aria-hidden="true">
              <i className="fas fa-map-location-dot map-placeholder-icon"></i>
              <div className="map-placeholder-title">{t('contact.map')}</div>
              <div className="map-placeholder-address">{address}</div>
            </div>
          )}

        </div>
      </section>
    </>
  );
};

export default Contact;
