import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import './index.css';

const navLinks = [
  { path: '/',         label: 'الرئيسية',   icon: 'fa-house' },
  { path: '/about',    label: 'من نحن',      icon: 'fa-circle-info' },
  { path: '/products', label: 'المنتجات',    icon: 'fa-box' },
  { path: '/clients',  label: 'عملاؤنا',     icon: 'fa-handshake' },
  { path: '/contact',  label: 'تواصل معنا',  icon: 'fa-envelope' },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate  = useNavigate();
  const { auth, logout } = useApp();

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
          <div className="nav-logo-icon" aria-hidden="true">
            <i className="fas fa-gem"></i>
          </div>
          <div className="nav-logo-text">
            <span className="nav-logo-name">الجوهرة</span>
            <span className="nav-logo-sub">للمناديل الورقية</span>
          </div>
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

        {/* Auth section */}
        <div className="nav-auth">
          {auth ? (
            <div className="nav-user-group">
              <span className="nav-user-name">
                <i className="fas fa-user-circle" aria-hidden="true"></i>
                {auth.name.split(' ')[0]}
              </span>
              <Link to="/dashboard" className={`nav-link nav-dash-link${isActive('/dashboard') ? ' active' : ''}`}>
                <i className="fas fa-chart-pie" aria-hidden="true"></i>
                لوحة التحكم
              </Link>
              <button className="nav-logout-btn" onClick={handleLogout} aria-label="تسجيل خروج">
                <i className="fas fa-right-from-bracket" aria-hidden="true"></i>
                خروج
              </button>
            </div>
          ) : (
            <Link to="/login" className="nav-login-btn">
              <i className="fas fa-right-to-bracket" aria-hidden="true"></i>
              دخول
            </Link>
          )}
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

      {/* Mobile nav */}
      {menuOpen && (
        <div className="mobile-nav" role="menu">
          {navLinks.map(l => (
            <Link
              key={l.path}
              to={l.path}
              role="menuitem"
              className={`mobile-nav-link${isActive(l.path) ? ' active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              <i className={`fas ${l.icon}`} aria-hidden="true" style={{ marginLeft: '10px' }}></i>
              {l.label}
            </Link>
          ))}
          {auth ? (
            <>
              <Link
                to="/dashboard"
                className={`mobile-nav-link${isActive('/dashboard') ? ' active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                <i className="fas fa-chart-pie" aria-hidden="true" style={{ marginLeft: '10px' }}></i>
                لوحة التحكم
              </Link>
              <button className="mobile-logout-btn" onClick={handleLogout}>
                <i className="fas fa-right-from-bracket" aria-hidden="true" style={{ marginLeft: '10px' }}></i>
                تسجيل خروج
              </button>
            </>
          ) : (
            <Link to="/login" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
              <i className="fas fa-right-to-bracket" aria-hidden="true" style={{ marginLeft: '10px' }}></i>
              تسجيل دخول
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
