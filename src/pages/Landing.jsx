// ═══════════════════════════════════════════════════════════
// LANDING PAGE COMPONENT
// ═══════════════════════════════════════════════════════════
// Welcome screen with 3D animated books, About section, and
// beautiful cozy design with animated snowflakes

import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { motion as Motion } from 'framer-motion';
import ThemeToggle from '../components/ThemeToggle';

// ───────────────────────────────────────────────────────────
// Snowflake Animation Component
// ───────────────────────────────────────────────────────────
function Snowflakes() {
  const snowflakes = Array.from({ length: 20 }, (_, i) => ({
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

// ───────────────────────────────────────────────────────────
// 3D Book Model Component with Proper Lighting
// ───────────────────────────────────────────────────────────
// Displays books.glb with pastel-colored lighting
function BookModel() {
  const { scene } = useGLTF('/books.glb');
  
  return (
    <primitive 
      object={scene} 
      scale={1.5} 
      position={[0, -1, 0]}
    />
  );
}

// ───────────────────────────────────────────────────────────
// Main Landing Page
// ───────────────────────────────────────────────────────────
export default function Landing() {
  const navigate = useNavigate();

  const goToSignIn = () => navigate('/signin');

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#FFF8F0] via-[#FFF5E8] to-[#FFE8D6] dark:from-[#1A1815] dark:via-[#252220] dark:to-[#2D2926] text-[var(--text-primary)] transition-colors duration-300">
      
      {/* ───────────────────────────────────────────────── */}
      {/* Animated Snowflakes */}
      {/* ───────────────────────────────────────────────── */}
      <Snowflakes />



      {/* ───────────────────────────────────────────────── */}
      {/* Animated Background Gradient Orbs */}
      {/* ───────────────────────────────────────────────── */}
      <div className="absolute inset-0 overflow-hidden">
        <Motion.div
          className="absolute top-10 left-10 w-96 h-96 bg-[#E8B17A]/30 dark:bg-[#E8B17A]/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px]"
          animate={{ x: [0, 60, 0], y: [0, -40, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        />
        <Motion.div
          className="absolute bottom-10 right-10 w-96 h-96 bg-[#B4E7CE]/30 dark:bg-[#B4E7CE]/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px]"
          animate={{ x: [0, -50, 0], y: [0, 50, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
        />
        <Motion.div
          className="absolute top-1/2 left-1/2 w-80 h-80 bg-[#FFB8D1]/20 dark:bg-[#FFB8D1]/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px]"
          animate={{ x: [-40, 40, -40], y: [-40, 40, -40] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* ───────────────────────────────────────────────── */}
      {/* Main Content Container */}
      {/* ───────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-20">
        
        {/* ─────────────────────────────────────────────── */}
        {/* Hero Section */}
        {/* ─────────────────────────────────────────────── */}
        <Motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-6xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-[#D4845C] to-[#E8B17A] dark:from-[#E8B17A] dark:to-[#F0C794] bg-clip-text text-transparent"
          style={{ fontFamily: 'var(--font-reading)' }}
        >
          BookClub Live
        </Motion.h1>

        <Motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-2xl text-[var(--text-secondary)] mb-3 font-medium"
        >
          Read Together. Highlight Together. ✨
        </Motion.p>

        <Motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-lg text-[var(--text-secondary)] max-w-2xl mb-10 text-center leading-relaxed"
        >
          Share the joy of reading with friends in real time. See their highlights, comments, and where they are in the book.
        </Motion.p>

        {/* ─────────────────────────────────────────────── */}
        {/* Get Started Button */}
        {/* ─────────────────────────────────────────────── */}
        <Motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          whileHover={{ scale: 1.05, boxShadow: '0 25px 50px rgba(212, 132, 92, 0.3)' }}
          whileTap={{ scale: 0.98 }}
          onClick={goToSignIn}
          className="flex items-center gap-3 bg-[var(--accent-primary)] text-white px-10 py-5 rounded-2xl shadow-2xl hover:shadow-3xl transition-all text-xl font-bold"
        >
          <span className="text-3xl">📚</span>
          <span>Get Started</span>
          <span>→</span>
        </Motion.button>

        {/* ─────────────────────────────────────────────── */}
        {/* 3D Model & About Section */}
        {/* ─────────────────────────────────────────────── */}
        <div className="mt-16 w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
          
          {/* 3D Book Model Canvas with Enhanced Lighting */}
          <Motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="bg-gradient-to-br from-white/80 to-white/60 dark:from-[#2D2926]/80 dark:to-[#2D2926]/60 rounded-3xl p-6 shadow-2xl backdrop-blur-xl border border-white/40 dark:border-white/10"
          >
            <Canvas className="rounded-2xl overflow-hidden h-96" camera={{ position: [0, 0, 6], fov: 45 }}>
              {/* Enhanced Ambient Lighting for Pastel Colors */}
              <ambientLight intensity={1.2} color="#fff5e8" />
              
              {/* Hemisphere Light for Natural Look */}
              <hemisphereLight intensity={1.0} groundColor="#f0c794" color="#fffbf0" />
              
              {/* Directional Lights with Pastel Tones */}
              <directionalLight position={[3, 5, 4]} intensity={1.5} color="#fff2dd" castShadow />
              <directionalLight position={[-3, 3, 2]} intensity={0.8} color="#f0e5d8" />
              <directionalLight position={[0, -2, 5]} intensity={0.6} color="#e8dfd0" />
              
              {/* Point Lights for Soft Glow */}
              <pointLight position={[2, 3, 3]} intensity={0.8} color="#ffe8d6" />
              <pointLight position={[-2, 2, -2]} intensity={0.5} color="#b4e7ce" />
              
              {/* Spot Light for Highlight */}
              <spotLight position={[0, 5, 0]} intensity={0.6} color="#fff8f0" angle={0.6} penumbra={0.8} />
              
              <BookModel />
              <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1.2} />
            </Canvas>
          </Motion.div>

          {/* About BookClub Section */}
          <Motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-3xl p-8 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">✨</span>
              <h2 className="text-3xl font-bold text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-reading)' }}>
                About BookClub
              </h2>
            </div>
            
            <p className="text-lg text-[var(--text-secondary)] mb-6 leading-relaxed">
              BookClub Live is your cozy digital space to experience books together. 
              Share highlights, leave comments, and see your friends' reactions in real-time.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-[var(--bg-secondary)] rounded-xl">
                <span className="text-2xl">👥</span>
                <div>
                  <h3 className="font-bold text-[var(--text-primary)] mb-1">Read With Friends</h3>
                  <p className="text-sm text-[var(--text-secondary)]">Create rooms, invite friends, and read together in real-time</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-[var(--bg-secondary)] rounded-xl">
                <span className="text-2xl">🖍️</span>
                <div>
                  <h3 className="font-bold text-[var(--text-primary)] mb-1">Highlight & Comment</h3>
                  <p className="text-sm text-[var(--text-secondary)]">Mark your favorite passages and share your thoughts</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-[var(--bg-secondary)] rounded-xl">
                <span className="text-2xl">🎨</span>
                <div>
                  <h3 className="font-bold text-[var(--text-primary)] mb-1">Customize Everything</h3>
                  <p className="text-sm text-[var(--text-secondary)]">Choose your reading style, colors, and layout preferences</p>
                </div>
              </div>
            </div>
          </Motion.div>
        </div>

        {/* ─────────────────────────────────────────────── */}
        {/* Feature Pills */}
        {/* ─────────────────────────────────────────────── */}
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-16 flex flex-wrap justify-center gap-4"
        >
          <div className="bg-[var(--bg-card)] px-6 py-3 rounded-full text-[var(--text-primary)] border border-[var(--border-color)] shadow-md hover:shadow-lg transition-shadow">
            ✨ Real-time Highlights
          </div>
          <div className="bg-[var(--bg-card)] px-6 py-3 rounded-full text-[var(--text-primary)] border border-[var(--border-color)] shadow-md hover:shadow-lg transition-shadow">
            💬 Live Comments
          </div>
          <div className="bg-[var(--bg-card)] px-6 py-3 rounded-full text-[var(--text-primary)] border border-[var(--border-color)] shadow-md hover:shadow-lg transition-shadow">
            👥 Read with Friends
          </div>
          <div className="bg-[var(--bg-card)] px-6 py-3 rounded-full text-[var(--text-primary)] border border-[var(--border-color)] shadow-md hover:shadow-lg transition-shadow">
            📖 Page Flip Animations
          </div>
        </Motion.div>
      </div>
    </div>
  );
}
