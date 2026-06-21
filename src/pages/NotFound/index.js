import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import Seo from '../../components/Seo';
import './index.css';

const NotFound = () => {
  const { lang } = useLanguage();
  const ar = lang === 'ar';

  return (
    <>
      <Seo title={ar ? '404 — الصفحة غير موجودة' : '404 — Page Not Found'} noIndex />
      <section className="notfound-section">
        <div className="notfound-container">
          <div className="notfound-code">404</div>
          <div className="notfound-icon" aria-hidden="true">
            <i className="fas fa-map-location-dot"></i>
          </div>
          <h1 className="notfound-title">
            {ar ? 'عذراً، الصفحة غير موجودة' : 'Page Not Found'}
          </h1>
          <p className="notfound-desc">
            {ar
              ? 'يبدو أن الصفحة التي تبحث عنها قد نُقلت أو حُذفت أو لم تكن موجودة أصلاً.'
              : 'The page you are looking for might have been moved, deleted, or never existed.'}
          </p>
          <div className="notfound-actions">
            <Link to="/" className="btn btn-green">
              <i className="fas fa-house"></i>
              {ar ? 'الصفحة الرئيسية' : 'Go Home'}
            </Link>
            <Link to="/products" className="btn btn-outline-green">
              <i className="fas fa-box"></i>
              {ar ? 'تصفح المنتجات' : 'Browse Products'}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default NotFound;
