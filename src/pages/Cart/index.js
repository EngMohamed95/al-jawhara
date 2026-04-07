import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import Seo from '../../components/Seo';
import './index.css';

const Cart = () => {
  const { cart, removeFromCart, updateCartQty, clearCart, cartTotal } = useApp();
  const { t } = useLanguage();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <>
        <Seo title={t('cart.title')} noIndex />
        <header className="page-header">
          <div className="container">
            <div className="page-header-content">
              <div className="page-header-icon" aria-hidden="true"><i className="fas fa-shopping-cart"></i></div>
              <h1>{t('cart.title')}</h1>
              <p>{t('cart.sub')}</p>
            </div>
          </div>
        </header>
        <section className="section">
          <div className="container">
            <div className="cart-empty-page">
              <i className="fas fa-cart-shopping cart-empty-page-icon" aria-hidden="true"></i>
              <h2>{t('cart.empty')}</h2>
              <p>{t('cart.emptyDesc')}</p>
              <Link to="/products" className="btn btn-green">
                <i className="fas fa-box-open" aria-hidden="true"></i>
                {t('cart.browse')}
              </Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Seo title={t('cart.title')} noIndex />

      <header className="page-header">
        <div className="container">
          <div className="page-header-content">
            <div className="page-header-icon" aria-hidden="true"><i className="fas fa-shopping-cart"></i></div>
            <h1>{t('cart.title')}</h1>
            <p>{t('cart.sub')}</p>
          </div>
        </div>
      </header>

      <section className="section">
        <div className="container">
          <div className="cart-layout">

            {/* ── Items ── */}
            <div className="cart-items-panel">
              <div className="cart-panel-header">
                <h2 className="cart-panel-title">
                  <i className="fas fa-list" aria-hidden="true"></i>
                  {t('cart.items')} ({cart.length})
                </h2>
                <button className="cart-clear-all" onClick={clearCart}>
                  <i className="fas fa-trash" aria-hidden="true"></i>
                  {t('cart.clearAll')}
                </button>
              </div>

              {cart.map(item => {
                const cartKey = item._cartKey || item.id;
                return (
                <div key={cartKey} className="cart-row">
                  <div className="cart-row-icon" aria-hidden="true">{item.icon}</div>
                  <div className="cart-row-info">
                    <div className="cart-row-name">{item.name}</div>
                    <div className="cart-row-unit">
                      {Number(item.price).toFixed(3)} {t('products.currency')} / {t('cart.unit')}
                    </div>
                  </div>
                  <div className="cart-qty-ctrl">
                    <button
                      className="qty-btn"
                      onClick={() => updateCartQty(cartKey, item.qty - 1)}
                      aria-label="تقليل الكمية"
                    >
                      <i className="fas fa-minus" aria-hidden="true"></i>
                    </button>
                    <span className="qty-val">{item.qty}</span>
                    <button
                      className="qty-btn"
                      onClick={() => updateCartQty(cartKey, item.qty + 1)}
                      aria-label="زيادة الكمية"
                    >
                      <i className="fas fa-plus" aria-hidden="true"></i>
                    </button>
                  </div>
                  <div className="cart-row-total">
                    {(item.price * item.qty).toFixed(3)} {t('products.currency')}
                  </div>
                  <button
                    className="cart-row-remove"
                    onClick={() => removeFromCart(cartKey)}
                    aria-label={`حذف ${item.name}`}
                  >
                    <i className="fas fa-trash-can" aria-hidden="true"></i>
                  </button>
                </div>
                );
              })}
            </div>

            {/* ── Summary ── */}
            <div className="cart-summary-panel">
              <h2 className="cart-panel-title">
                <i className="fas fa-receipt" aria-hidden="true"></i>
                {t('cart.summary')}
              </h2>

              <div className="cart-summary-rows">
                {cart.map(item => (
                  <div key={item._cartKey || item.id} className="cart-summary-row">
                    <span>{item.name} × {item.qty}</span>
                    <span>{(item.price * item.qty).toFixed(3)} {t('products.currency')}</span>
                  </div>
                ))}
              </div>

              <div className="cart-summary-divider"></div>

              <div className="cart-summary-total">
                <span>{t('cart.total')}</span>
                <span className="cart-total-amount">{cartTotal.toFixed(3)} {t('products.currency')}</span>
              </div>

              <button
                className="btn btn-green cart-checkout-btn"
                onClick={() => navigate('/checkout')}
              >
                <i className="fas fa-credit-card" aria-hidden="true"></i>
                {t('cart.checkout')}
              </button>

              <Link to="/products" className="cart-continue-link">
                <i className="fas fa-arrow-right" aria-hidden="true"></i>
                {t('cart.continue')}
              </Link>
            </div>

          </div>
        </div>
      </section>
    </>
  );
};

export default Cart;
