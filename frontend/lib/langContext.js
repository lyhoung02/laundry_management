import { createContext, useContext, useState, useEffect } from 'react';
import translations from './translations';

const LangContext = createContext();

export function LangProvider({ children }) {
  const [lang, setLang] = useState('en');

  useEffect(() => {
    const saved = localStorage.getItem('lms_lang') || 'en';
    setLang(saved);
  }, []);

  const toggleLang = () => {
    const next = lang === 'en' ? 'km' : 'en';
    setLang(next);
    localStorage.setItem('lms_lang', next);
  };

  const t = (key) => translations[lang]?.[key] || translations['en']?.[key] || key;

  return (
    <LangContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
