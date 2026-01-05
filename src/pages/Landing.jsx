// ═══════════════════════════════════════════════════════════
// LANDING PAGE COMPONENT
// ═══════════════════════════════════════════════════════════
// Welcome screen with 3D animated books, About section, and
// beautiful cozy design with animated snowflakes

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { motion as Motion } from 'framer-motion';
import ThemeToggle from '../components/ThemeToggle';

// ───────────────────────────────────────────────────────────
// Snowflake Animation Component
// ───────────────────────────────────────────────────────────
function Snowflakes() {
  // Generate snowflakes once with useMemo to avoid re-rendering issues
  const snowflakes = useMemo(() => 
    Array.from({ length: 20 }, (_, i) => {
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
    <div className="min-h-screen relative overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
      
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle variant="icon" />
      </div>

      <Snowflakes />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
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

      <div className="relative z-10 flex items-center justify-center min-h-screen p-8">
        <div className="grid lg:grid-cols-2 items-center gap-16 max-w-7xl w-full">
          
          {/* Left Column: Text Content */}
          <div className="text-center lg:text-left">
            <Motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] bg-clip-text text-transparent"
              style={{ fontFamily: 'var(--font-reading)', lineHeight: '1.1' }}
            >
              BookClub Live
            </Motion.h1>

            <Motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25 }}
              className="text-2xl md:text-3xl text-[var(--text-primary)] mb-4 font-semibold"
              style={{ fontFamily: 'var(--font-reading)' }}
            >
              Read Together. Highlight Together. ✨
            </Motion.p>

            <Motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg md:text-xl text-[var(--text-secondary)] max-w-xl mx-auto lg:mx-0 mb-12 leading-relaxed"
            >
              Share the joy of reading with friends in real time. See their highlights, comments, and where they are in the book—all in your cozy digital library.
            </Motion.p>

            <Motion.button
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.55 }}
              whileHover={{ scale: 1.05, boxShadow: '0 25px 50px -12px rgba(201, 121, 67, 0.4)' }}
              whileTap={{ scale: 0.98 }}
              onClick={goToSignIn}
              className="flex items-center gap-4 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white px-10 py-5 rounded-2xl shadow-xl hover:shadow-2xl transition-all text-xl font-bold mx-auto lg:mx-0"
              style={{ fontFamily: 'var(--font-reading)' }}
            >
              <span className="text-3xl">📚</span>
              <span>Get Started</span>
              <span className="text-2xl">→</span>
            </Motion.button>
          </div>

          {/* Right Column: 3D Model */}
          <Motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="w-full h-[500px] lg:h-[600px]"
          >
            <Canvas className="rounded-2xl overflow-hidden" camera={{ position: [0, 0, 6], fov: 45 }}>
              <ambientLight intensity={1.2} color="#FFFBF3" />
              <hemisphereLight intensity={1} groundColor="#E8B17A" color="#FFFBF3" />
              <directionalLight position={[3, 5, 4]} intensity={1.5} color="#FFF5E8" castShadow />
              <directionalLight position={[-3, 3, 2]} intensity={0.8} color="#F0E5D8" />
              <pointLight position={[2, 3, 3]} intensity={0.8} color="#FFE8D6" />
              
              <OrbitControls 
                enableZoom={false} 
                autoRotate 
                autoRotateSpeed={0.5}
                minPolarAngle={Math.PI / 2.5}
                maxPolarAngle={Math.PI / 2.5}
              />
              <BookModel />
            </Canvas>
          </Motion.div>
        </div>
      </div>
    </div>
  );
}
