import { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import Seo from '../../components/Seo';
import Reveal from '../../components/Reveal';
import { GALLERY_PAGE_HEADER } from '../../siteImages';
import './index.css';

/*
 * صور المصنع بالترتيب المطلوب:
 * رئيس مجلس الإدارة → المكان والأعمال → المكن وخطوط الإنتاج → المنتجات.
 * الملفات منسوخة من مجلد "Photo gallery" بأسماء مرتّبة ونظيفة تحت /gallery
 * لأن الأسماء الأصلية فيها مسافات وأقواس.
 * مستبعد منها بانرا التصميم (OUR PRODUCTS و Intimate with Hygiene) لأنهما
 * عريضان ويظهران مقصوصين داخل كروت 4:3 — مكانهما أغلفة صفحتَي المنتجات والتواصل.
 */
const GALLERY_IMAGES = [
  // ── رئيس مجلس الإدارة ──
  ['01-ceo-desk',        'رئيس مجلس الإدارة',        'Chairman'],
  ['02-ceo-portrait',    'رئيس مجلس الإدارة',        'Chairman'],
  ['03-ceo-meeting',     'لقاءات العمل',             'Business Meetings'],
  ['04-ceo-office-wide', 'لقاءات العمل',             'Business Meetings'],
  // ── المكان والأعمال ──
  ['05-team-group',      'فريق العمل',               'Our Team'],
  ['06-team-truck',      'فريق العمل والتوزيع',      'Team & Distribution'],
  ['07-warehouse',       'المخازن والتجهيز',         'Warehouse & Handling'],
  // ── المكن وخطوط الإنتاج ──
  ['08-rolls-line',      'خط إنتاج الرولات',         'Paper Roll Line'],
  ['09-rolls-line-2',    'خط إنتاج الرولات',         'Paper Roll Line'],
  ['10-rolls-line-3',    'خط إنتاج الرولات',         'Paper Roll Line'],
  ['11-printing-line',   'خط الطباعة',               'Printing Line'],
  ['12-printing-line-2', 'خط الطباعة',               'Printing Line'],
  ['13-folding-line',    'خط الطي والتغليف',         'Folding & Wrapping Line'],
  ['14-rewinder-line',   'ماكينة إعادة اللف',        'Rewinding Machine'],
  // ── المنتجات ──
  ['15-packing-boxes',   'تعبئة علب المناديل',       'Tissue Box Packing'],
  ['16-packing-rolls',   'تعبئة رولات المطبخ',       'Kitchen Roll Packing'],
].map(([id, titleAr, titleEn]) => ({
  id,
  src: `/gallery-images/${id}.jpg`,
  titleAr,
  titleEn,
}));

const Gallery = () => {
  const { lang } = useLanguage();
  const [activeImgIdx, setActiveImgIdx] = useState(null);

  const openLightbox = (idx) => setActiveImgIdx(idx);
  const closeLightbox = () => setActiveImgIdx(null);

  const prevImage = (e) => {
    e.stopPropagation();
    setActiveImgIdx((prev) => (prev === 0 ? GALLERY_IMAGES.length - 1 : prev - 1));
  };

  const nextImage = (e) => {
    e.stopPropagation();
    setActiveImgIdx((prev) => (prev === GALLERY_IMAGES.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      <Seo
        title={lang === 'ar' ? 'معرض الصور' : 'Photo Gallery'}
        description={
          lang === 'ar'
            ? 'تصفح صور مصنع الجوهرة للمناديل الورقية وخطوط الإنتاج والتصنيع المتطورة لدينا في الكويت.'
            : 'Browse photos of Al-Jawhara factory, production lines, and our advanced manufacturing in Kuwait.'
        }
        keywords="صور مصنع مناديل، مصنع الجوهرة، صور الجوهرة، tissue factory photo gallery"
      />

      <header className="page-header gallery-header" style={{ backgroundImage: `url('${GALLERY_PAGE_HEADER}')` }}>
        <div className="container">
          <div className="page-header-content">
            <div className="page-header-icon" aria-hidden="true">
              <i className="fas fa-images"></i>
            </div>
            <h1>{lang === 'ar' ? 'معرض الصور' : 'Photo Gallery'}</h1>
            <p>
              {lang === 'ar'
                ? 'جولة مصورة داخل مصنعنا وخطوط الإنتاج المتطورة بالشعيبة الصناعية.'
                : 'A photo tour inside our factory and advanced production lines in Shuaiba Industrial Area.'}
            </p>
          </div>
        </div>
      </header>

      <section className="section gallery-section">
        <div className="container">
          <div className="gallery-grid">
            {GALLERY_IMAGES.map((img, idx) => (
              <Reveal key={img.id} delay={(idx % 4) * 60} direction="up">
                <div
                  className="gallery-card"
                  onClick={() => openLightbox(idx)}
                  role="button"
                  tabIndex={0}
                  aria-label={lang === 'ar' ? img.titleAr : img.titleEn}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') openLightbox(idx);
                  }}
                >
                  <div className="gallery-img-wrap">
                    <img
                      src={img.src}
                      alt={lang === 'ar' ? img.titleAr : img.titleEn}
                      className="gallery-img"
                      loading="lazy"
                    />
                    <div className="gallery-overlay">
                      <div className="gallery-zoom-icon">
                        <i className="fas fa-magnifying-glass-plus"></i>
                      </div>
                      <span className="gallery-card-title">
                        {lang === 'ar' ? img.titleAr : img.titleEn}
                      </span>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {activeImgIdx !== null && (
        <div className="lightbox-overlay" onClick={closeLightbox} role="dialog" aria-modal="true">
          <button
            className="lightbox-close"
            onClick={closeLightbox}
            aria-label={lang === 'ar' ? 'إغلاق المعاينة' : 'Close preview'}
          >
            <i className="fas fa-xmark"></i>
          </button>

          <button
            className="lightbox-nav-btn prev-btn"
            onClick={prevImage}
            aria-label={lang === 'ar' ? 'الصورة السابقة' : 'Previous image'}
          >
            <i className="fas fa-chevron-right"></i>
          </button>

          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img
              src={GALLERY_IMAGES[activeImgIdx].src}
              alt=""
              className="lightbox-img"
            />
            <div className="lightbox-caption">
              {lang === 'ar'
                ? GALLERY_IMAGES[activeImgIdx].titleAr
                : GALLERY_IMAGES[activeImgIdx].titleEn}
            </div>
          </div>

          <button
            className="lightbox-nav-btn next-btn"
            onClick={nextImage}
            aria-label={lang === 'ar' ? 'الصورة التالية' : 'Next image'}
          >
            <i className="fas fa-chevron-left"></i>
          </button>
        </div>
      )}
    </>
  );
};

export default Gallery;
