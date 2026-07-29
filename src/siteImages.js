/* الصورة الجماعية لفريق العمل — غلاف موحّد لكل الصفحات الداخلية */
export const DEFAULT_PAGE_HEADER = '/Photo gallery/PhotoGallery04.jpg';

/* أغلفة قديمة كانت مضبوطة كقيَم افتراضية في قاعدة البيانات.
   تُتجاهَل لصالح الغلاف الموحّد، بينما أي صورة يختارها المسؤول من لوحة التحكم تُحترم. */
const LEGACY_HEADERS = [
  'unsplash.com',
  '/Photo gallery/PhotoGallery01.jpg',
];

export const resolvePageHeader = (stored) =>
  stored && !LEGACY_HEADERS.some(p => stored.includes(p)) ? stored : DEFAULT_PAGE_HEADER;
