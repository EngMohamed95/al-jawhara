import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';
import Seo from '../../components/Seo';
import Reveal from '../../components/Reveal';
import './index.css';

const BASE = 'https://al-jawhara.co/wp-content/uploads';

const clients = [
  // ── تجزئة ──────────────────────────────────────────────
  { name: 'City Center',       nameAr: 'سيتي سنتر',              sectorKey: 'retail',       logo: `${BASE}/2021/02/CityCenter.png` },
  { name: 'Carrefour',         nameAr: 'كارفور',                  sectorKey: 'retail',       logo: `${BASE}/2021/02/carrefour.png` },
  { name: 'Sultan Center',     nameAr: 'سلطان سنتر',              sectorKey: 'retail',       logo: `${BASE}/2021/03/Sultan.png` },
  { name: 'Oncost',            nameAr: 'أونكوست',                 sectorKey: 'retail',       logo: `${BASE}/2021/02/Oncost.png` },

  // ── جمعيات تعاونية ─────────────────────────────────────
  { name: 'Romaitha',          nameAr: 'جمعية الرميثاء',          sectorKey: 'coops',        logo: `${BASE}/2021/02/Romaitha.png` },
  { name: "Ta3awnieh",         nameAr: 'التعاونية',               sectorKey: 'coops',        logo: `${BASE}/2021/02/Ta3awnieh.png` },
  { name: 'Wafra',             nameAr: 'جمعية الوفرة',            sectorKey: 'coops',        logo: `${BASE}/2021/03/Wafra.png` },
  { name: 'Dahia',             nameAr: 'جمعية الضاحية',           sectorKey: 'coops',        logo: `${BASE}/2021/03/Dahia.png` },
  { name: 'Naim',              nameAr: 'جمعية النعيم',            sectorKey: 'coops',        logo: `${BASE}/2021/03/Naim.png` },
  { name: 'Solibikhat',        nameAr: 'جمعية الصليبيخات',        sectorKey: 'coops',        logo: `${BASE}/2021/03/Solibikhat.png` },
  { name: 'Salwa',             nameAr: 'جمعية سلوى',              sectorKey: 'coops',        logo: `${BASE}/2021/02/Salwa.png` },
  { name: 'Jabrieh',           nameAr: 'جمعية الجابرية',          sectorKey: 'coops',        logo: `${BASE}/2021/03/Jabrieh.png` },
  { name: 'Saad',              nameAr: 'جمعية سعد العبدالله',     sectorKey: 'coops',        logo: `${BASE}/2021/02/Saad.png` },
  { name: 'Sora',              nameAr: 'جمعية الصوابر',           sectorKey: 'coops',        logo: `${BASE}/2021/03/Sora.png` },
  { name: 'Salam',             nameAr: 'جمعية السلام',            sectorKey: 'coops',        logo: `${BASE}/2021/02/Salam.png` },
  { name: 'Adan',              nameAr: 'جمعية العدان',            sectorKey: 'coops',        logo: `${BASE}/2021/02/Adan.png` },
  { name: 'Jothen',            nameAr: 'جمعية الجثوم',            sectorKey: 'coops',        logo: `${BASE}/2021/03/Jothen.png` },
  { name: 'Salmieh',           nameAr: 'جمعية السالمية',          sectorKey: 'coops',        logo: `${BASE}/2021/02/Salmieh.png` },
  { name: 'Bayan',             nameAr: 'جمعية البيان',            sectorKey: 'coops',        logo: `${BASE}/2021/02/Bayan.png` },
  { name: 'Kaifan',            nameAr: 'جمعية كيفان',             sectorKey: 'coops',        logo: `${BASE}/2021/02/Kaifan.png` },
  { name: 'Khaldieh',          nameAr: 'جمعية الخالدية',          sectorKey: 'coops',        logo: `${BASE}/2021/03/Khaldieh.png` },
  { name: 'Abdali',            nameAr: 'جمعية العبدلي',           sectorKey: 'coops',        logo: `${BASE}/2021/03/Abdali.png` },
  { name: 'Souq',              nameAr: 'سوق',                     sectorKey: 'coops',        logo: `${BASE}/2021/03/Souq.png` },
  { name: 'Chamieh',           nameAr: 'جمعية الشامية',           sectorKey: 'coops',        logo: `${BASE}/2022/11/Chamieh.png` },
  { name: 'Ahmadi',            nameAr: 'جمعية الأحمدي',           sectorKey: 'coops',        logo: `${BASE}/2022/11/Ahmadi.png` },
  { name: 'Shohadaa',          nameAr: 'جمعية الشهداء',           sectorKey: 'coops',        logo: `${BASE}/2022/11/Shohadaa.png` },
  { name: 'Shaab',             nameAr: 'جمعية الشعب',             sectorKey: 'coops',        logo: `${BASE}/2022/11/Shaab.png` },
  { name: 'Sadeek',            nameAr: 'جمعية الصديق',            sectorKey: 'coops',        logo: `${BASE}/2022/11/Sadeek.png` },
  { name: 'Saber Ali',         nameAr: 'جمعية صبر علي',           sectorKey: 'coops',        logo: `${BASE}/2022/11/SaberAli.png` },
  { name: 'Sabah Ahmad',       nameAr: 'جمعية صباح الأحمد',       sectorKey: 'coops',        logo: `${BASE}/2022/11/SabahAhmad.png` },
  { name: 'Reqa',              nameAr: 'جمعية الرقعي',            sectorKey: 'coops',        logo: `${BASE}/2022/11/Reqa.png` },
  { name: 'Qayrawan',          nameAr: 'جمعية القيروان',          sectorKey: 'coops',        logo: `${BASE}/2022/11/Qayrawan.png` },
  { name: 'Halifah',           nameAr: 'جمعية الخليفات',          sectorKey: 'coops',        logo: `${BASE}/2022/11/Halifah.png` },
  { name: 'Fayhaa',            nameAr: 'جمعية الفيحاء',           sectorKey: 'coops',        logo: `${BASE}/2022/11/Fayhaa.png` },
  { name: 'Fahaihel',          nameAr: 'جمعية الفحيحيل',          sectorKey: 'coops',        logo: `${BASE}/2022/11/Fahaihel.png` },
  { name: 'Salibieh',          nameAr: 'جمعية الصليبية',          sectorKey: 'coops',        logo: `${BASE}/2022/11/Salibieh.png` },

  // ── كافيهات ─────────────────────────────────────────────
  { name: 'Starbucks',         nameAr: 'ستاربكس',                 sectorKey: 'cafes',        logo: `${BASE}/2022/12/starbucks.png` },
  { name: 'Bell Cafe',         nameAr: 'بيل كافيه',               sectorKey: 'cafes',        logo: `${BASE}/2021/02/BellCafe.png` },
  { name: 'Zoom',              nameAr: 'زووم',                    sectorKey: 'cafes',        logo: `${BASE}/2021/02/Zoom.png` },
  { name: 'Second Cup',        nameAr: 'سكند كاب',                sectorKey: 'cafes',        logo: `${BASE}/2021/02/SecondCup.png` },
  { name: 'Coffee',            nameAr: 'كوفي',                    sectorKey: 'cafes',        logo: `${BASE}/2021/02/Coffee.png` },
  { name: '21 Degrees',        nameAr: '21 درجة',                 sectorKey: 'cafes',        logo: `${BASE}/2021/02/21degrees.png` },

  // ── مطاعم ───────────────────────────────────────────────
  { name: "Chili's",           nameAr: 'تشيليز',                  sectorKey: 'restaurants',  logo: `${BASE}/2020/09/Chilis.png` },
  { name: 'Kababji',           nameAr: 'كبابجي',                  sectorKey: 'restaurants',  logo: `${BASE}/2021/02/Kababji.png` },
  { name: 'Fouchon',           nameAr: 'فوشون',                   sectorKey: 'restaurants',  logo: `${BASE}/2020/09/Fouchon.png` },
  { name: 'Maraya',            nameAr: 'مرايا',                   sectorKey: 'restaurants',  logo: `${BASE}/2020/09/Maraya.png` },
  { name: 'Marsa',             nameAr: 'مرسى',                    sectorKey: 'restaurants',  logo: `${BASE}/2020/09/Marsa.png` },
  { name: 'Nurai',             nameAr: 'نوراي',                   sectorKey: 'restaurants',  logo: `${BASE}/2020/09/Nurai.png` },
  { name: 'Offside',           nameAr: 'أوفسايد',                 sectorKey: 'restaurants',  logo: `${BASE}/2020/09/Offside.png` },
  { name: 'Casa',              nameAr: 'كاسا',                    sectorKey: 'restaurants',  logo: `${BASE}/2020/09/casa.png` },
  { name: 'E-Club',            nameAr: 'إي كلوب',                 sectorKey: 'restaurants',  logo: `${BASE}/2020/09/eclub.png` },
  { name: 'Pavillion',         nameAr: 'بافيليون',                sectorKey: 'restaurants',  logo: `${BASE}/2020/09/Pavillion.png` },
  { name: 'Khoukh',            nameAr: 'الخوخ',                   sectorKey: 'restaurants',  logo: `${BASE}/2020/09/Khoukh.png` },
  { name: 'Izmir',             nameAr: 'إزمير',                   sectorKey: 'restaurants',  logo: `${BASE}/2020/09/Izmir.png` },
  { name: 'Harayer',           nameAr: 'حراير',                   sectorKey: 'restaurants',  logo: `${BASE}/2020/09/Harayer.png` },
  { name: 'Mais',              nameAr: 'ميس',                     sectorKey: 'restaurants',  logo: `${BASE}/2021/02/Mais.png` },
  { name: 'Kasap',             nameAr: 'كساب',                    sectorKey: 'restaurants',  logo: `${BASE}/2021/02/Kasap.png` },
  { name: 'Lite',              nameAr: 'لايت',                    sectorKey: 'restaurants',  logo: `${BASE}/2021/02/Lite.png` },
  { name: 'Dosary',            nameAr: 'الدوسري',                 sectorKey: 'restaurants',  logo: `${BASE}/2021/02/Dosary.png` },
  { name: 'Crepe',             nameAr: 'كريب',                    sectorKey: 'restaurants',  logo: `${BASE}/2021/02/Crepe.png` },
  { name: 'Cacoa',             nameAr: 'كاكاو',                   sectorKey: 'restaurants',  logo: `${BASE}/2021/02/Cacoa.png` },
  { name: 'Bun',               nameAr: 'بن',                      sectorKey: 'restaurants',  logo: `${BASE}/2021/02/Bun.png` },
  { name: 'Alpanetto',         nameAr: 'ألبانيتو',                sectorKey: 'restaurants',  logo: `${BASE}/2021/02/Alpanetto.png` },
  { name: 'Which Wich',        nameAr: 'ويتش ويتش',               sectorKey: 'restaurants',  logo: `${BASE}/2021/03/Which.png` },
  { name: 'Spice',             nameAr: 'سبايس',                   sectorKey: 'restaurants',  logo: `${BASE}/2021/03/Spice.png` },
  { name: 'Shrimpy',           nameAr: 'شريمبي',                  sectorKey: 'restaurants',  logo: `${BASE}/2021/03/Shrimpy.png` },
  { name: 'Seal',              nameAr: 'سيل',                     sectorKey: 'restaurants',  logo: `${BASE}/2021/03/Seal.png` },
  { name: 'Safir',             nameAr: 'السفير',                  sectorKey: 'restaurants',  logo: `${BASE}/2021/03/Safir.png` },
  { name: 'Rodan',             nameAr: 'رودان',                   sectorKey: 'restaurants',  logo: `${BASE}/2021/03/Rodan.png` },
  { name: 'Plams',             nameAr: 'بلامز',                   sectorKey: 'restaurants',  logo: `${BASE}/2021/03/Plams.png` },
  { name: 'Ocean Basket',      nameAr: 'أوشن باسكت',              sectorKey: 'restaurants',  logo: `${BASE}/2021/03/OceanBasket.png` },
  { name: 'Maazzib',           nameAr: 'معازيب',                  sectorKey: 'restaurants',  logo: `${BASE}/2021/03/Maazzib.png` },
  { name: 'Le Royal',          nameAr: 'لو رويال',                sectorKey: 'restaurants',  logo: `${BASE}/2021/03/LeRoyal.png` },
  { name: 'Lazurd',            nameAr: 'لازورد',                  sectorKey: 'restaurants',  logo: `${BASE}/2021/03/Lazurd.png` },
  { name: 'Land of Tahi',      nameAr: 'لاند أوف تاهي',          sectorKey: 'restaurants',  logo: `${BASE}/2021/03/LandofTahi.png` },
  { name: 'Kosebasi',          nameAr: 'كوزيباشي',                sectorKey: 'restaurants',  logo: `${BASE}/2021/03/Kosebasi.png` },
  { name: 'Jani',              nameAr: 'جاني',                    sectorKey: 'restaurants',  logo: `${BASE}/2021/03/Jani.png` },
  { name: 'Hush',              nameAr: 'هاش',                     sectorKey: 'restaurants',  logo: `${BASE}/2021/03/Hush.png` },
  { name: 'Gia',               nameAr: 'جيا',                     sectorKey: 'restaurants',  logo: `${BASE}/2021/03/Gia.png` },
  { name: 'Frosting',          nameAr: 'فروستينج',                sectorKey: 'restaurants',  logo: `${BASE}/2021/03/Frosting.png` },
  { name: 'Franji',            nameAr: 'فرنجي',                   sectorKey: 'restaurants',  logo: `${BASE}/2021/03/Franji.png` },
  { name: 'Diet Car',          nameAr: 'دايت كار',                sectorKey: 'restaurants',  logo: `${BASE}/2021/03/DietCar.png` },
  { name: 'Danish',            nameAr: 'دانيش',                   sectorKey: 'restaurants',  logo: `${BASE}/2021/03/DANISH.png` },
  { name: 'Crazy Chicken',     nameAr: 'كريزي تشيكن',             sectorKey: 'restaurants',  logo: `${BASE}/2021/03/CrazyChicken.png` },
  { name: 'Cardamon',          nameAr: 'كاردامون',                sectorKey: 'restaurants',  logo: `${BASE}/2021/03/Cardamon.png` },
  { name: 'Bee Salt',          nameAr: 'بي سالت',                 sectorKey: 'restaurants',  logo: `${BASE}/2021/03/BeeSalt.png` },
  { name: 'Bazza',             nameAr: 'بازا',                    sectorKey: 'restaurants',  logo: `${BASE}/2021/03/Bazza.png` },
  { name: 'Ayyame',            nameAr: 'أيامي',                   sectorKey: 'restaurants',  logo: `${BASE}/2021/03/Ayyame.png` },
  { name: "Applebee's",        nameAr: 'آبلبيز',                  sectorKey: 'restaurants',  logo: `${BASE}/2021/03/Applebees.png` },
  { name: 'Anoosh',            nameAr: 'أنوش',                    sectorKey: 'restaurants',  logo: `${BASE}/2021/03/Anoosh.png` },
  { name: 'Adams',             nameAr: 'آدامز',                   sectorKey: 'restaurants',  logo: `${BASE}/2021/03/Adams.png` },

  // ── توصيل طعام ─────────────────────────────────────────
  { name: 'Talabat',           nameAr: 'طلبات',                   sectorKey: 'delivery',     logo: `${BASE}/2022/12/talabat.png` },
  { name: 'Taw9eel',           nameAr: 'توصيل',                   sectorKey: 'delivery',     logo: `${BASE}/2022/12/taw9eel.png` },
  { name: 'Trolley',           nameAr: 'تروليه',                  sectorKey: 'delivery',     logo: `${BASE}/2022/12/trolley.png` },

  // ── فنادق ونوادي ────────────────────────────────────────
  { name: 'Regency',           nameAr: 'ريجنسي',                  sectorKey: 'hotels',       logo: `${BASE}/2021/02/Regency.png` },
  { name: 'Raddison',          nameAr: 'راديسون',                 sectorKey: 'hotels',       logo: `${BASE}/2021/02/Raddison.png` },
  { name: 'Novitta',           nameAr: 'نوفيتا',                  sectorKey: 'hotels',       logo: `${BASE}/2021/02/Novitta.png` },
  { name: 'New Park',          nameAr: 'نيو بارك',                sectorKey: 'hotels',       logo: `${BASE}/2021/02/NewPark.png` },
  { name: 'Mobarak',           nameAr: 'المبارك',                 sectorKey: 'hotels',       logo: `${BASE}/2021/02/Mobarak.png` },
  { name: 'Royal',             nameAr: 'رويال',                   sectorKey: 'hotels',       logo: `${BASE}/2020/09/Royal.png` },
  { name: 'Jazeera',           nameAr: 'الجزيرة',                 sectorKey: 'hotels',       logo: `${BASE}/2021/02/Jazeera.png` },
  { name: 'Fatira',            nameAr: 'فطيرة',                   sectorKey: 'hotels',       logo: `${BASE}/2021/02/Fatira.png` },
  { name: 'Wezara',            nameAr: 'الوزارة',                 sectorKey: 'hotels',       logo: `${BASE}/2021/02/Wezara.png` },
];

