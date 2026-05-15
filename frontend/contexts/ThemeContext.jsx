/**
 * ThemeContext.jsx
 * Управление темой: dark | light | bw
 * Сохраняется в localStorage
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

export const THEMES = ['dark', 'light', 'bw'];

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    if (typeof window === 'undefined') return 'dark';
    const saved = localStorage.getItem('aegis-theme');
    return THEMES.includes(saved) ? saved : 'dark';
  });

  const setTheme = useCallback((t) => {
    if (!THEMES.includes(t)) return;
    setThemeState(t);
    if (typeof window !== 'undefined') {
      localStorage.setItem('aegis-theme', t);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
