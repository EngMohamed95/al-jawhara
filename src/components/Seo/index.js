import { Helmet } from 'react-helmet-async';

const SITE = 'الجوهرة لإنتاج محارم الورق ومشتقاته';
const DEFAULT_DESC = 'شركة الجوهرة لإنتج محارم الورق ومشتقاته — منتجات ورقية عالية الجودة من الكويت منذ 1998. مناديل وجه، رولات، مناشف، محارم جيب.';
const DEFAULT_KW   = 'مناديل ورقية الكويت، الجوهرة للمناديل، مناديل وجه، رولات مطبخ، مناشف ورق، tissue paper Kuwait';

const Seo = ({ title, description, keywords, noIndex = false }) => {
  const fullTitle = title ? `${title} | ${SITE}` : SITE;

  return (
    <Helmet>
      {/* Primary */}
      <html lang="ar" dir="rtl" />
      <title>{fullTitle}</title>
      <meta name="description"  content={description || DEFAULT_DESC} />
      <meta name="keywords"     content={keywords    || DEFAULT_KW} />
      <meta name="author"       content="شركة الجوهرة لإنتج محارم الورق ومشتقاته" />
      <meta name="robots"       content={noIndex ? 'noindex,nofollow' : 'index,follow'} />
      <link rel="canonical"     href={typeof window !== 'undefined' ? window.location.href : '/'} />

      {/* Open Graph */}
      <meta property="og:type"        content="website" />
      <meta property="og:site_name"   content={SITE} />
      <meta property="og:title"       content={fullTitle} />
      <meta property="og:description" content={description || DEFAULT_DESC} />
      <meta property="og:locale"      content="ar_KW" />

      {/* Twitter */}
      <meta name="twitter:card"        content="summary" />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={description || DEFAULT_DESC} />

      {/* Business Schema (JSON-LD) */}
      <script type="application/ld+json">{JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "شركة الجوهرة لإنتج محارم الورق ومشتقاته",
        "url": "https://al-jawhara.com",
        "logo": "https://al-jawhara.com/logo.png",
        "foundingDate": "1998",
        "telephone": "+96523263824",
        "email": "info@al-jawhara.com",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "الشعيبة",
          "addressCountry": "KW"
        },
        "sameAs": ["https://al-jawhara.com"]
      })}</script>
    </Helmet>
  );
};

export default Seo;
