// ═══════════════════════════════════════════════════════════
// useTheme HOOK
// ═══════════════════════════════════════════════════════════
// Separated from ThemeProvider file to keep Fast Refresh happy.

import { useContext } from 'react';
import { ThemeContext } from './ThemeProvider';

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
