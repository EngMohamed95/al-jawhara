import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';

const DEFAULT_LOGO_URL = '/logo.png';

const Footer = () => {
  const { siteContent: sc } = useApp();
  const { t, lang } = useLanguage();
  const [logoFailed, setLogoFailed] = useState(false);

  const LOGO_URL = sc?.siteLogoUrl || DEFAULT_LOGO_URL;
  const phone    = sc?.companyPhone    || '(965) 23263824';
  const whatsapp = sc?.companyWhatsapp || '(965) 96625306';
  const email    = sc?.companyEmail    || 'info@al-jawhara.com';
  const address  = lang === 'ar'
    ? (sc?.companyAddress   || 'المنطقة الصناعية — الشعيبة، الكويت')
    : (sc?.companyAddressEn || 'Industrial Area — Shuaiba, Kuwait');
  const footerTagline   = lang === 'ar' ? (sc?.footerTagline || t('footer.desc')) : (sc?.footerTaglineEn || t('footer.desc'));
  const footerCopyright = lang === 'ar' ? sc?.footerCopyright : sc?.footerCopyrightEn;

  const chevron = lang === 'ar' ? 'fa-chevron-left' : 'fa-chevron-right';

  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        <div className="footer-grid">

          {/* Brand */}
          <div>
            <div style={{ marginBottom: '15px' }}>
              {!logoFailed ? (
                <img src={LOGO_URL} alt="الجوهرة" style={{ height: '90px', width: 'auto', filter: 'brightness(0) invert(1)' }} onError={() => setLogoFailed(true)} />
              ) : (
                <span style={{ fontWeight: '800', fontSize: '24px', color: '#fff', fontFamily: 'Tajawal, sans-serif' }}>الجوهرة</span>
              )}
            </div>
            <p className="footer-desc" dir={lang === 'ar' ? 'rtl' : 'ltr'}>{footerTagline}</p>
            <div className="social-links" aria-label="وسائل التواصل الاجتماعي">
              <a href="https://instagram.com" className="social-link" aria-label="Instagram" target="_blank" rel="noreferrer"><i className="fab fa-instagram" aria-hidden="true"></i></a>
              <a href="https://x.com" className="social-link" aria-label="X (Twitter)" target="_blank" rel="noreferrer"><i className="fab fa-x-twitter" aria-hidden="true"></i></a>
              <a href="https://linkedin.com" className="social-link" aria-label="LinkedIn" target="_blank" rel="noreferrer"><i className="fab fa-linkedin-in" aria-hidden="true"></i></a>
              <a href={`https://wa.me/${whatsapp.replace(/\D/g,'')}`} className="social-link" aria-label="WhatsApp" target="_blank" rel="noreferrer">
                <i className="fab fa-whatsapp" aria-hidden="true"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <nav aria-label={t('footer.links')}>
            <h3 className="footer-heading">{t('footer.links')}</h3>
            <ul className="footer-links">
              <li><Link to="/"><i className={`fas ${chevron}`} aria-hidden="true"></i>{t('nav.home')}</Link></li>
              <li><Link to="/about"><i className={`fas ${chevron}`} aria-hidden="true"></i>{t('nav.about')}</Link></li>
              <li><Link to="/products"><i className={`fas ${chevron}`} aria-hidden="true"></i>{t('nav.products')}</Link></li>
              <li><Link to="/clients"><i className={`fas ${chevron}`} aria-hidden="true"></i>{t('nav.clients')}</Link></li>
              <li><Link to="/contact"><i className={`fas ${chevron}`} aria-hidden="true"></i>{t('nav.contact')}</Link></li>
            </ul>
          </nav>

          {/* Products */}
          <nav aria-label={t('footer.ourProds')}>
            <h3 className="footer-heading">{t('footer.ourProds')}</h3>
            <ul className="footer-links">
              {['facial','rolls'].map(k => (
                <li key={k}><Link to="/products"><i className={`fas ${chevron}`} aria-hidden="true"></i>{t(`products.cats.${k}`)}</Link></li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <address style={{ fontStyle: 'normal' }}>
            <h3 className="footer-heading">{t('footer.reach')}</h3>
            <div className="footer-contact-item">
              <i className="fas fa-phone footer-contact-icon" aria-hidden="true"></i>
              <a href={`tel:${phone.replace(/\D/g,'')}`} className="footer-contact-text" dir="ltr" style={{ color: 'inherit', textDecoration: 'none' }}>{phone}</a>
            </div>
            <div className="footer-contact-item">
              <i className="fab fa-whatsapp footer-contact-icon" aria-hidden="true"></i>
              <span className="footer-contact-text" dir="ltr">{whatsapp}</span>
            </div>
            <div className="footer-contact-item">
              <i className="fas fa-envelope footer-contact-icon" aria-hidden="true"></i>
              <a href={`mailto:${email}`} className="footer-contact-text" style={{ color: 'inherit', textDecoration: 'none' }}>{email}</a>
            </div>
            <div className="footer-contact-item">
              <i className="fas fa-location-dot footer-contact-icon" aria-hidden="true"></i>
              <span className="footer-contact-text">{address}</span>
            </div>
          </address>

        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            {footerCopyright || (<>© {new Date().getFullYear()} <span>{t('nav.brand')}</span> {t('nav.brandSub')} — {t('footer.rights')} | {t('footer.founded')} <span>18/2/1998</span></>)}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
