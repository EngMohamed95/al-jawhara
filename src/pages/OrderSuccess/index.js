import { useLocation, Link } from 'react-router-dom';
import Seo from '../../components/Seo';
import './index.css';

const OrderSuccess = () => {
  const { state } = useLocation();
  const order = state?.order;

  return (
    <>
      <Seo title="تم الطلب بنجاح" noIndex />
      <section className="section">
        <div className="container">
          <div className="success-card">

            <div className="success-icon-wrap">
              <i className="fas fa-circle-check success-icon" aria-hidden="true"></i>
            </div>

            <h1 className="success-title">تم استلام طلبك بنجاح!</h1>
            <p className="success-subtitle">
              سيتواصل معك فريق المبيعات خلال ساعات العمل لتأكيد الطلب والترتيب للتسليم.
            </p>

            {order && (
              <div className="success-order-info">
                <div className="success-order-row">
                  <span>رقم الطلب</span>
                  <span className="success-order-ref">{order.ref}</span>
                </div>
                <div className="success-order-row">
                  <span>الإجمالي</span>
                  <span className="success-order-total">{order.total} د.ك</span>
                </div>
                <div className="success-order-row">
                  <span>طريقة الدفع</span>
                  <span>
                    {order.payment === 'cash'     && 'كاش عند الاستلام'}
                    {order.payment === 'transfer' && 'تحويل بنكي'}
                    {order.payment === 'knet'     && 'K-Net'}
                  </span>
                </div>
                <div className="success-order-row">
                  <span>التاريخ</span>
                  <span>{order.date}</span>
                </div>
              </div>
            )}

            <div className="success-actions">
              <Link to="/products" className="btn btn-green">
                <i className="fas fa-box-open" aria-hidden="true"></i>
                متابعة التسوق
              </Link>
              <Link to="/" className="btn" style={{ background: 'var(--bg)', border: '2px solid var(--border)' }}>
                <i className="fas fa-house" aria-hidden="true"></i>
                الصفحة الرئيسية
              </Link>
            </div>

          </div>
        </div>
      </section>
    </>
  );
};

export default OrderSuccess;
