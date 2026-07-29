import { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import Seo from '../../components/Seo';
import Reveal from '../../components/Reveal';
import { DEFAULT_PAGE_HEADER } from '../../siteImages';
import './index.css';

/*
 * قائمة منسّقة يدوياً: صور المصنع وفريق العمل فقط.
 * مستبعد منها:
 *  - الصور المكرّرة (16=00، 17/23/02=04، 19=06، 10=08، 25=12)
 *  - الصورة 09 (نسخة معطوبة من 08 بشريط أسود على اليسار)
 *  - صور المنتجات (03، 21، 22، 24، 26) — مكانها صفحة المنتجات
 *  - الصورة الجماعية 04 لأنها ظاهرة بالفعل كغلاف الصفحة
 */
const GALLERY_IMAGES = [
  '00', '05', '06', '07', '08', '11',
  '12', '13', '14', '15', '18', '20',
].map(num => ({
  id: num,
  src: `/Photo gallery/PhotoGallery${num}.jpg`,
  titleAr: 'معرض الجوهرة',
  titleEn: 'Al-Jawhara Gallery'
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

      <header className="page-header gallery-header" style={{ backgroundImage: `url('${DEFAULT_PAGE_HEADER}')` }}>
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
