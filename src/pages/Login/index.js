import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { auth, googleProvider, facebookProvider, signInWithPopup, isConfigured } from '../../services/firebase';
import Seo from '../../components/Seo';
import './index.css';

const LOGO_URL = 'https://al-jawhara.co/wp-content/uploads/2021/02/MobileJawharaLogo.png';

const Login = () => {
  const [form, setForm]         = useState({ username: '', password: '' });
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [socialLoading, setSocialLoading] = useState(null); // 'google' | 'facebook'
  const [showPass, setShowPass] = useState(false);
  const { login, socialLogin, auth: authState } = useApp();
  const { t, lang }             = useLanguage();
  const navigate                = useNavigate();

  const destFor = (user) => user?.role === 'customer' ? '/my-account' : '/dashboard';

  useEffect(() => {
    if (authState) navigate(destFor(authState), { replace: true });
  }, [authState, navigate]);

  const handleChange = (e) =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.username, form.password);
      navigate(destFor(user), { replace: true });
    } catch (err) {
      setError(err.message || 'حدث خطأ، حاول مجدداً');
    } finally {
      setLoading(false);
    }
  };

  const handleSocial = async (provider, providerName) => {
    if (!isConfigured) {
      setError(lang === 'ar'
        ? 'تسجيل الدخول الاجتماعي غير مفعّل بعد — تواصل مع المسؤول'
        : 'Social login is not configured yet — contact the admin');
      return;
    }
    setSocialLoading(providerName);
    setError('');
    try {
      const result = await signInWithPopup(auth, provider);
      const fbUser = result.user;
      const user   = await socialLogin({
        name:     fbUser.displayName || fbUser.email || '',
        email:    fbUser.email       || '',
        uid:      fbUser.uid,
        provider: providerName,
      });
      navigate(destFor(user), { replace: true });
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(lang === 'ar' ? 'فشل تسجيل الدخول، حاول مجدداً' : 'Login failed, please try again');
      }
    } finally {
      setSocialLoading(null);
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

          {/* Social Buttons */}
          <div className="social-login-btns">
            <button
              type="button"
              className="social-btn social-btn-google"
              onClick={() => handleSocial(googleProvider, 'google')}
              disabled={!!socialLoading || loading}
            >
              {socialLoading === 'google'
                ? <i className="fas fa-spinner fa-spin"></i>
                : <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
              }
              {lang === 'ar' ? 'الدخول بـ Google' : 'Continue with Google'}
            </button>

            <button
              type="button"
              className="social-btn social-btn-facebook"
              onClick={() => handleSocial(facebookProvider, 'facebook')}
              disabled={!!socialLoading || loading}
            >
              {socialLoading === 'facebook'
                ? <i className="fas fa-spinner fa-spin"></i>
                : <i className="fab fa-facebook-f" aria-hidden="true"></i>
              }
              {lang === 'ar' ? 'الدخول بـ Facebook' : 'Continue with Facebook'}
            </button>
          </div>

          <div className="login-divider">
            <span>{lang === 'ar' ? 'أو بالبريد وكلمة المرور' : 'or with username'}</span>
          </div>

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
                  placeholder="username"
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
              disabled={loading || !!socialLoading}
            >
              {loading
                ? <><i className="fas fa-spinner fa-spin" aria-hidden="true"></i> {t('login.loading')}</>
                : <><i className="fas fa-right-to-bracket" aria-hidden="true"></i> {t('login.submit')}</>
              }
            </button>
          </form>

          {/* Register link */}
          <div className="login-register-row">
            <span>{lang === 'ar' ? 'ليس لديك حساب؟' : "Don't have an account?"}</span>
            <Link to="/register" className="login-register-link">
              {lang === 'ar' ? 'إنشاء حساب جديد' : 'Create Account'}
            </Link>
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
