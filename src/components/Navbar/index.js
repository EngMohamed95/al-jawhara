import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import './index.css';

const LOGO_URL = 'https://al-jawhara.co/wp-content/uploads/2021/02/MobileJawharaLogo.png';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location  = useLocation();
  const navigate  = useNavigate();
  const { auth, logout, cartTotalQty } = useApp();
  const { lang, setLang, t } = useLanguage();

  const navLinks = [
    { path: '/',         label: t('nav.home'),     icon: 'fa-house' },
    { path: '/about',    label: t('nav.about'),    icon: 'fa-circle-info' },
    { path: '/products', label: t('nav.products'), icon: 'fa-box' },
    { path: '/clients',  label: t('nav.clients'),  icon: 'fa-handshake' },
    { path: '/contact',  label: t('nav.contact'),  icon: 'fa-envelope' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const isActive = (p) => location.pathname === p;

  return (
    <nav className="navbar" role="navigation" aria-label="القائمة الرئيسية">
      <div className="navbar-inner">

        {/* Logo */}
        <Link to="/" className="nav-logo" aria-label="الجوهرة — الصفحة الرئيسية">
          <img src={LOGO_URL} alt="الجوهرة" className="nav-logo-img" />
        </Link>

        {/* Desktop links */}
        <div className="nav-links" role="menubar">
          {navLinks.map(l => (
            <Link
              key={l.path}
              to={l.path}
              role="menuitem"
              className={`nav-link${isActive(l.path) ? ' active' : ''}`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right controls */}
        <div className="nav-controls">

          {/* Language toggle */}
          <button
            className="nav-lang-btn"
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            aria-label="تغيير اللغة"
          >
            {lang === 'ar' ? 'EN' : 'عر'}
          </button>

          {/* Cart */}
          <Link to="/cart" className="nav-cart-btn" aria-label="عربة التسوق">
            <i className="fas fa-cart-shopping" aria-hidden="true"></i>
            {cartTotalQty > 0 && <span className="nav-cart-count">{cartTotalQty}</span>}
          </Link>

          {/* Auth */}
          <div className="nav-auth">
            {auth ? (
              <div className="nav-user-group">
                <span className="nav-user-name">
                  <i className="fas fa-user-circle" aria-hidden="true"></i>
                  {auth.name.split(' ')[0]}
                </span>
                <Link to="/dashboard" className={`nav-link nav-dash-link${isActive('/dashboard') ? ' active' : ''}`}>
                  <i className="fas fa-chart-pie" aria-hidden="true"></i>
                  {t('nav.dashboard')}
                </Link>
                <button className="nav-logout-btn" onClick={handleLogout} aria-label="تسجيل خروج">
                  <i className="fas fa-right-from-bracket" aria-hidden="true"></i>
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <Link to="/login" className="nav-login-btn">
                <i className="fas fa-right-to-bracket" aria-hidden="true"></i>
                {t('nav.login')}
              </Link>
            )}
          </div>
        </div>

        {/* Hamburger */}
        <button
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-label="فتح القائمة"
        >
          <i className={`fas fa-${menuOpen ? 'xmark' : 'bars'}`} aria-hidden="true"></i>
        </button>
      </div>

      {/* Overlay */}
      {menuOpen && (
        <div className="mobile-nav-overlay" onClick={() => setMenuOpen(false)} aria-hidden="true" />
      )}

      {/* Mobile drawer */}
      <div className={`mobile-nav${menuOpen ? ' open' : ''}`} role="menu" aria-hidden={!menuOpen}>
        <div className="mobile-nav-header">
          <img src={LOGO_URL} alt="الجوهرة" style={{ height: '30px', filter: 'brightness(0) invert(1)' }} />
          <button className="mobile-nav-close" onClick={() => setMenuOpen(false)} aria-label="إغلاق القائمة">
            <i className="fas fa-xmark"></i>
          </button>
        </div>

        <div className="mobile-nav-body">
          {navLinks.map(l => (
            <Link
              key={l.path}
              to={l.path}
              role="menuitem"
              className={`mobile-nav-link${isActive(l.path) ? ' active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              <i className={`fas ${l.icon}`} aria-hidden="true"></i>
              {l.label}
            </Link>
          ))}

          {/* Mobile cart link */}
          <Link to="/cart" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
            <i className="fas fa-cart-shopping" aria-hidden="true"></i>
            {t('nav.cart')}
            {cartTotalQty > 0 && <span className="mobile-cart-badge">{cartTotalQty}</span>}
          </Link>

          <div className="mobile-nav-divider" />

          {/* Mobile lang toggle */}
          <div className="mobile-toggles">
            <button className="mobile-toggle-btn" onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}>
              <i className="fas fa-language"></i>
              {lang === 'ar' ? 'English' : 'العربية'}
            </button>
          </div>

          {auth ? (
            <>
              <Link
                to="/dashboard"
                className={`mobile-nav-link${isActive('/dashboard') ? ' active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                <i className="fas fa-chart-pie" aria-hidden="true"></i>
                {t('nav.dashboard')}
              </Link>
              <button className="mobile-logout-btn" onClick={handleLogout}>
                <i className="fas fa-right-from-bracket" aria-hidden="true"></i>
                {t('nav.logout')}
              </button>
            </>
          ) : (
            <Link to="/login" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
              <i className="fas fa-right-to-bracket" aria-hidden="true"></i>
              {t('nav.login')}
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
