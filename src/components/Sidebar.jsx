// ═══════════════════════════════════════════════════════════
// SIDEBAR COMPONENT
// ═══════════════════════════════════════════════════════════
// Provides navigation, user info, and room actions

import { useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { useAuth } from '../context/useAuth';
import { logOut } from '../firebase';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import toast from 'react-hot-toast';

export default function Sidebar({ onShowCreateModal, onJoinRoom }) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');

  const handleLogout = async () => {
    try {
      await logOut();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (err) {
      toast.error('Failed to log out');
      console.error('Logout error:', err);
    }
  };

  const handleJoin = () => {
    if (joinCode.length === 6) {
      onJoinRoom(joinCode);
    } else {
      toast.error('Please enter a valid 6-character room code.');
    }
  };

  return (
    <aside className="w-80 bg-gradient-to-b from-[var(--bg-secondary)] to-[var(--bg-tertiary)] dark:from-[var(--bg-secondary)] dark:to-[var(--bg-tertiary)] p-8 flex flex-col h-screen sticky top-0 shadow-2xl border-r-2 border-[var(--border-color)]">
      
      {/* User Profile Section */}
      <div className="text-center mb-10">
        <Motion.img
          src={currentUser?.photoURL}
          alt={currentUser?.displayName}
          className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-[var(--accent-primary)] shadow-xl ring-4 ring-[var(--accent-primary)]/20"
          whileHover={{ scale: 1.1, rotate: 5 }}
        />
        <h2 className="text-xl font-bold text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-reading)' }}>
          {currentUser?.displayName}
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">{currentUser?.email}</p>
      </div>

      {/* Actions */}
      <div className="flex-grow space-y-6">
        {/* Create Room */}
        <Motion.button
          onClick={onShowCreateModal}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full bg-gradient-to-r from-[#C97943] to-[#D4845C] text-white px-6 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 text-lg"
        >
          <span className="text-2xl">+</span>
          Create Room
        </Motion.button>

        {/* Join Room */}
        <div className="space-y-3">
          <h3 className="font-bold text-[var(--text-primary)] text-lg" style={{ fontFamily: 'var(--font-reading)' }}>Join a Room</h3>
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="ABC123"
            className="w-full px-4 py-3 border-2 border-[var(--border-color)] rounded-lg focus:border-[var(--accent-primary)] focus:outline-none text-center font-mono text-lg uppercase bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50"
            maxLength={6}
          />
          <Motion.button
            onClick={handleJoin}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-[var(--bg-card)] border-2 border-[var(--border-color)] hover:border-[var(--accent-primary)] text-[var(--text-primary)] px-6 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
          >
            Join →
          </Motion.button>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="space-y-4">
        <ThemeToggle />
        <Motion.button
          onClick={handleLogout}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)] transition-colors font-semibold"
        >
          <span>🚪</span>
          Logout
        </Motion.button>
      </div>
    </aside>
  );
}
