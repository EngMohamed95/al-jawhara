import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const Footer = () => {
  const { siteContent: sc } = useApp();
  const phone    = sc?.companyPhone    || '(965) 23263824';
  const whatsapp = sc?.companyWhatsapp || '(965) 96625306';
  const email    = sc?.companyEmail    || 'info@al-jawhara.com';
  const address  = sc?.companyAddress  || 'المنطقة الصناعية — الشعيبة، الكويت';

  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        <div className="footer-grid">

          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
              <div style={{ width: '42px', height: '42px', background: '#F4A261', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: 'white' }}>
                <i className="fas fa-gem" aria-hidden="true"></i>
              </div>
              <div>
                <div className="footer-brand-name">الجوهرة</div>
                <div className="footer-brand-sub">للمناديل الورقية</div>
              </div>
            </div>
            <p className="footer-desc">
              شركة الجوهرة للمناديل الورقية — رائدة في تصنيع وتوزيع منتجات الورق عالية الجودة في الكويت منذ عام 1998.
            </p>
            <div className="social-links" aria-label="وسائل التواصل الاجتماعي">
              <a href="#" className="social-link" aria-label="Instagram"><i className="fab fa-instagram" aria-hidden="true"></i></a>
              <a href="#" className="social-link" aria-label="X (Twitter)"><i className="fab fa-x-twitter" aria-hidden="true"></i></a>
              <a href="#" className="social-link" aria-label="LinkedIn"><i className="fab fa-linkedin-in" aria-hidden="true"></i></a>
              <a href={`https://wa.me/${whatsapp.replace(/\D/g,'')}`} className="social-link" aria-label="WhatsApp" target="_blank" rel="noreferrer">
                <i className="fab fa-whatsapp" aria-hidden="true"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <nav aria-label="روابط سريعة">
            <h3 className="footer-heading">روابط سريعة</h3>
            <ul className="footer-links">
              <li><Link to="/"><i className="fas fa-chevron-left" aria-hidden="true"></i>الرئيسية</Link></li>
              <li><Link to="/about"><i className="fas fa-chevron-left" aria-hidden="true"></i>من نحن</Link></li>
              <li><Link to="/products"><i className="fas fa-chevron-left" aria-hidden="true"></i>منتجاتنا</Link></li>
              <li><Link to="/clients"><i className="fas fa-chevron-left" aria-hidden="true"></i>عملاؤنا</Link></li>
              <li><Link to="/contact"><i className="fas fa-chevron-left" aria-hidden="true"></i>تواصل معنا</Link></li>
            </ul>
          </nav>

          {/* Products */}
          <nav aria-label="منتجاتنا">
            <h3 className="footer-heading">منتجاتنا</h3>
            <ul className="footer-links">
              <li><Link to="/products"><i className="fas fa-chevron-left" aria-hidden="true"></i>مناديل الوجه</Link></li>
              <li><Link to="/products"><i className="fas fa-chevron-left" aria-hidden="true"></i>رولات المطبخ</Link></li>
              <li><Link to="/products"><i className="fas fa-chevron-left" aria-hidden="true"></i>محارم الجيب</Link></li>
              <li><Link to="/products"><i className="fas fa-chevron-left" aria-hidden="true"></i>مناشف الورق</Link></li>
              <li><Link to="/products"><i className="fas fa-chevron-left" aria-hidden="true"></i>مناديل المائدة</Link></li>
            </ul>
          </nav>

          {/* Contact */}
          <address style={{ fontStyle: 'normal' }}>
            <h3 className="footer-heading">تواصل معنا</h3>
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
          <p>© {new Date().getFullYear()} شركة <span>الجوهرة</span> للمناديل الورقية — جميع الحقوق محفوظة | تأسست <span>18/2/1998</span></p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
