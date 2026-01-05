// ═══════════════════════════════════════════════════════════
// SIGN IN PAGE
// ═══════════════════════════════════════════════════════════
// Cute and cozy sign-in screen with snowflake animations

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  signInWithGoogle,
  signUpWithEmail,
  signInWithEmail 
} from '../firebase';
import toast from 'react-hot-toast';
import { motion as Motion } from 'framer-motion';
import ThemeToggle from '../components/ThemeToggle';

// ───────────────────────────────────────────────────────────
// Snowflake Animation Component
// ───────────────────────────────────────────────────────────
function Snowflakes() {
  const snowflakes = useMemo(() => 
    Array.from({ length: 15 }, (_, i) => {
      const randomLeft = Math.random() * 100;
      const randomDelay = Math.random() * 5;
      const randomDuration = 10 + Math.random() * 10;
      const randomSize = 4 + Math.random() * 8;
      
      return {
        id: i,
        left: `${randomLeft}%`,
        delay: randomDelay,
        duration: randomDuration,
        size: randomSize
      };
    })
  , []);

  return (
    <div className="fixed inset-0 pointer-events-none z-5 overflow-hidden">
      {snowflakes.map(flake => (
        <Motion.div
          key={flake.id}
          className="absolute rounded-full bg-white/30 backdrop-blur-sm"
          style={{
            left: flake.left,
            width: flake.size,
            height: flake.size,
            top: '-10px',
          }}
          animate={{
            y: ['0vh', '110vh'],
            x: [0, Math.sin(flake.id) * 50, 0],
            opacity: [0, 1, 1, 0]
          }}
          transition={{
            duration: flake.duration,
            delay: flake.delay,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
      ))}
    </div>
  );
}

export default function SignIn() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false); // To toggle between Sign In and Sign Up

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  // ─────────────────────────────────────────────────────────
  // Handle Google Sign-In
  // ─────────────────────────────────────────────────────────
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      toast.success('Welcome! 📚');
      navigate('/dashboard');
    } catch (err) {
      console.error('Sign in error:', err);
      toast.error(err.message || 'Sign-in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────
  // Handle Email/Password Sign In or Sign Up
  // ─────────────────────────────────────────────────────────
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password, displayName);
        toast.success('Account created successfully! Welcome! 📚');
      } else {
        await signInWithEmail(email, password);
        toast.success('Welcome back! 📚');
      }
      navigate('/dashboard');
    } catch (err) {
      console.error(`${isSignUp ? 'Sign up' : 'Sign in'} error:`, err);
      toast.error(err.message || `${isSignUp ? 'Sign up' : 'Sign in'} failed. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center relative overflow-hidden transition-colors duration-300 p-4">
      
      <div className="fixed top-6 right-6 z-20">
        <ThemeToggle variant="icon" />
      </div>

      <div className="absolute inset-0 overflow-hidden z-0">
        <Motion.div
          className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-[var(--accent-primary)]/15 rounded-full filter blur-[150px]"
          animate={{ x: [0, 100, 0], y: [0, -80, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        />
        <Motion.div
          className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-[var(--accent-secondary)]/15 rounded-full filter blur-[150px]"
          animate={{ x: [0, -100, 0], y: [0, 80, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <div className="relative z-10 grid lg:grid-cols-2 items-center max-w-6xl w-full bg-[var(--bg-card)]/80 backdrop-blur-2xl border-2 border-[var(--border-color)] rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Left side - Image */}
        <div className="hidden lg:flex items-center justify-center h-full p-8 bg-gradient-to-br from-[var(--accent-primary)]/10 to-[var(--accent-secondary)]/10">
          <Motion.img 
            src="/books.png" 
            alt="Books illustration" 
            className="w-full max-w-sm"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          />
        </div>

        {/* Right side - Form */}
        <Motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="p-12"
        >
          <div className="text-center mb-8">
            <h1 
              className="text-5xl font-bold mb-2 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] bg-clip-text text-transparent"
              style={{ fontFamily: 'var(--font-reading)' }}
            >
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h1>
            
            <p className="text-lg text-[var(--text-secondary)]">
              {isSignUp ? 'Join the club!' : 'Sign in to access your library.'}
            </p>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-6">
            {isSignUp && (
              <input
                type="text"
                placeholder="Display Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="w-full px-5 py-4 border-2 border-[var(--border-color)] rounded-xl focus:border-[var(--accent-primary)] focus:outline-none bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/60 font-semibold transition-all"
              />
            )}
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-5 py-4 border-2 border-[var(--border-color)] rounded-xl focus:border-[var(--accent-primary)] focus:outline-none bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/60 font-semibold transition-all"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-5 py-4 border-2 border-[var(--border-color)] rounded-xl focus:border-[var(--accent-primary)] focus:outline-none bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/60 font-semibold transition-all"
            />

            <Motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02, boxShadow: '0 10px 30px -10px rgba(201, 121, 67, 0.4)' }}
              whileTap={{ scale: 0.99 }}
              className="w-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all text-lg font-bold disabled:opacity-60"
            >
              {isLoading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
            </Motion.button>
          </form>

          <div className="flex items-center my-6">
            <hr className="flex-grow border-t border-[var(--border-color)]" />
            <span className="mx-4 text-sm font-semibold text-[var(--text-secondary)]">OR</span>
            <hr className="flex-grow border-t border-[var(--border-color)]" />
          </div>

          <Motion.button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.99 }}
            className="w-full flex items-center justify-center gap-3 bg-[var(--bg-secondary)] border-2 border-[var(--border-color)] text-[var(--text-primary)] px-8 py-4 rounded-xl shadow-md hover:shadow-lg transition-all text-lg font-bold disabled:opacity-60"
          >
            <svg className="w-6 h-6" role="img" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><title>Google</title><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.62 1.9-4.63 1.9-3.87 0-7-3.13-7-7s3.13-7 7-7c2.25 0 3.67.87 4.55 1.7l2.47-2.47C18.68 2.05 16.14 1 12.48 1 7.03 1 3 5.03 3 9.5s4.03 8.5 9.48 8.5c2.9 0 5.2-1 6.85-2.65.85-.85 1.5-2.15 1.5-3.85 0-.7-.1-1.35-.25-1.95H12.48z"/></svg>
            <span>Sign In with Google</span>
          </Motion.button>

          <div className="mt-8 text-center">
            <p className="text-[var(--text-secondary)]">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <button 
                onClick={() => setIsSignUp(!isSignUp)} 
                className="font-bold text-[var(--accent-primary)] hover:underline ml-2"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </Motion.div>
      </div>
    </div>
  );
}
