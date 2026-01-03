// ═══════════════════════════════════════════════════════════
// SIGN IN PAGE
// ═══════════════════════════════════════════════════════════
// Cute and cozy sign-in screen with snowflake animations

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithGoogle } from '../firebase';
import toast from 'react-hot-toast';
import { motion as Motion } from 'framer-motion';
import ThemeToggle from '../components/ThemeToggle';

// ───────────────────────────────────────────────────────────
// Snowflake Animation Component
// ───────────────────────────────────────────────────────────
function Snowflakes() {
  const snowflakes = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: Math.random() * 5,
    duration: 10 + Math.random() * 10,
    size: 4 + Math.random() * 8
  }));

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

  // ─────────────────────────────────────────────────────────
  // Handle Google Sign-In
  // ─────────────────────────────────────────────────────────
  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      toast.success('Welcome! 📚');
      navigate('/dashboard');
    } catch (err) {
      console.error('Sign in error:', err);
      toast.error('Sign-in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] via-[#FFF5E8] to-[#FFE8D6] dark:from-[#1A1815] dark:via-[#252220] dark:to-[#2D2926] text-[var(--text-primary)] flex flex-col relative overflow-hidden transition-colors duration-300">
      
      {/* ───────────────────────────────────────────────── */}
      {/* Animated Snowflakes */}
      {/* ───────────────────────────────────────────────── */}
      <Snowflakes />

      {/* ───────────────────────────────────────────────── */}
      {/* Animated Background Orbs */}
      {/* ───────────────────────────────────────────────── */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <Motion.div
          className="absolute top-20 right-20 w-96 h-96 bg-[#B4E7CE]/20 dark:bg-[#B4E7CE]/10 rounded-full filter blur-[100px]"
          animate={{ x: [0, -30, 0], y: [0, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        />
        <Motion.div
          className="absolute bottom-20 left-20 w-96 h-96 bg-[#FFB8D1]/20 dark:bg-[#FFB8D1]/10 rounded-full filter blur-[100px]"
          animate={{ x: [0, 40, 0], y: [0, -40, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* ───────────────────────────────────────────────── */}
      {/* Header */}
      {/* ───────────────────────────────────────────────── */}
      <header className="mx-auto w-full max-w-6xl px-6 py-6 flex items-center justify-between relative z-10">
        <button
          onClick={() => navigate('/')}
          className="text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-2 px-4 py-2 rounded-full hover:bg-[var(--bg-card)] border border-transparent hover:border-[var(--border-color)]"
        >
          ← Back to Home
        </button>
      </header>

      {/* ───────────────────────────────────────────────── */}
      {/* Main Content */}
      {/* ───────────────────────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center px-4 py-10 relative z-10">
        <div className="w-full max-w-6xl grid gap-16 lg:grid-cols-2 items-center">
          
          {/* ─────────────────────────────────────────────── */}
          {/* Left Column: Welcome Text */}
          {/* ─────────────────────────────────────────────── */}
          <Motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-color)] bg-[var(--bg-card)] px-5 py-2 text-sm font-medium text-[var(--text-secondary)] mb-8 shadow-sm">
              ✨ Real-time • 💬 Comments • 👥 Friends
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6" style={{ fontFamily: 'var(--font-reading)' }}>
              Welcome to <br/>
              <span className="bg-gradient-to-r from-[#D4845C] to-[#E8B17A] dark:from-[#E8B17A] dark:to-[#F0C794] bg-clip-text text-transparent">
                BookClub Live
              </span>
            </h1>
            
            <p className="text-xl text-[var(--text-secondary)] mb-10 leading-relaxed max-w-lg">
              Your cozy digital corner to read together, highlight together, and share moments with friends in real-time.
            </p>

            {/* ───────────────────────────────────────────── */}
            {/* Sign In Button */}
            {/* ───────────────────────────────────────────── */}
            <Motion.button
              whileHover={{ scale: 1.03, boxShadow: '0 25px 50px rgba(212, 132, 92, 0.3)' }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSignIn}
              disabled={isLoading}
              className="group relative inline-flex items-center justify-center gap-4 rounded-2xl bg-[var(--accent-primary)] text-white px-10 py-5 text-lg font-bold shadow-2xl hover:shadow-3xl transition-all disabled:opacity-60 disabled:cursor-not-allowed w-full sm:w-auto"
            >
              {isLoading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span className="text-3xl">🔵</span>
                  <span>Sign in with Google</span>
                  <Motion.span 
                    className="text-2xl"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </Motion.span>
                </>
              )}
            </Motion.button>

            <p className="mt-6 text-sm text-[var(--text-secondary)]">
              By signing in, you agree to be nice and have fun! 🎈
            </p>
          </Motion.div>

          {/* ─────────────────────────────────────────────── */}
          {/* Right Column: Decorative Card with Books Image */}
          {/* ─────────────────────────────────────────────── */}
          <Motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            {/* Decorative Background Blur */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#E8B17A]/20 to-[#B4E7CE]/20 rounded-[3rem] blur-3xl opacity-60 transform rotate-6" />
            
            {/* Main Card */}
            <div className="relative bg-[var(--bg-card)] border-2 border-[var(--border-color)] rounded-[3rem] p-10 shadow-2xl overflow-hidden backdrop-blur-sm">
              
              {/* Decorative Circles */}
              <Motion.div 
                className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-[#E8B17A]/20 to-[#B4E7CE]/20 dark:from-[#E8B17A]/10 dark:to-[#B4E7CE]/10 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              />
              <Motion.div 
                className="absolute -bottom-12 -left-12 w-48 h-48 bg-gradient-to-br from-[#FFB8D1]/20 to-[#E8B17A]/20 dark:from-[#FFB8D1]/10 dark:to-[#E8B17A]/10 rounded-full"
                animate={{ rotate: -360 }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
              />

              {/* Card Content */}
              <div className="relative z-10 flex flex-col items-center text-center space-y-8 py-8">
                <Motion.div 
                  className="mb-2"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <img src="/books.png" alt="Books" className="w-32 h-32 object-contain" />
                </Motion.div>
                
                <h3 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-reading)' }}>
                  Ready to read?
                </h3>
                
                <p className="text-[var(--text-secondary)] text-lg max-w-sm">
                  Join thousands of readers sharing their thoughts and highlights in real-time.
                </p>
                
                {/* Feature Grid */}
                <div className="grid grid-cols-3 gap-4 w-full mt-6">
                  <Motion.div 
                    className="bg-[var(--bg-secondary)] p-4 rounded-2xl text-center"
                    whileHover={{ scale: 1.05, y: -5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <div className="text-3xl mb-2">📌</div>
                    <div className="text-xs font-bold">Bookmark</div>
                  </Motion.div>
                  
                  <Motion.div 
                    className="bg-[var(--bg-secondary)] p-4 rounded-2xl text-center"
                    whileHover={{ scale: 1.05, y: -5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <div className="text-3xl mb-2">🖍️</div>
                    <div className="text-xs font-bold">Highlight</div>
                  </Motion.div>
                  
                  <Motion.div 
                    className="bg-[var(--bg-secondary)] p-4 rounded-2xl text-center"
                    whileHover={{ scale: 1.05, y: -5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <div className="text-3xl mb-2">💬</div>
                    <div className="text-xs font-bold">Discuss</div>
                  </Motion.div>
                </div>
              </div>
            </div>
          </Motion.div>
        </div>
      </main>
    </div>
  );
}
