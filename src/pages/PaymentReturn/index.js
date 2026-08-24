import { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import Seo from '../../components/Seo';
import { checkTapStatus } from '../../services/tapService';
import './index.css';

/* Tap can take a moment to settle the charge after redirecting the
   customer back — poll a few times before giving up and showing "pending". */
const POLL_DELAYS = [0, 2000, 3000, 4000, 5000];

const PaymentReturn = () => {
  const [params] = useSearchParams();
  const { lang } = useLanguage();
  const ref = params.get('ref') || '';
  const [status, setStatus] = useState('checking'); // checking | paid | pending | failed | error
  const cancelled = useRef(false);

  useEffect(() => {
    cancelled.current = false;
    if (!ref) { setStatus('error'); return; }

    (async () => {
      for (const delay of POLL_DELAYS) {
        if (delay) await new Promise(r => setTimeout(r, delay));
        if (cancelled.current) return;
        try {
          const res = await checkTapStatus(ref);
          if (cancelled.current) return;
          if (res.status === 'paid' || res.status === 'failed') {
            setStatus(res.status);
            return;
          }
        } catch {
          setStatus('error');
          return;
        }
      }
      if (!cancelled.current) setStatus('pending');
    })();

    return () => { cancelled.current = true; };
  }, [ref]);

  const content = {
    checking: {
      icon: 'fa-spinner fa-spin', color: '#065089', bg: '#e8f0f8',
      title: lang === 'ar' ? 'جاري التحقق من الدفع...' : 'Verifying payment...',
      sub:   lang === 'ar' ? 'لحظات من فضلك، لا تغلق هذه الصفحة.' : 'One moment, please don\'t close this page.',
    },
    paid: {
      icon: 'fa-circle-check', color: '#059669', bg: '#d1fae5',
      title: lang === 'ar' ? 'تم الدفع بنجاح!' : 'Payment Successful!',
      sub:   lang === 'ar' ? 'شكرًا لك، تم استلام طلبك وسيتم التواصل معك لتأكيد التسليم.' : 'Thank you — your order was received and we\'ll be in touch to confirm delivery.',
    },
    pending: {
      icon: 'fa-clock', color: '#b45309', bg: '#fef3c7',
      title: lang === 'ar' ? 'الدفع قيد المعالجة' : 'Payment Processing',
      sub:   lang === 'ar' ? 'طلبك محفوظ، وسنؤكد حالة الدفع فور اكتمالها. لو استمرت لفترة طويلة تواصل معنا.' : 'Your order is saved — we\'ll confirm the payment once it settles. Contact us if this takes too long.',
    },
    failed: {
      icon: 'fa-circle-xmark', color: '#dc2626', bg: '#fee2e2',
      title: lang === 'ar' ? 'فشلت عملية الدفع' : 'Payment Failed',
      sub:   lang === 'ar' ? 'لم تتم عملية الدفع. طلبك محفوظ ويمكنك المحاولة مرة أخرى أو اختيار طريقة دفع أخرى.' : 'The payment did not go through. Your order was saved — try again or choose another payment method.',
    },
    error: {
      icon: 'fa-triangle-exclamation', color: '#dc2626', bg: '#fee2e2',
      title: lang === 'ar' ? 'تعذر التحقق من حالة الدفع' : 'Could not verify payment status',
      sub:   lang === 'ar' ? 'تواصل معنا مع ذكر رقم الطلب للتأكد من حالة طلبك.' : 'Please contact us with your order number so we can check on it.',
    },
  }[status];

  return (
    <>
      <Seo title={content.title} noIndex />
      <section className="section">
        <div className="container">
          <div className="pr-card">
            <div className="pr-icon-wrap" style={{ background: content.bg }}>
              <i className={`fas ${content.icon} pr-icon`} style={{ color: content.color }} aria-hidden="true"></i>
            </div>
            <h1 className="pr-title">{content.title}</h1>
            <p className="pr-sub">{content.sub}</p>

            {ref && (
              <div className="pr-ref-row">
                <span>{lang === 'ar' ? 'رقم الطلب' : 'Order Number'}</span>
                <span className="pr-ref-val">{ref}</span>
              </div>
            )}

            <div className="pr-actions">
              {status === 'failed' && (
                <Link to="/checkout" className="btn btn-green">
                  <i className="fas fa-rotate-right" aria-hidden="true"></i>
                  {lang === 'ar' ? 'حاول مرة أخرى' : 'Try Again'}
                </Link>
              )}
              <Link to="/products" className="btn" style={{ background: 'var(--bg)', border: '2px solid var(--border)' }}>
                <i className="fas fa-box-open" aria-hidden="true"></i>
                {lang === 'ar' ? 'متابعة التسوق' : 'Continue Shopping'}
              </Link>
              <Link to="/" className="btn" style={{ background: 'var(--bg)', border: '2px solid var(--border)' }}>
                <i className="fas fa-house" aria-hidden="true"></i>
                {lang === 'ar' ? 'الصفحة الرئيسية' : 'Home Page'}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default PaymentReturn;
