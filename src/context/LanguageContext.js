import { createContext, useContext, useState, useLayoutEffect } from 'react';
import translations from '../translations';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [lang, setLangState] = useState(() => localStorage.getItem('jawhara_lang') || 'ar');

  // useLayoutEffect (not useEffect) so dir/lang update before the browser
  // paints the new text — otherwise English strings briefly render inside
  // an RTL document, which flips trailing punctuation like "?" to the front.
  useLayoutEffect(() => {
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
  }, [lang]);

  const setLang = (l) => {
    setLangState(l);
    localStorage.setItem('jawhara_lang', l);
  };

  const t = (key) => {
    const parts = key.split('.');
    let node = translations;
    for (const p of parts) {
      if (!node || typeof node !== 'object') return key;
      node = node[p];
    }
    if (node && typeof node === 'object' && (node.ar || node.en)) {
      return node[lang] ?? node.ar ?? key;
    }
    return typeof node === 'string' ? node : key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be inside LanguageProvider');
  return ctx;
};
