import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Seo from '../../components/Seo';
import './index.css';

const socialLinks = [
  { icon: 'fa-instagram', label: 'Instagram',  href: '#' },
  { icon: 'fa-x-twitter', label: 'X (Twitter)', href: '#' },
  { icon: 'fa-linkedin-in', label: 'LinkedIn',  href: '#' },
  { icon: 'fa-whatsapp',  label: 'WhatsApp',    href: '#' },
];

const emptyForm = { name: '', company: '', phone: '', email: '', subject: '', message: '' };

const Contact = () => {
  const { siteContent: sc } = useApp();
  const [form, setForm]       = useState(emptyForm);
  const [sent, setSent]       = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const phone     = sc?.companyPhone    || '(965) 23263824';
  const whatsapp  = sc?.companyWhatsapp || '(965) 96625306';
  const email     = sc?.companyEmail    || 'info@al-jawhara.com';
  const address   = sc?.companyAddress  || 'المنطقة الصناعية — الشعيبة، الكويت';
  const workHours = sc?.workHours       || 'الأحد – الخميس: 8 ص – 5 م';

  const waNum     = whatsapp.replace(/\D/g, '');
  const phoneNum  = phone.replace(/\D/g, '');

  const contactItems = [
    { icon: 'fa-phone',    label: 'الهاتف',            value: phone,     dir: 'ltr', href: `tel:+${phoneNum}` },
    { icon: 'fa-whatsapp fab', label: 'واتساب',        value: whatsapp,  dir: 'ltr', href: `https://wa.me/${waNum}` },
    { icon: 'fa-envelope', label: 'البريد الإلكتروني', value: email,     dir: 'ltr', href: `mailto:${email}` },
    { icon: 'fa-location-dot', label: 'العنوان',       value: address,   dir: 'rtl', href: null },
    { icon: 'fa-clock',    label: 'ساعات العمل',       value: workHours, dir: 'rtl', href: null },
  ];

  const handleChange  = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

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
        title="تواصل معنا"
        description={`تواصل مع شركة الجوهرة للمناديل الورقية — ${phone} — ${address}`}
        keywords="تواصل الجوهرة، هاتف الجوهرة، عنوان الشعيبة، طلب عرض سعر"
      />

      <header className="page-header">
        <div className="container">
          <div className="page-header-content">
            <div className="page-header-icon" aria-hidden="true"><i className="fas fa-envelope"></i></div>
            <h1>تواصل معنا</h1>
            <p>نسعد بسماع استفساراتكم وطلباتكم — فريقنا جاهز لخدمتكم</p>
          </div>
        </div>
      </header>

      <section className="section">
        <div className="container">
          <div className="contact-layout">

            {/* ── Info Panel ── */}
            <div className="contact-info-card">
              <h2>معلومات التواصل</h2>
              <p>يسعدنا التواصل معكم عبر أي من القنوات التالية</p>

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
                <div className="contact-socials-label">تابعونا على</div>
                <div className="contact-social-links">
                  {socialLinks.map((s, i) => (
                    <a key={i} href={s.href} className="contact-social-link" aria-label={s.label}>
                      <i className={`fab ${s.icon}`} aria-hidden="true"></i>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Form ── */}
            <div className="contact-form-card">
              <h2 className="contact-form-title">أرسل رسالة</h2>
              <p className="contact-form-subtitle">سنرد عليك في أقرب وقت ممكن خلال ساعات العمل</p>

              {sent && (
                <div className="alert alert-success" role="alert">
                  <i className="fas fa-circle-check" aria-hidden="true"></i>
                  تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">الاسم الكامل *</label>
                    <input className="form-input" name="name" value={form.name} onChange={handleChange} placeholder="اسمك الكريم" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">اسم الشركة</label>
                    <input className="form-input" name="company" value={form.company} onChange={handleChange} placeholder="اسم شركتك (اختياري)" />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">رقم الهاتف *</label>
                    <input className="form-input" name="phone" value={form.phone} onChange={handleChange} placeholder="+965XXXXXXXX" dir="ltr" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">البريد الإلكتروني</label>
                    <input className="form-input" type="email" name="email" value={form.email} onChange={handleChange} placeholder="email@example.com" dir="ltr" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">موضوع الرسالة *</label>
                  <select className="form-select" name="subject" value={form.subject} onChange={handleChange} required>
                    <option value="">اختر موضوع الرسالة</option>
                    <option value="sales">استفسار عن المنتجات والأسعار</option>
                    <option value="order">طلب شراء</option>
                    <option value="partnership">طلب شراكة</option>
                    <option value="complaint">شكوى أو اقتراح</option>
                    <option value="other">أخرى</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">الرسالة *</label>
                  <textarea className="form-textarea" name="message" value={form.message} onChange={handleChange} placeholder="اكتب رسالتك هنا..." required />
                </div>

                <button type="submit" className="btn btn-green contact-submit-btn" disabled={submitting}>
                  {submitting
                    ? <><i className="fas fa-spinner fa-spin" aria-hidden="true"></i> جارٍ الإرسال...</>
                    : <><i className="fas fa-paper-plane" aria-hidden="true"></i> إرسال الرسالة</>
                  }
                </button>
              </form>
            </div>

          </div>

          <div className="map-placeholder" aria-hidden="true">
            <i className="fas fa-map-location-dot map-placeholder-icon"></i>
            <div className="map-placeholder-title">موقعنا على الخريطة</div>
            <div className="map-placeholder-address">{address}</div>
          </div>

        </div>
      </section>
    </>
  );
};

export default Contact;
