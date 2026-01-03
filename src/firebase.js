// ═══════════════════════════════════════════════════════════
// FIREBASE CONFIGURATION & INITIALIZATION
// ═══════════════════════════════════════════════════════════
// This file sets up Firebase services for authentication and 
// real-time database functionality

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getDatabase, ref, set, onValue, push, update, remove, onDisconnect } from "firebase/database";

// ───────────────────────────────────────────────────────────
// Firebase Project Configuration
// ───────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyC3IWF6CiqkJzRlFY3ZTWnUg-79_vrxoO8",
  authDomain: "bookclub-live.firebaseapp.com",
  projectId: "bookclub-live",
  storageBucket: "bookclub-live.firebasestorage.app",
  messagingSenderId: "894738527082",
  appId: "1:894738527082:web:86b550caeb613efff7ab13",
  databaseURL: "https://bookclub-live-default-rtdb.firebaseio.com/"
};

// ───────────────────────────────────────────────────────────
// Initialize Firebase Services
// ───────────────────────────────────────────────────────────
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);  // Authentication service
export const db = getDatabase(app); // Realtime Database service

// ───────────────────────────────────────────────────────────
// Google Authentication Provider
// ───────────────────────────────────────────────────────────
const googleProvider = new GoogleAuthProvider();

// ═══════════════════════════════════════════════════════════
// AUTHENTICATION FUNCTIONS
// ═══════════════════════════════════════════════════════════

/**
 * Sign in user with Google OAuth
 * Opens popup for Google account selection
 * Returns user data on success
 */
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

/**
 * Sign out current user
 */
export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

// ═══════════════════════════════════════════════════════════
// DATABASE HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════

/**
 * Export database utilities for use in components
 */
export { ref, set, onValue, push, update, remove, onDisconnect };
