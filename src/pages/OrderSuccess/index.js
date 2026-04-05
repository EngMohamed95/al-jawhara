import { useLocation, Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import Seo from '../../components/Seo';
import './index.css';

const OrderSuccess = () => {
  const { state } = useLocation();
  const { t } = useLanguage();
  const order = state?.order;

  return (
    <>
      <Seo title={t('success.title')} noIndex />
      <section className="section">
        <div className="container">
          <div className="success-card">

            <div className="success-icon-wrap">
              <i className="fas fa-circle-check success-icon" aria-hidden="true"></i>
            </div>

            <h1 className="success-title">{t('success.title')}</h1>
            <p className="success-subtitle">{t('success.sub')}</p>

            {order && (
              <div className="success-order-info">
                <div className="success-order-row">
                  <span>{t('success.orderNum')}</span>
                  <span className="success-order-ref">{order.ref}</span>
                </div>
                <div className="success-order-row">
                  <span>{t('success.total')}</span>
                  <span className="success-order-total">{order.total} {t('products.currency')}</span>
                </div>
                <div className="success-order-row">
                  <span>{t('success.payment')}</span>
                  <span>
                    {order.payment === 'cash'     && t('success.cash')}
                    {order.payment === 'transfer' && t('success.transfer')}
                    {order.payment === 'knet'     && t('success.knet')}
                  </span>
                </div>
                <div className="success-order-row">
                  <span>{t('success.date')}</span>
                  <span>{order.date}</span>
                </div>
              </div>
            )}

            <div className="success-actions">
              <Link to="/products" className="btn btn-green">
                <i className="fas fa-box-open" aria-hidden="true"></i>
                {t('success.shop')}
              </Link>
              <Link to="/" className="btn" style={{ background: 'var(--bg)', border: '2px solid var(--border)' }}>
                <i className="fas fa-house" aria-hidden="true"></i>
                {t('success.home')}
              </Link>
            </div>

          </div>
        </div>
      </section>
    </>
  );
};

export default OrderSuccess;
