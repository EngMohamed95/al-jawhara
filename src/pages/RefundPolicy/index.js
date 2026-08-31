import { useLanguage } from '../../context/LanguageContext';
import Seo from '../../components/Seo';
import './index.css';

const SECTIONS = [
  {
    icon: 'fa-circle-info',
    titleAr: '1. مقدمة',
    titleEn: '1. Introduction',
    bodyAr: [
      { p: 'توضح هذه السياسة الشروط والإجراءات الخاصة باسترجاع أو استبدال المنتجات المشتراة من متجر شركة الجوهرة لإنتاج محارم الورق ومشتقاته عبر الإنترنت. بإتمامك عملية الشراء من موقعنا، فإنك توافق على الالتزام بما ورد في هذه السياسة.' },
    ],
    bodyEn: [
      { p: 'This policy explains the terms and procedures for returning or exchanging products purchased from the Al-Jawhra Tissue Paper & Derivatives Co. online store. By completing a purchase on our website, you agree to be bound by this policy.' },
    ],
  },
  {
    icon: 'fa-box-open',
    titleAr: '2. المنتجات القابلة للاسترجاع',
    titleEn: '2. Eligible Products',
    bodyAr: [
      { p: 'نظراً للطبيعة الصحية والاستهلاكية لمنتجات المحارم الورقية ولفافات الورق، لا يمكن قبول استرجاع أو استبدال المنتج إلا في الحالات التالية:' },
      { ul: [
        'وصول المنتج تالفاً أو معيباً من التصنيع.',
        'وصول صنف مختلف عن الذي تم طلبه (خطأ في الطلبية).',
        'نقص في الكمية المطلوبة عن المُستلم فعلياً.',
        'انتهاء الصلاحية أو تلف العبوة الخارجية عند الاستلام.',
      ] },
      { p: 'لا تُقبل طلبات الاسترجاع بسبب تغيير الرأي بعد فتح العبوة الخارجية للمنتج، حفاظاً على السلامة الصحية للمنتجات الورقية.' },
    ],
    bodyEn: [
      { p: 'Due to the hygienic and consumable nature of tissue paper and paper roll products, returns or exchanges are accepted only in the following cases:' },
      { ul: [
        'The product arrives damaged or with a manufacturing defect.',
        'A different item than the one ordered was delivered (order error).',
        'The quantity received is less than what was ordered.',
        'The outer packaging is damaged or the product has expired upon receipt.',
      ] },
      { p: 'Returns due to a simple change of mind are not accepted once the outer packaging has been opened, in order to preserve the hygienic integrity of paper products.' },
    ],
  },
  {
    icon: 'fa-clock',
    titleAr: '3. مدة تقديم طلب الاسترجاع',
    titleEn: '3. Return Request Window',
    bodyAr: [
      { p: 'يجب إبلاغنا بأي مشكلة في الطلبية خلال 48 ساعة من استلام الشحنة، وذلك عبر الهاتف أو الواتساب أو البريد الإلكتروني الموضحة أدناه، مع إرفاق صور واضحة للمنتج والعبوة وفاتورة الشراء.' },
      { p: 'الطلبات المُبلَّغ عنها بعد هذه المدة قد لا يكون بالإمكان قبولها، إلا في حالات خاصة تقدّرها إدارة المتجر.' },
    ],
    bodyEn: [
      { p: 'Any issue with an order must be reported within 48 hours of receiving the shipment, via the phone, WhatsApp, or email listed below, along with clear photos of the product, packaging, and purchase invoice.' },
      { p: 'Requests reported after this period may not be accepted, except in special cases at the store management\'s discretion.' },
    ],
  },
  {
    icon: 'fa-clipboard-check',
    titleAr: '4. شروط قبول الاسترجاع',
    titleEn: '4. Return Conditions',
    bodyAr: [
      { ul: [
        'أن يكون المنتج بكامل عبوته الأصلية دون فتح أو استخدام (باستثناء حالات العيب المصنعي الظاهر).',
        'إرفاق فاتورة الشراء أو رقم الطلب.',
        'ألا يكون سبب الاسترجاع تلفاً ناتجاً عن سوء استخدام أو تخزين خاطئ بعد الاستلام.',
        'للطلبيات بالجملة أو الطلبيات الخاصة بالمؤسسات، تُحدَّد شروط الاسترجاع ضمن اتفاق منفصل عند تأكيد الطلب.',
      ] },
    ],
    bodyEn: [
      { ul: [
        'The product must be in its complete original packaging, unopened and unused (except in cases of a visible manufacturing defect).',
        'The purchase invoice or order number must be provided.',
        'The return reason must not be damage caused by misuse or improper storage after delivery.',
        'For bulk or corporate orders, return terms are defined in a separate agreement at order confirmation.',
      ] },
    ],
  },
  {
    icon: 'fa-rotate-left',
    titleAr: '5. طريقة تقديم طلب الاسترجاع',
    titleEn: '5. How to Request a Return',
    bodyAr: [
      { ul: [
        'تواصل معنا عبر الواتساب أو الهاتف أو البريد الإلكتروني مع ذكر رقم الطلب.',
        'أرفق صوراً واضحة للمنتج والعبوة توضّح المشكلة.',
        'سيقوم فريقنا بمراجعة الطلب والرد خلال 1-2 يوم عمل.',
        'في حال الموافقة، سيتم تنسيق موعد لاستلام المنتج المرتجع من عنوانك.',
      ] },
    ],
    bodyEn: [
      { ul: [
        'Contact us via WhatsApp, phone, or email, quoting your order number.',
        'Attach clear photos of the product and packaging showing the issue.',
        'Our team will review the request and respond within 1-2 business days.',
        'If approved, we will arrange a pickup of the returned item from your address.',
      ] },
    ],
  },
  {
    icon: 'fa-sack-dollar',
    titleAr: '6. طريقة الاسترداد',
    titleEn: '6. Refund Method',
    bodyAr: [
      { ul: [
        'الطلبات المدفوعة إلكترونياً عبر بطاقة الدفع (Tap): يتم رد المبلغ إلى نفس البطاقة المستخدمة خلال 5-14 يوم عمل حسب سياسة البنك المُصدر.',
        'الطلبات المدفوعة نقداً عند الاستلام: يتم الاسترداد عبر تحويل بنكي أو تحويل عبر كي نت خلال 5-7 أيام عمل من تأكيد الاسترجاع.',
        'كبديل للاسترداد النقدي، يمكن للعميل اختيار استبدال المنتج بآخر مطابق أو رصيد شراء لدى المتجر.',
      ] },
    ],
    bodyEn: [
      { ul: [
        'Orders paid online via card (Tap): the amount is refunded to the same card used within 5-14 business days, depending on the issuing bank\'s policy.',
        'Orders paid cash on delivery: refunded via bank transfer or KNET transfer within 5-7 business days of the return being confirmed.',
        'As an alternative to a cash refund, the customer may choose a replacement item or store credit.',
      ] },
    ],
  },
  {
    icon: 'fa-truck-fast',
    titleAr: '7. تكلفة شحن الاسترجاع',
    titleEn: '7. Return Shipping Cost',
    bodyAr: [
      { p: 'في حال كان سبب الاسترجاع خطأً من جانبنا (منتج تالف، عيب مصنعي، صنف خاطئ، أو نقص كمية)، تتحمل الشركة كامل تكلفة استلام المنتج المرتجع وإعادة الشحنة الصحيحة أو المبلغ.' },
      { p: 'إذا كان سبب الاسترجاع خارجاً عن مسؤولية الشركة، فقد تُخصم تكلفة الشحن من المبلغ المسترد.' },
    ],
    bodyEn: [
      { p: 'If the return reason is our error (damaged item, manufacturing defect, wrong item, or short quantity), the company covers the full cost of collecting the returned product and re-shipping the correct order or refund.' },
      { p: 'If the return reason is not the company\'s responsibility, the shipping cost may be deducted from the refunded amount.' },
    ],
  },
  {
    icon: 'fa-ban',
    titleAr: '8. إلغاء الطلب',
    titleEn: '8. Order Cancellation',
    bodyAr: [
      { p: 'يمكن إلغاء الطلب مجاناً قبل شحنه من مستودعنا عبر التواصل معنا مباشرة. بعد خروج الشحنة للتوصيل، يخضع الإلغاء لسياسة الاسترجاع الموضحة أعلاه.' },
    ],
    bodyEn: [
      { p: 'Orders can be cancelled free of charge before they leave our warehouse by contacting us directly. Once a shipment is out for delivery, cancellation is subject to the return policy described above.' },
    ],
  },
  {
    icon: 'fa-headset',
    titleAr: '9. تواصل معنا',
    titleEn: '9. Contact Us',
    bodyAr: [
      { p: 'لأي استفسار بخصوص الاسترجاع أو الاستبدال، يسعدنا تواصلكم معنا عبر:' },
      { ul: [
        'الهاتف: (965) 23263824',
        'الواتساب: (965) 96625306',
        'البريد الإلكتروني: info@al-jawhara.com',
        'العنوان: المنطقة الصناعية — الشعيبة، الكويت',
      ] },
    ],
    bodyEn: [
      { p: 'For any question regarding returns or exchanges, feel free to reach us via:' },
      { ul: [
        'Phone: (965) 23263824',
        'WhatsApp: (965) 96625306',
        'Email: info@al-jawhara.com',
        'Address: Industrial Area — Shuaiba, Kuwait',
      ] },
    ],
  },
];

