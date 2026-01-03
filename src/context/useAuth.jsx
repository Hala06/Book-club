// ═══════════════════════════════════════════════════════════
// useAuth HOOK
// ═══════════════════════════════════════════════════════════
// Separated from AuthProvider file to avoid Vite Fast Refresh
// warnings about non-component exports.

import { useContext } from 'react';
import { AuthContext } from './AuthContext';

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
