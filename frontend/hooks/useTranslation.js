/**
 * useTranslation.js
 * Хук для перевода — работает через useAppState (lang из store)
 * с fallback через LanguageContext
 */
import { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';

// Импортируем JSON переводы
import en from '../locales/en.json';
import ru from '../locales/ru.json';
import kz from '../locales/kz.json';

const translations = { en, ru, kz };

export function useTranslation() {
  const ctx = useContext(LanguageContext);
  const lang = ctx?.lang || 'en';
  const currentLang = translations[lang] || translations['en'];

  /**
   * t('nav.home') → строка из текущего языка
   * t('home.badge', { count: 5 }) → с интерполяцией переменных
   */
  const t = (path, vars) => {
    const keys = path.split('.');
    let result = currentLang;

    for (const key of keys) {
      if (result && typeof result === 'object' && key in result) {
        result = result[key];
      } else {
        // Fallback: пробуем английский
        let fallback = translations['en'];
        for (const k of keys) {
          if (fallback && typeof fallback === 'object' && k in fallback) {
            fallback = fallback[k];
          } else {
            return path; // Ключ не найден
          }
        }
        result = fallback;
        break;
      }
    }

    if (typeof result === 'string' && vars) {
      Object.keys(vars).forEach((v) => {
        result = result.replace(new RegExp(`\\{${v}\\}`, 'g'), String(vars[v]));
      });
    }

    return typeof result === 'string' ? result : path;
  };

  /**
   * Форматирует сообщения из бэкенда, которые приходят как { ru, kz, en }
   */
  const formatMessage = (msg) => {
    if (!msg) return '';
    if (typeof msg === 'string') return msg;
    if (typeof msg === 'object') {
      return msg[lang] || msg['en'] || msg['ru'] || msg['kz'] || Object.values(msg)[0] || '';
    }
    return String(msg);
  };

  return { t, lang, setLang: ctx?.setLang, formatMessage };
}