const RefundPolicy = () => {
  const { lang } = useLanguage();
  const ar = lang === 'ar';
  const dir = ar ? 'rtl' : 'ltr';

  return (
    <>
      <Seo
        title={ar ? 'سياسة الاسترجاع' : 'Refund Policy'}
        description={ar
          ? 'سياسة الاسترجاع والاستبدال لمنتجات شركة الجوهرة — الشروط، المدة، وطريقة الاسترداد.'
          : 'Al-Jawhra return, exchange and refund policy — conditions, timeframe, and refund method.'}
      />

      <header className="page-header legal-header">
        <div className="container">
          <div className="page-header-content">
            <div className="page-header-icon" aria-hidden="true"><i className="fas fa-rotate-left"></i></div>
            <h1>{ar ? 'سياسة الاسترجاع' : 'Refund Policy'}</h1>
            <p>{ar ? 'كل ما تحتاج معرفته عن استرجاع واستبدال المنتجات' : 'Everything you need to know about returning and exchanging products'}</p>
          </div>
        </div>
      </header>

      <section className="section legal-section">
        <div className="container">
          <div className="legal-content" dir={dir}>
            {SECTIONS.map((s, i) => (
              <div className="legal-block" key={i}>
                <h2 className="legal-heading">
                  <i className={`fas ${s.icon}`} aria-hidden="true"></i>
                  {ar ? s.titleAr : s.titleEn}
                </h2>
                {(ar ? s.bodyAr : s.bodyEn).map((block, j) => (
                  block.ul ? (
                    <ul className="legal-list" key={j}>
                      {block.ul.map((item, k) => <li key={k}>{item}</li>)}
                    </ul>
                  ) : (
                    <p className="legal-text" key={j}>{block.p}</p>
                  )
                ))}
              </div>
            ))}
            <p className="legal-updated">{ar ? 'آخر تحديث: أغسطس 2026' : 'Last updated: August 2026'}</p>
          </div>
        </div>
      </section>
    </>
  );
};

export default RefundPolicy;