const getInitials = (name) => name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

const ClientCard = ({ client, sectorLabel, lang }) => {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div className="client-card">
      <div className="client-logo-wrap">
        {!imgFailed ? (
          <img
            className="client-logo-img"
            src={client.logo}
            alt={client.name}
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="client-logo-fallback">
            {getInitials(client.name)}
          </div>
        )}
      </div>
      <div className="client-name">{lang === 'en' ? client.name : client.nameAr}</div>
      <div className="client-sector">
        <i className="fas fa-tag" aria-hidden="true"></i>
        {sectorLabel}
      </div>
    </div>
  );
};

const Clients = () => {
  const { t, lang } = useLanguage();
  const { siteContent: sc } = useApp();
  const [activeSectorKey, setActiveSectorKey] = useState('all');

  const sectorKeys = ['all', ...new Set(clients.map(c => c.sectorKey))];

  const getSectorLabel = (key) =>
    key === 'all' ? t('clients.all') : t(`clients.sectors.${key}`);

  const filtered = activeSectorKey === 'all'
    ? clients
    : clients.filter(c => c.sectorKey === activeSectorKey);

  const stats = t('clients.stats');

  return (
    <>
      <Seo
        title={t('clients.title')}
        description={t('clients.sub')}
        keywords="عملاء الجوهرة، كارفور الكويت، سلطان سنتر، جمعيات تعاونية، مطاعم الكويت"
      />

      <header className="page-header" style={sc?.clientsHeaderImg ? { backgroundImage: `url(${sc.clientsHeaderImg})`, backgroundSize:'cover', backgroundPosition:'center' } : {}}>
        <div className="container">
          <div className="page-header-content">
            <div className="page-header-icon" aria-hidden="true"><i className="fas fa-handshake"></i></div>
            <h1>{t('clients.title')}</h1>
            <p>{t('clients.sub')}</p>
          </div>
        </div>
      </header>

      <section className="section">
        <div className="container">

          <div className="clients-stats" role="list" aria-label="إحصائيات">
            {Array.isArray(stats) && stats.map((s, i) => (
              <Reveal key={i} delay={i * 80} direction="up">
                <div className="clients-stat-card" role="listitem">
                  <i className={`fas ${s.icon} clients-stat-icon`} aria-hidden="true"></i>
                  <div className="clients-stat-num">{s.num}</div>
                  <div className="clients-stat-label">{typeof s.label === 'object' ? (s.label[lang] || s.label.ar) : s.label}</div>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="filters filters-center" role="group" aria-label="تصفية حسب القطاع">
            {sectorKeys.map(key => (
              <button
                key={key}
                className={`filter-btn${activeSectorKey === key ? ' active' : ''}`}
                onClick={() => setActiveSectorKey(key)}
                aria-pressed={activeSectorKey === key}
              >
                {getSectorLabel(key)}
              </button>
            ))}
          </div>

          <div className="clients-grid" role="list" aria-label="قائمة العملاء">
            {filtered.map((c, i) => (
              <Reveal key={i} delay={(i % 5) * 60} direction="up">
                <div role="listitem">
                  <ClientCard
                    client={c}
                    sectorLabel={getSectorLabel(c.sectorKey)}
                    lang={lang}
                  />
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal direction="up" delay={100}>
            <div className="clients-cta">
              <i className="fas fa-handshake clients-cta-icon" aria-hidden="true"></i>
              <h3 className="clients-cta-title">{t('clients.ctaTitle')}</h3>
              <p className="clients-cta-text">{t('clients.ctaText')}</p>
              <Link to="/contact" className="btn btn-green">
                <i className="fas fa-envelope" aria-hidden="true"></i>
                {t('clients.ctaBtn')}
              </Link>
            </div>
          </Reveal>

        </div>
      </section>
    </>
  );
};

export default Clients;
