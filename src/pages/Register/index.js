import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import { auth, googleProvider, signInWithPopup, isConfigured } from '../../services/firebase';
import Seo from '../../components/Seo';
import '../Login/index.css';
import './index.css';

const LOGO_URL = 'https://al-jawhara.co/wp-content/uploads/2021/02/MobileJawharaLogo.png';

const Register = () => {
  const [form, setForm]       = useState({ name: '', username: '', phone: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass]   = useState(false);
  const [showConf, setShowConf]   = useState(false);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [socialLoading, setSocialLoading] = useState(null);

  const { registerCustomer, socialLogin, auth: authState } = useApp();
  const { lang }     = useLanguage();
  const navigate     = useNavigate();

  const destFor = (u) => u?.role === 'customer' ? '/my-account' : '/dashboard';

  useEffect(() => {
    if (authState) navigate(destFor(authState), { replace: true });
  }, [authState, navigate]);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!form.name.trim())     return lang === 'ar' ? 'الرجاء إدخال الاسم'              : 'Please enter your name';
    if (!form.username.trim()) return lang === 'ar' ? 'الرجاء إدخال اسم المستخدم'       : 'Please enter a username';
    if (!/^[a-z0-9_]{3,20}$/i.test(form.username))
      return lang === 'ar' ? 'اسم المستخدم: أحرف وأرقام فقط، 3-20 حرف' : 'Username: 3-20 letters/numbers/underscore';
    if (!form.password)        return lang === 'ar' ? 'الرجاء إدخال كلمة المرور'        : 'Please enter a password';
    if (form.password.length < 6)
      return lang === 'ar' ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters';
    if (form.password !== form.confirm)
      return lang === 'ar' ? 'كلمتا المرور غير متطابقتين'                 : 'Passwords do not match';
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return lang === 'ar' ? 'البريد الإلكتروني غير صحيح'                 : 'Invalid email address';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setLoading(true);
    try {
      const user = await registerCustomer({
        name:     form.name.trim(),
        username: form.username.trim().toLowerCase(),
        password: form.password,
        phone:    form.phone.trim(),
        email:    form.email.trim(),
      });
      navigate(destFor(user), { replace: true });
    } catch (err) {
      setError(err.message || (lang === 'ar' ? 'حدث خطأ، حاول مجدداً' : 'An error occurred, please try again'));
    } finally {
      setLoading(false);
    }
  };

  const handleSocial = async (provider, providerName) => {
    if (!isConfigured) {
      setError(lang === 'ar'
        ? 'تسجيل الدخول الاجتماعي غير مفعّل بعد'
        : 'Social login is not configured yet');
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
        setError(lang === 'ar' ? 'فشل التسجيل، حاول مجدداً' : 'Registration failed, please try again');
      }
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <>
      <Seo title={lang === 'ar' ? 'إنشاء حساب جديد' : 'Create Account'} noIndex />
      <div className="login-page">
        <div className="login-card reg-card">

          {/* Logo */}
          <div className="login-logo">
            <img src={LOGO_URL} alt="الجوهرة" className="login-logo-img" />
            <div>
              <div className="login-logo-name">الجوهرة</div>
              <div className="login-logo-sub">Al-Jawhara</div>
            </div>
          </div>

          <h1 className="login-title">{lang === 'ar' ? 'إنشاء حساب جديد' : 'Create Account'}</h1>
          <p className="login-subtitle">{lang === 'ar' ? 'انضم إلينا وتابع طلباتك بسهولة' : 'Join us and track your orders easily'}</p>

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
              {lang === 'ar' ? 'التسجيل بـ Google' : 'Sign up with Google'}
            </button>

          </div>

          <div className="login-divider">
            <span>{lang === 'ar' ? 'أو أنشئ حساباً يدوياً' : 'or create manually'}</span>
          </div>

          {error && (
            <div className="alert alert-error" role="alert">
              <i className="fas fa-triangle-exclamation" style={{ marginLeft: '8px', marginRight: '8px' }}></i>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="reg-form">

            <div className="reg-row">
              <div className="form-group">
                <label className="form-label">{lang === 'ar' ? 'الاسم الكامل' : 'Full Name'} <span style={{color:'#dc2626'}}>*</span></label>
                <div className="input-icon-wrap">
                  <i className="fas fa-user input-icon"></i>
                  <input className="form-input input-padded" name="name" value={form.name}
                    onChange={handleChange} placeholder={lang === 'ar' ? 'محمد أحمد' : 'John Doe'} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">{lang === 'ar' ? 'اسم المستخدم' : 'Username'} <span style={{color:'#dc2626'}}>*</span></label>
                <div className="input-icon-wrap">
                  <i className="fas fa-at input-icon"></i>
                  <input className="form-input input-padded" name="username" value={form.username}
                    onChange={handleChange} placeholder="username" required dir="ltr" autoComplete="username" />
                </div>
              </div>
            </div>

            <div className="reg-row">
              <div className="form-group">
                <label className="form-label">{lang === 'ar' ? 'رقم الهاتف' : 'Phone'}</label>
                <div className="input-icon-wrap">
                  <i className="fas fa-phone input-icon"></i>
                  <input className="form-input input-padded" name="phone" value={form.phone}
                    onChange={handleChange} placeholder="XXXXXXXX" dir="ltr" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">{lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}</label>
                <div className="input-icon-wrap">
                  <i className="fas fa-envelope input-icon"></i>
                  <input className="form-input input-padded" type="email" name="email" value={form.email}
                    onChange={handleChange} placeholder="email@example.com" dir="ltr" />
                </div>
              </div>
            </div>

            <div className="reg-row">
              <div className="form-group">
                <label className="form-label">{lang === 'ar' ? 'كلمة المرور' : 'Password'} <span style={{color:'#dc2626'}}>*</span></label>
                <div className="input-icon-wrap">
                  <i className="fas fa-lock input-icon"></i>
                  <input className="form-input input-padded input-padded-left"
                    type={showPass ? 'text' : 'password'} name="password" value={form.password}
                    onChange={handleChange} placeholder="••••••••" required dir="ltr" autoComplete="new-password" />
                  <button type="button" className="toggle-pass" onClick={() => setShowPass(v => !v)}>
                    <i className={`fas fa-eye${showPass ? '-slash' : ''}`}></i>
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">{lang === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'} <span style={{color:'#dc2626'}}>*</span></label>
                <div className="input-icon-wrap">
                  <i className="fas fa-lock input-icon"></i>
                  <input className="form-input input-padded input-padded-left"
                    type={showConf ? 'text' : 'password'} name="confirm" value={form.confirm}
                    onChange={handleChange} placeholder="••••••••" required dir="ltr" autoComplete="new-password" />
                  <button type="button" className="toggle-pass" onClick={() => setShowConf(v => !v)}>
                    <i className={`fas fa-eye${showConf ? '-slash' : ''}`}></i>
                  </button>
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-green login-btn" disabled={loading || !!socialLoading}>
              {loading
                ? <><i className="fas fa-spinner fa-spin"></i> {lang === 'ar' ? 'جاري إنشاء الحساب...' : 'Creating account...'}</>
                : <><i className="fas fa-user-plus"></i> {lang === 'ar' ? 'إنشاء الحساب' : 'Create Account'}</>
              }
            </button>
          </form>

          <div className="login-register-row">
            <span>{lang === 'ar' ? 'لديك حساب بالفعل؟' : 'Already have an account?'}</span>
            <Link to="/login" className="login-register-link">
              {lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
            </Link>
          </div>

          <Link to="/" className="login-back">
            <i className="fas fa-arrow-right"></i>
            {lang === 'ar' ? 'العودة للموقع' : 'Back to site'}
          </Link>
        </div>
      </div>
    </>
  );
};

export default Register;
