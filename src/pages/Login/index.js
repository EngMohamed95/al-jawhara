import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import Seo from '../../components/Seo';
import './index.css';

const LOGO_URL = 'https://al-jawhara.co/wp-content/uploads/2021/02/MobileJawharaLogo.png';

const Login = () => {
  const [form, setForm]       = useState({ username: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login, auth }       = useApp();
  const { t }                 = useLanguage();
  const navigate              = useNavigate();

  useEffect(() => {
    if (auth) navigate('/dashboard', { replace: true });
  }, [auth, navigate]);

  const handleChange = (e) =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.username, form.password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'حدث خطأ، حاول مجدداً');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Seo title={t('login.title')} noIndex />
      <div className="login-page">
        <div className="login-card">

          {/* Logo */}
          <div className="login-logo">
            <img src={LOGO_URL} alt="الجوهرة" className="login-logo-img" />
            <div>
              <div className="login-logo-name">{t('nav.brand')}</div>
              <div className="login-logo-sub">{t('nav.brandSub')}</div>
            </div>
          </div>

          <h1 className="login-title">{t('login.title')}</h1>
          <p className="login-subtitle">{t('login.sub')}</p>

          {error && (
            <div className="alert alert-error" role="alert">
              <i className="fas fa-triangle-exclamation" aria-hidden="true" style={{ marginLeft: '8px', marginRight: '8px' }}></i>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="username">{t('login.username')}</label>
              <div className="input-icon-wrap">
                <i className="fas fa-user input-icon" aria-hidden="true"></i>
                <input
                  id="username"
                  className="form-input input-padded"
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="admin"
                  required
                  autoComplete="username"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">{t('login.password')}</label>
              <div className="input-icon-wrap">
                <i className="fas fa-lock input-icon" aria-hidden="true"></i>
                <input
                  id="password"
                  className="form-input input-padded input-padded-left"
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  dir="ltr"
                />
                <button
                  type="button"
                  className="toggle-pass"
                  onClick={() => setShowPass(!showPass)}
                  aria-label={showPass ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  <i className={`fas fa-eye${showPass ? '-slash' : ''}`} aria-hidden="true"></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-green login-btn"
              disabled={loading}
            >
              {loading
                ? <><i className="fas fa-spinner fa-spin" aria-hidden="true"></i> {t('login.loading')}</>
                : <><i className="fas fa-right-to-bracket" aria-hidden="true"></i> {t('login.submit')}</>
              }
            </button>
          </form>

          <div className="login-hint">
            <i className="fas fa-circle-info" aria-hidden="true"></i>
            <span>{t('login.hint')} <code>admin</code> / <code>admin123</code></span>
          </div>

          <Link to="/" className="login-back">
            <i className="fas fa-arrow-right" aria-hidden="true"></i>
            {t('login.backSite')}
          </Link>
        </div>
      </div>
    </>
  );
};

export default Login;
