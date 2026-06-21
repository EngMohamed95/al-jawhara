import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import Seo from '../../components/Seo';
import '../Login/index.css';
import './index.css';

const LOGO_URL = '/logo.png';

const Register = () => {
  const [form, setForm]       = useState({ name: '', username: '', phone: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass]   = useState(false);
  const [showConf, setShowConf]   = useState(false);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  const { registerCustomer, auth: authState } = useApp();
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

  return (
    <>
      <Seo title={lang === 'ar' ? 'إنشاء حساب جديد' : 'Create Account'} noIndex />
      <div className="login-page">
        <div className="login-card reg-card">

          {/* Logo */}
          <div className="login-logo">
            {!logoFailed ? (
              <img src={LOGO_URL} alt="الجوهرة" className="login-logo-img" onError={() => setLogoFailed(true)} />
            ) : (
              <span className="login-logo-fallback-text" style={{ fontWeight: '800', fontSize: '28px', color: '#0B6E4F', fontFamily: 'Tajawal, sans-serif', marginInlineEnd: '15px' }}>الجوهرة</span>
            )}
          </div>

          <h1 className="login-title">{lang === 'ar' ? 'إنشاء حساب جديد' : 'Create Account'}</h1>
          <p className="login-subtitle">{lang === 'ar' ? 'انضم إلينا وتابع طلباتك بسهولة' : 'Join us and track your orders easily'}</p>

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

            <button type="submit" className="btn btn-green login-btn" disabled={loading}>
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
