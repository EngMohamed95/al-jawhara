import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import translations from '../../translations';
import Seo from '../../components/Seo';
import './index.css';

const emptyForm = {
  client: '', company: '', phone: '', email: '',
  governorate: '', block: '', street: '', avenue: '',
  building: '', floor: '', apartment: '', notes: '',
  payment: 'cash',
};

/* ── Kuwait payment wallets ── */
const WALLETS = [
  { val: 'cash',       icon: 'fa-money-bills',     color: '#16a34a', label: 'checkout.cash',       badge: null },
  { val: 'transfer',   icon: 'fa-building-columns', color: '#1d4ed8', label: 'checkout.transfer',   badge: null },
  { val: 'knet',       icon: 'fa-credit-card',      color: '#003087', label: 'checkout.knet',       badge: 'KNET',        badgeColor: '#003087' },
  { val: 'myfatoorah', icon: 'fa-wallet',           color: '#e67e22', label: 'checkout.myfatoorah', badge: 'MyFatoorah',  badgeColor: '#e67e22' },
  { val: 'tap',        icon: 'fa-mobile-screen',    color: '#000',    label: 'checkout.tap',        badge: 'tap',         badgeColor: '#000' },
  { val: 'benefitpay', icon: 'fa-mobile-screen',    color: '#00843d', label: 'checkout.benefitpay', badge: 'Benefit',     badgeColor: '#00843d' },
];

