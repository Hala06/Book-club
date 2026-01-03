// ═══════════════════════════════════════════════════════════
// AUTHENTICATION CONTEXT
// ═══════════════════════════════════════════════════════════
// Provides authentication state throughout the app

import { createContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

// ───────────────────────────────────────────────────────────
// Create Context
// ───────────────────────────────────────────────────────────
export const AuthContext = createContext(null);

// ───────────────────────────────────────────────────────────
// Auth Provider Component
// ───────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ─────────────────────────────────────────────────────────
  // Listen to auth state changes
  // ─────────────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Cleanup subscription
    return unsubscribe;
  }, []);

  // ─────────────────────────────────────────────────────────
  // Context value
  // ─────────────────────────────────────────────────────────
  const value = {
    currentUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
