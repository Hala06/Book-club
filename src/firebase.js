// ═══════════════════════════════════════════════════════════
// FIREBASE CONFIGURATION & INITIALIZATION
// ═══════════════════════════════════════════════════════════
// This file sets up Firebase services for authentication and 
// real-time database functionality

import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { getDatabase, ref, set, onValue, push, update, remove, onDisconnect } from "firebase/database";

// ───────────────────────────────────────────────────────────
// Firebase Project Configuration
// ───────────────────────────────────────────────────────────
// Environment variables are loaded from .env file (never pushed to GitHub)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL
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

/**
 * Create a new user with email and password
 */
export const signUpWithEmail = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Update user profile with display name
    await updateProfile(userCredential.user, { displayName });
    return userCredential.user;
  } catch (error) {
    console.error("Error signing up with email:", error);
    throw error;
  }
};

/**
 * Sign in an existing user with email and password
 */
export const signInWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error("Error signing in with email:", error);
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