const Checkout = () => {
  const { cart, cartTotal, submitOrder, auth, updateUser, users } = useApp();
  const { t, lang } = useLanguage();
  const navigate  = useNavigate();

  const [form,    setForm]    = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  /* Pre-fill from logged-in account — runs once on mount */
  useEffect(() => {
    if (!auth) return;
    setForm(prev => ({
      ...prev,
      client:      prev.client      || auth.name             || '',
      phone:       prev.phone       || auth.phone            || '',
      email:       prev.email       || auth.email            || '',
      governorate: prev.governorate || auth.lastGovernorate  || '',
      block:       prev.block       || auth.lastBlock        || '',
      street:      prev.street      || auth.lastStreet       || '',
      avenue:      prev.avenue      || auth.lastAvenue       || '',
      building:    prev.building    || auth.lastBuilding     || '',
      floor:       prev.floor       || auth.lastFloor        || '',
      apartment:   prev.apartment   || auth.lastApartment    || '',
    }));
  }, [auth]);

  const zones = translations.kuwaitZones;
  const selectedZone = zones.find(z => z.id === form.governorate);
  const deliveryFee  = selectedZone ? selectedZone.fee : 0;
  const grandTotal   = cartTotal + deliveryFee;

  if (cart.length === 0) {
    return (
      <>
        <Seo title={t('checkout.title')} noIndex />
        <section className="section">
          <div className="container">
            <div className="cart-empty-page">
              <i className="fas fa-cart-shopping cart-empty-page-icon" aria-hidden="true"></i>
              <h2>{t('cart.empty')}</h2>
              <Link to="/products" className="btn btn-green">{t('cart.browse')}</Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.client.trim())     { setError(lang === 'ar' ? 'الرجاء إدخال الاسم الكامل' : 'Please enter your full name'); return; }
    if (!form.phone.trim())      { setError(lang === 'ar' ? 'الرجاء إدخال رقم الهاتف' : 'Please enter your phone number'); return; }
    { const digits = form.phone.replace(/\D/g, '').replace(/^965/, '');
      if (digits.length < 5 || digits.length > 8) { setError(lang === 'ar' ? 'رقم الهاتف يجب أن يكون من 5 إلى 8 أرقام' : 'Phone number must be 5–8 digits'); return; }
    }
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError(lang === 'ar' ? 'البريد الإلكتروني غير صحيح' : 'Invalid email address'); return; }
    if (!form.governorate)       { setError(lang === 'ar' ? 'الرجاء اختيار المحافظة' : 'Please select a governorate'); return; }
    if (!form.block.trim())      { setError(lang === 'ar' ? 'الرجاء إدخال القطعة' : 'Please enter your block'); return; }
    if (!form.street.trim())     { setError(lang === 'ar' ? 'الرجاء إدخال الشارع' : 'Please enter your street'); return; }
    setError('');
    setLoading(true);
    try {
      const order = await submitOrder({
        client:       form.client,
        company:      form.company,
        phone:        form.phone,
        email:        form.email,
        governorate:  selectedZone ? (lang === 'ar' ? selectedZone.ar : selectedZone.en) : '',
        block:        form.block,
        address:      [
          form.street   ? `ش ${form.street}`   : '',
          form.avenue   ? `ج ${form.avenue}`   : '',
          form.building ? `م/ع ${form.building}` : '',
          form.floor    ? `د ${form.floor}`    : '',
          form.apartment? `ش ${form.apartment}` : '',
        ].filter(Boolean).join('، '),
        notes:        form.notes,
        payment:      form.payment,
        deliveryFee:  deliveryFee.toFixed(3),
        product:      cart.map(i => i.name).join('، '),
        qty:          cart.reduce((s, i) => s + i.qty, 0),
        grandTotal:   grandTotal.toFixed(3),
      });
      /* save address back to customer profile for next time */
      if (auth?.role === 'customer') {
        try {
          const fullUser = users.find(u => u.id === auth.id);
          if (fullUser) {
            const updated = await updateUser(auth.id, {
              ...fullUser,
              name:  form.client || fullUser.name,
              phone: form.phone  || fullUser.phone,
              email: form.email  || fullUser.email,
              lastGovernorate: form.governorate,
              lastBlock:       form.block,
              lastStreet:      form.street,
              lastAvenue:      form.avenue,
              lastBuilding:    form.building,
              lastFloor:       form.floor,
              lastApartment:   form.apartment,
            });
            const { password: _, ...safe } = updated;
            localStorage.setItem('jawhara_auth', JSON.stringify(safe));
          }
        } catch {}
      }
      navigate('/order-success', { state: { order } });
    } catch {
      setError(t('products.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Seo title={t('checkout.title')} noIndex />

      <header className="page-header">
        <div className="container">
          <div className="page-header-content">
            <div className="page-header-icon" aria-hidden="true"><i className="fas fa-credit-card"></i></div>
            <h1>{t('checkout.title')}</h1>
            <p>{t('checkout.sub')}</p>
          </div>
        </div>
      </header>

      <section className="section">
        <div className="container">

          {/* Steps */}
          <div className="checkout-steps">
            <div className="checkout-step done">
              <div className="step-circle"><i className="fas fa-check" aria-hidden="true"></i></div>
              <span>{t('checkout.stepCart')}</span>
            </div>
            <div className="checkout-step-line done"></div>
            <div className="checkout-step active">
              <div className="step-circle">2</div>
              <span>{t('checkout.stepDetails')}</span>
            </div>
            <div className="checkout-step-line"></div>
            <div className="checkout-step">
              <div className="step-circle">3</div>
              <span>{t('checkout.stepConfirm')}</span>
            </div>
          </div>

          <div className="checkout-layout">

            {/* ── Form ── */}
            <div className="checkout-form-panel">

              {/* Customer Info */}
              <h2 className="checkout-section-title">
                <i className="fas fa-user" aria-hidden="true"></i>
                {t('checkout.clientInfo')}
              </h2>

              {error && (
                <div className="alert alert-error" role="alert">
                  <i className="fas fa-triangle-exclamation" aria-hidden="true"></i> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">{t('checkout.name')} <span style={{color:'#dc2626'}}>*</span></label>
                    <input className="form-input" name="client" value={form.client} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('checkout.company')}</label>
                    <input className="form-input" name="company" value={form.company} onChange={handleChange} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">{t('checkout.phone')} <span style={{color:'#dc2626'}}>*</span></label>
                    <input className="form-input" name="phone" value={form.phone} onChange={handleChange} placeholder="+965XXXXXXXX" dir="ltr" maxLength={12} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('checkout.email')}</label>
                    <input className="form-input" type="email" name="email" value={form.email} onChange={handleChange} placeholder="email@example.com" dir="ltr" />
                  </div>
                </div>

                {/* Delivery Zone */}
                <h2 className="checkout-section-title" style={{ marginTop: '28px' }}>
                  <i className="fas fa-map-location-dot" aria-hidden="true"></i>
                  {t('checkout.delivery')}
                </h2>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">{t('checkout.governorate')} <span style={{color:'#dc2626'}}>*</span></label>
                    <select className="form-select" name="governorate" value={form.governorate} onChange={handleChange} required>
                      <option value="">{t('checkout.selectGov')}</option>
                      {zones.map(z => (
                        <option key={z.id} value={z.id}>
                          {lang === 'ar' ? z.ar : z.en} — {z.fee.toFixed(3)} {t('products.currency')}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">{lang === 'ar' ? 'القطعة' : 'Block'} <span style={{color:'#dc2626'}}>*</span></label>
                    <input className="form-input" name="block" value={form.block} onChange={handleChange} placeholder={lang === 'ar' ? 'مثال: 5' : 'e.g. 5'} />
                  </div>
                </div>

                <div className="checkout-addr-grid">
                  <div className="form-group">
                    <label className="form-label">{lang === 'ar' ? 'الشارع' : 'Street'} <span style={{color:'#dc2626'}}>*</span></label>
                    <input className="form-input" name="street" value={form.street} onChange={handleChange} placeholder={lang === 'ar' ? 'مثال: 12' : 'e.g. 12'} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{lang === 'ar' ? 'الجادة' : 'Avenue'}</label>
                    <input className="form-input" name="avenue" value={form.avenue} onChange={handleChange} placeholder={lang === 'ar' ? 'مثال: 3' : 'e.g. 3'} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{lang === 'ar' ? 'قسيمة / عمارة' : 'Plot / Building'}</label>
                    <input className="form-input" name="building" value={form.building} onChange={handleChange} placeholder={lang === 'ar' ? 'مثال: 7أ' : 'e.g. 7A'} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{lang === 'ar' ? 'الدور' : 'Floor'}</label>
                    <input className="form-input" name="floor" value={form.floor} onChange={handleChange} placeholder={lang === 'ar' ? 'مثال: 2' : 'e.g. 2'} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{lang === 'ar' ? 'رقم الشقة' : 'Apt. No.'}</label>
                    <input className="form-input" name="apartment" value={form.apartment} onChange={handleChange} placeholder={lang === 'ar' ? 'مثال: 4' : 'e.g. 4'} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">{t('checkout.notes')}</label>
                  <textarea className="form-textarea" name="notes" value={form.notes} onChange={handleChange} style={{ minHeight: '80px' }} />
                </div>

                {/* Payment */}
                <h2 className="checkout-section-title" style={{ marginTop: '28px' }}>
                  <i className="fas fa-wallet" aria-hidden="true"></i>
                  {t('checkout.payment')}
                </h2>

                <div className="payment-wallets-grid">
                  {WALLETS.map(opt => (
                    <label
                      key={opt.val}
                      className={`payment-wallet-card${form.payment === opt.val ? ' selected' : ''}`}
                    >
                      <input
                        type="radio" name="payment" value={opt.val}
                        checked={form.payment === opt.val}
                        onChange={handleChange}
                      />
                      <div className="wallet-icon-wrap" style={{ background: opt.color + '15', borderColor: form.payment === opt.val ? opt.color : 'transparent' }}>
                        <i className={`fas ${opt.icon}`} style={{ color: opt.color }} aria-hidden="true"></i>
                      </div>
                      <span className="wallet-label">{t(opt.label)}</span>
                      {opt.badge && (
                        <span className="wallet-badge" style={{ background: opt.badgeColor }}>
                          {opt.badge}
                        </span>
                      )}
                    </label>
                  ))}
                </div>

                <button type="submit" className="btn btn-green checkout-submit-btn" disabled={loading}>
                  {loading
                    ? <><i className="fas fa-spinner fa-spin" aria-hidden="true"></i> {t('checkout.sending')}</>
                    : <><i className="fas fa-paper-plane" aria-hidden="true"></i> {t('checkout.confirm')}</>
                  }
                </button>
              </form>
            </div>

            {/* ── Order Summary ── */}
            <div className="checkout-summary-panel">
              <h2 className="checkout-section-title">
                <i className="fas fa-receipt" aria-hidden="true"></i>
                {t('checkout.yourOrder')}
              </h2>

              <div className="checkout-items">
                {cart.map(item => (
                  <div key={item.id} className="checkout-item">
                    <span className="checkout-item-icon" aria-hidden="true">{item.icon}</span>
                    <div className="checkout-item-info">
                      <div className="checkout-item-name">{item.name}</div>
                      <div className="checkout-item-meta">× {item.qty}</div>
                    </div>
                    <div className="checkout-item-price">
                      {(item.price * item.qty).toFixed(3)} {t('products.currency')}
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="checkout-totals">
                <div className="checkout-total-row">
                  <span>{t('checkout.subtotal')}</span>
                  <span>{cartTotal.toFixed(3)} {t('products.currency')}</span>
                </div>
                <div className="checkout-total-row">
                  <span>{t('checkout.deliveryFee')}</span>
                  <span className={deliveryFee === 0 ? 'text-muted' : ''}>
                    {form.governorate
                      ? `${deliveryFee.toFixed(3)} ${t('products.currency')}`
                      : '—'}
                  </span>
                </div>
                <div className="checkout-summary-total grand-total">
                  <span>{t('checkout.grandTotal')}</span>
                  <span className="checkout-total-val">
                    {form.governorate ? `${grandTotal.toFixed(3)} ${t('products.currency')}` : `${cartTotal.toFixed(3)} ${t('products.currency')}`}
                  </span>
                </div>
              </div>

              {/* Delivery zone info */}
              {selectedZone && (
                <div className="checkout-zone-info">
                  <i className="fas fa-location-dot" aria-hidden="true"></i>
                  <span>{lang === 'ar' ? selectedZone.ar : selectedZone.en}</span>
                </div>
              )}

              <Link to="/cart" className="checkout-back-link">
                <i className="fas fa-arrow-right" aria-hidden="true"></i>
                {t('checkout.editCart')}
              </Link>
            </div>

          </div>
        </div>
      </section>
    </>
  );
};

export default Checkout;
