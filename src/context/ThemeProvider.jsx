// ═══════════════════════════════════════════════════════════
// THEME PROVIDER (LIGHT / DARK)
// ═══════════════════════════════════════════════════════════
// Stores the theme in localStorage and toggles Tailwind's
// `dark` class on <html> so all pages can use `dark:*` styles.

import { createContext, useEffect, useMemo, useState } from 'react';

export const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');

  // ─────────────────────────────────────────────────────────
  // Load initial theme from localStorage (or system preference)
  // ─────────────────────────────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem('bookclub.theme');
    if (stored === 'light' || stored === 'dark') {
      setTheme(stored);
      return;
    }

    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches;
    setTheme(prefersDark ? 'dark' : 'light');
  }, []);

  // ─────────────────────────────────────────────────────────
  // Apply theme to <html>
  // ─────────────────────────────────────────────────────────
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');

    localStorage.setItem('bookclub.theme', theme);
  }, [theme]);

  // ─────────────────────────────────────────────────────────
  // Expose stable context value
  // ─────────────────────────────────────────────────────────
  const value = useMemo(() => {
    return {
      theme,
      setTheme,
      toggleTheme: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
    };
  }, [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
