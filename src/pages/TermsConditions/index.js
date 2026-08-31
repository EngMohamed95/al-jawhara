import { useLanguage } from '../../context/LanguageContext';
import Seo from '../../components/Seo';
import '../RefundPolicy/index.css';

const SECTIONS = [
  {
    icon: 'fa-file-signature',
    titleAr: '1. مقدمة وقبول الشروط',
    titleEn: '1. Introduction & Acceptance of Terms',
    bodyAr: [
      { p: 'تحكم هذه الشروط والأحكام استخدامك لموقع شركة الجوهرة لإنتاج محارم الورق ومشتقاته الإلكتروني وأي عملية شراء تتم من خلاله. عند استخدامك للموقع أو تسجيل حساب أو إتمام طلب شراء، فإنك تقر بأنك قرأت هذه الشروط وفهمتها ووافقت على الالتزام بها.' },
      { p: 'إذا كنت لا توافق على أي جزء من هذه الشروط، يُرجى التوقف عن استخدام الموقع.' },
    ],
    bodyEn: [
      { p: 'These Terms & Conditions govern your use of the Al-Jawhra Tissue Paper & Derivatives Co. website and any purchase made through it. By using the site, creating an account, or placing an order, you acknowledge that you have read, understood, and agreed to be bound by these terms.' },
      { p: 'If you do not agree with any part of these terms, please discontinue use of the website.' },
    ],
  },
  {
    icon: 'fa-building',
    titleAr: '2. عن الشركة',
    titleEn: '2. About the Company',
    bodyAr: [
      { p: 'شركة الجوهرة لإنتاج محارم الورق ومشتقاته، تأسست بتاريخ 18/2/1998، ويقع مصنعها في المنطقة الصناعية — الشعيبة، دولة الكويت، وتُعنى بإنتاج وتسويق المحارم الورقية ولفافات الورق بمختلف أنواعها.' },
    ],
    bodyEn: [
      { p: 'Al-Jawhra Tissue Paper & Derivatives Co. was founded on 18/2/1998. Its factory is located in the Industrial Area — Shuaiba, State of Kuwait, and it manufactures and markets facial tissues and paper rolls of various types.' },
    ],
  },
  {
    icon: 'fa-user-check',
    titleAr: '3. الحسابات والتسجيل',
    titleEn: '3. Accounts & Registration',
    bodyAr: [
      { ul: [
        'يجب أن تكون المعلومات المُقدَّمة عند إنشاء الحساب أو تنفيذ الطلب صحيحة ومحدثة.',
        'أنت المسؤول عن الحفاظ على سرية بيانات دخولك وعن جميع الأنشطة التي تتم من خلال حسابك.',
        'يحق للشركة تعليق أو إلغاء أي حساب يُستخدم بشكل مخالف لهذه الشروط أو للأنظمة المعمول بها.',
      ] },
    ],
    bodyEn: [
      { ul: [
        'Information provided when creating an account or placing an order must be accurate and up to date.',
        'You are responsible for keeping your login credentials confidential and for all activity carried out through your account.',
        'The company reserves the right to suspend or terminate any account used in violation of these terms or applicable law.',
      ] },
    ],
  },
  {
    icon: 'fa-tags',
    titleAr: '4. المنتجات والأسعار',
    titleEn: '4. Products & Pricing',
    bodyAr: [
      { ul: [
        'جميع الأسعار المعروضة على الموقع بالدينار الكويتي وتشمل الضرائب المطبقة إن وجدت، ما لم يُذكر خلاف ذلك.',
        'تسعى الشركة لعرض صور ومواصفات دقيقة للمنتجات، إلا أن الألوان أو المقاسات الفعلية قد تختلف بشكل طفيف عن الصور المعروضة.',
        'تحتفظ الشركة بحق تعديل الأسعار أو توفر المنتجات في أي وقت دون إشعار مسبق، على ألا يؤثر ذلك على الطلبات المؤكدة سابقاً.',
        'في حال حدوث خطأ واضح في السعر المعروض، يحق للشركة إلغاء الطلب المتأثر وإبلاغ العميل واسترداد أي مبلغ مدفوع بالكامل.',
      ] },
    ],
    bodyEn: [
      { ul: [
        'All prices on the website are in Kuwaiti Dinars (KWD) and include applicable taxes, unless stated otherwise.',
        'The company strives to display accurate product images and specifications; actual colors or sizes may vary slightly from what is shown.',
        'The company reserves the right to change prices or product availability at any time without prior notice, without affecting previously confirmed orders.',
        'In the event of an obvious pricing error, the company may cancel the affected order, notify the customer, and refund any amount paid in full.',
      ] },
    ],
  },
  {
    icon: 'fa-cart-shopping',
    titleAr: '5. الطلبات وتأكيدها',
    titleEn: '5. Orders & Confirmation',
    bodyAr: [
      { p: 'يُعد إرسال الطلب من خلال الموقع عرضاً للشراء يخضع لقبول الشركة. يُعتبر الطلب مؤكداً بعد استلامك إشعار تأكيد الطلب عبر الموقع أو البريد الإلكتروني أو الهاتف.' },
      { p: 'تحتفظ الشركة بحق رفض أو إلغاء أي طلب لأسباب تشمل — على سبيل المثال لا الحصر — نفاد المخزون، وجود خطأ في السعر أو الوصف، أو الاشتباه في محاولة احتيال.' },
    ],
    bodyEn: [
      { p: 'Submitting an order through the website constitutes an offer to purchase, subject to the company\'s acceptance. An order is considered confirmed once you receive an order confirmation via the website, email, or phone.' },
      { p: 'The company reserves the right to refuse or cancel any order for reasons including, but not limited to, stock unavailability, pricing or description errors, or suspected fraud.' },
    ],
  },
  {
    icon: 'fa-credit-card',
    titleAr: '6. طرق الدفع',
    titleEn: '6. Payment Methods',
    bodyAr: [
      { p: 'يوفر الموقع طريقتين للدفع:' },
      { ul: [
        'الدفع نقداً عند الاستلام.',
        'الدفع الإلكتروني عبر بطاقة الائتمان/الخصم من خلال بوابة الدفع الآمنة "Tap".',
      ] },
      { p: 'جميع المدفوعات الإلكترونية تتم معالجتها عبر بوابة دفع خارجية معتمدة، ولا تقوم الشركة بتخزين بيانات بطاقتك البنكية على خوادمها.' },
    ],
    bodyEn: [
      { p: 'The website offers two payment methods:' },
      { ul: [
        'Cash on delivery.',
        'Online payment by credit/debit card through the secure "Tap" payment gateway.',
      ] },
      { p: 'All electronic payments are processed through a certified third-party payment gateway; the company does not store your card details on its servers.' },
    ],
  },
  {
    icon: 'fa-truck',
    titleAr: '7. التوصيل والشحن',
    titleEn: '7. Delivery & Shipping',
    bodyAr: [
      { ul: [
        'يتم التوصيل داخل دولة الكويت إلى العنوان الذي يُدخله العميل عند إتمام الطلب.',
        'العميل مسؤول عن دقة عنوان التوصيل ورقم التواصل؛ ولا تتحمل الشركة مسؤولية التأخير أو تعذر التوصيل الناتج عن بيانات غير صحيحة.',
        'قد تختلف مدة التوصيل حسب المنطقة وحجم الطلب، وسيتم إبلاغ العميل بالمدة التقديرية عند تأكيد الطلب.',
      ] },
    ],
    bodyEn: [
      { ul: [
        'Delivery is made within the State of Kuwait to the address entered by the customer at checkout.',
        'The customer is responsible for providing an accurate delivery address and contact number; the company is not liable for delays or failed delivery resulting from incorrect information.',
        'Delivery time may vary by area and order size, and an estimated timeframe will be communicated at order confirmation.',
      ] },
    ],
  },
  {
    icon: 'fa-rotate-left',
    titleAr: '8. الاسترجاع والاستبدال',
    titleEn: '8. Returns & Exchanges',
    bodyAr: [
      { p: 'تخضع عمليات استرجاع أو استبدال المنتجات لسياسة الاسترجاع الخاصة بالشركة، والتي تُعد جزءاً لا يتجزأ من هذه الشروط والأحكام.' },
    ],
    bodyEn: [
      { p: 'Returns and exchanges are governed by the company\'s Refund Policy, which forms an integral part of these Terms & Conditions.' },
    ],
  },
  {
    icon: 'fa-copyright',
    titleAr: '9. الملكية الفكرية',
    titleEn: '9. Intellectual Property',
    bodyAr: [
      { p: 'جميع المحتويات المنشورة على الموقع من شعارات وصور ونصوص وتصاميم هي ملك لشركة الجوهرة أو مرخصة لها، ولا يجوز نسخها أو إعادة استخدامها أو توزيعها دون إذن كتابي مسبق من الشركة.' },
    ],
    bodyEn: [
      { p: 'All content published on the website — logos, images, text, and designs — is owned by or licensed to Al-Jawhra, and may not be copied, reused, or distributed without prior written permission from the company.' },
    ],
  },
  {
    icon: 'fa-shield-halved',
    titleAr: '10. حدود المسؤولية',
    titleEn: '10. Limitation of Liability',
    bodyAr: [
      { p: 'تبذل الشركة قصارى جهدها لضمان دقة المعلومات المعروضة على الموقع وجودة المنتجات، إلا أنها لا تتحمل مسؤولية أي أضرار غير مباشرة أو عرضية تنتج عن استخدام الموقع أو المنتجات خارج نطاق الاستخدام المعتاد الموصى به.' },
    ],
    bodyEn: [
      { p: 'The company makes every reasonable effort to ensure the accuracy of the information displayed on the website and the quality of its products. However, it is not liable for any indirect or incidental damages arising from use of the website or products outside their normal, recommended use.' },
    ],
  },
  {
    icon: 'fa-lock',
    titleAr: '11. الخصوصية',
    titleEn: '11. Privacy',
    bodyAr: [
      { p: 'تلتزم الشركة بحماية بياناتك الشخصية واستخدامها فقط لأغراض معالجة الطلبات والتواصل معك وتحسين خدماتنا، ولا تتم مشاركتها مع أي جهة خارجية إلا بالقدر اللازم لإتمام عمليات الشحن والدفع الإلكتروني.' },
    ],
    bodyEn: [
      { p: 'The company is committed to protecting your personal data and uses it only to process orders, communicate with you, and improve our services. Your data is not shared with third parties except as necessary to complete shipping and online payment processing.' },
    ],
  },
  {
    icon: 'fa-gavel',
    titleAr: '12. القانون الواجب التطبيق',
    titleEn: '12. Governing Law',
    bodyAr: [
      { p: 'تخضع هذه الشروط والأحكام وتُفسَّر وفقاً لقوانين دولة الكويت، وتختص محاكم دولة الكويت وحدها بالفصل في أي نزاع ينشأ عن استخدام الموقع أو تطبيق هذه الشروط.' },
    ],
    bodyEn: [
      { p: 'These Terms & Conditions are governed by and construed in accordance with the laws of the State of Kuwait. The courts of Kuwait shall have exclusive jurisdiction over any dispute arising from use of the website or application of these terms.' },
    ],
  },
  {
    icon: 'fa-pen',
    titleAr: '13. التعديلات على الشروط',
    titleEn: '13. Changes to These Terms',
    bodyAr: [
      { p: 'يحق للشركة تحديث أو تعديل هذه الشروط والأحكام في أي وقت، ويسري التعديل فور نشره على الموقع. استمرارك في استخدام الموقع بعد أي تعديل يُعد قبولاً منك للشروط المُحدَّثة.' },
    ],
    bodyEn: [
      { p: 'The company may update or amend these Terms & Conditions at any time, and changes take effect immediately upon posting to the website. Continued use of the website after any change constitutes your acceptance of the updated terms.' },
    ],
  },
  {
    icon: 'fa-headset',
    titleAr: '14. تواصل معنا',
    titleEn: '14. Contact Us',
    bodyAr: [
      { p: 'لأي استفسار حول هذه الشروط والأحكام، يسعدنا تواصلكم معنا عبر:' },
      { ul: [
        'الهاتف: (965) 23263824',
        'الواتساب: (965) 96625306',
        'البريد الإلكتروني: info@al-jawhara.com',
        'العنوان: المنطقة الصناعية — الشعيبة، الكويت',
      ] },
    ],
    bodyEn: [
      { p: 'For any question regarding these Terms & Conditions, feel free to reach us via:' },
      { ul: [
        'Phone: (965) 23263824',
        'WhatsApp: (965) 96625306',
        'Email: info@al-jawhara.com',
        'Address: Industrial Area — Shuaiba, Kuwait',
      ] },
    ],
  },
];

const TermsConditions = () => {
  const { lang } = useLanguage();
  const ar = lang === 'ar';
  const dir = ar ? 'rtl' : 'ltr';

  return (
    <>
      <Seo
        title={ar ? 'الشروط والأحكام' : 'Terms & Conditions'}
        description={ar
          ? 'الشروط والأحكام الخاصة باستخدام موقع شركة الجوهرة والشراء منه.'
          : 'Terms & Conditions for using the Al-Jawhra website and purchasing from it.'}
      />

      <header className="page-header legal-header">
        <div className="container">
          <div className="page-header-content">
            <div className="page-header-icon" aria-hidden="true"><i className="fas fa-file-contract"></i></div>
            <h1>{ar ? 'الشروط والأحكام' : 'Terms & Conditions'}</h1>
            <p>{ar ? 'يرجى قراءة هذه الشروط بعناية قبل استخدام الموقع أو الشراء منه' : 'Please read these terms carefully before using the website or making a purchase'}</p>
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

export default TermsConditions;
