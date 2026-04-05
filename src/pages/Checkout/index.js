import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import Seo from '../../components/Seo';
import './index.css';

const emptyForm = {
  client: '', company: '', phone: '', email: '',
  address: '', notes: '', payment: 'cash',
};

const Checkout = () => {
  const { cart, cartTotal, submitOrder } = useApp();
  const navigate  = useNavigate();
  const [form,    setForm]    = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  // Redirect if cart is empty
  if (cart.length === 0) {
    return (
      <>
        <Seo title="إتمام الطلب" noIndex />
        <section className="section">
          <div className="container">
            <div className="cart-empty-page">
              <i className="fas fa-cart-shopping cart-empty-page-icon" aria-hidden="true"></i>
              <h2>السلة فارغة</h2>
              <Link to="/products" className="btn btn-green">تصفح المنتجات</Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const order = await submitOrder({
        client:  form.client,
        company: form.company,
        phone:   form.phone,
        email:   form.email,
        address: form.address,
        notes:   form.notes,
        payment: form.payment,
        product: cart.map(i => i.name).join('، '),
        qty:     cart.reduce((s, i) => s + i.qty, 0),
      });
      navigate('/order-success', { state: { order } });
    } catch {
      setError('تعذر إرسال الطلب. تأكد من الاتصال بالإنترنت.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Seo title="إتمام الطلب" noIndex />

      <header className="page-header">
        <div className="container">
          <div className="page-header-content">
            <div className="page-header-icon" aria-hidden="true"><i className="fas fa-credit-card"></i></div>
            <h1>إتمام الطلب</h1>
            <p>أدخل بياناتك لإتمام عملية الطلب</p>
          </div>
        </div>
      </header>

      <section className="section">
        <div className="container">

          {/* Steps */}
          <div className="checkout-steps">
            <div className="checkout-step done">
              <div className="step-circle"><i className="fas fa-check" aria-hidden="true"></i></div>
              <span>السلة</span>
            </div>
            <div className="checkout-step-line done"></div>
            <div className="checkout-step active">
              <div className="step-circle">2</div>
              <span>بيانات الطلب</span>
            </div>
            <div className="checkout-step-line"></div>
            <div className="checkout-step">
              <div className="step-circle">3</div>
              <span>التأكيد</span>
            </div>
          </div>

          <div className="checkout-layout">

            {/* ── Form ── */}
            <div className="checkout-form-panel">
              <h2 className="checkout-section-title">
                <i className="fas fa-user" aria-hidden="true"></i>
                بيانات العميل
              </h2>

              {error && (
                <div className="alert alert-error" role="alert">
                  <i className="fas fa-triangle-exclamation" aria-hidden="true"></i> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">الاسم الكامل *</label>
                    <input className="form-input" name="client" value={form.client}
                      onChange={handleChange} placeholder="اسمك الكريم" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">اسم الشركة / المؤسسة</label>
                    <input className="form-input" name="company" value={form.company}
                      onChange={handleChange} placeholder="اختياري" />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">رقم الهاتف *</label>
                    <input className="form-input" name="phone" value={form.phone}
                      onChange={handleChange} placeholder="+965XXXXXXXX" dir="ltr" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">البريد الإلكتروني</label>
                    <input className="form-input" type="email" name="email" value={form.email}
                      onChange={handleChange} placeholder="email@example.com" dir="ltr" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">عنوان التسليم *</label>
                  <input className="form-input" name="address" value={form.address}
                    onChange={handleChange} placeholder="المنطقة، الشارع، رقم المبنى" required />
                </div>

                <div className="form-group">
                  <label className="form-label">ملاحظات إضافية</label>
                  <textarea className="form-textarea" name="notes" value={form.notes}
                    onChange={handleChange} placeholder="أي تعليمات خاصة للتسليم..." style={{ minHeight: '80px' }} />
                </div>

                <h2 className="checkout-section-title" style={{ marginTop: '28px' }}>
                  <i className="fas fa-wallet" aria-hidden="true"></i>
                  طريقة الدفع
                </h2>

                <div className="payment-options">
                  {[
                    { val: 'cash',     icon: 'fa-money-bills',   label: 'كاش عند الاستلام' },
                    { val: 'transfer', icon: 'fa-building-columns', label: 'تحويل بنكي' },
                    { val: 'knet',     icon: 'fa-credit-card',   label: 'K-Net' },
                  ].map(opt => (
                    <label
                      key={opt.val}
                      className={`payment-option${form.payment === opt.val ? ' selected' : ''}`}
                    >
                      <input
                        type="radio" name="payment" value={opt.val}
                        checked={form.payment === opt.val}
                        onChange={handleChange}
                      />
                      <i className={`fas ${opt.icon}`} aria-hidden="true"></i>
                      {opt.label}
                    </label>
                  ))}
                </div>

                <button type="submit" className="btn btn-green checkout-submit-btn" disabled={loading}>
                  {loading
                    ? <><i className="fas fa-spinner fa-spin" aria-hidden="true"></i> جاري إرسال الطلب...</>
                    : <><i className="fas fa-paper-plane" aria-hidden="true"></i> تأكيد وإرسال الطلب</>
                  }
                </button>
              </form>
            </div>

            {/* ── Order Summary ── */}
            <div className="checkout-summary-panel">
              <h2 className="checkout-section-title">
                <i className="fas fa-receipt" aria-hidden="true"></i>
                ملخص طلبك
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
                      {(item.price * item.qty).toFixed(3)} د.ك
                    </div>
                  </div>
                ))}
              </div>

              <div className="checkout-summary-total">
                <span>الإجمالي</span>
                <span className="checkout-total-val">{cartTotal.toFixed(3)} د.ك</span>
              </div>

              <Link to="/cart" className="checkout-back-link">
                <i className="fas fa-arrow-right" aria-hidden="true"></i>
                تعديل السلة
              </Link>
            </div>

          </div>
        </div>
      </section>
    </>
  );
};

export default Checkout;
