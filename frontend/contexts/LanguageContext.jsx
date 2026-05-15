/**
 * LanguageContext.jsx
 * Простой контекст языка — хранит только выбранный язык.
 * Переводы читаются через хук useTranslation из locales/*.json
 */
import { createContext, useContext, useState, useCallback } from 'react';

export const LanguageContext = createContext(null);

const SUPPORTED_LANGS = ['en', 'ru', 'kz'];

export function LanguageProvider({ children }) {
  // Читаем из localStorage при первом рендере
  const [lang, setLangState] = useState(() => {
    if (typeof window === 'undefined') return 'en';
    const saved = localStorage.getItem('aegis-lang');
    return SUPPORTED_LANGS.includes(saved) ? saved : 'en';
  });

  const setLang = useCallback((newLang) => {
    if (!SUPPORTED_LANGS.includes(newLang)) return;
    setLangState(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('aegis-lang', newLang);
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used inside LanguageProvider');
  return ctx;
}
