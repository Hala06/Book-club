import { useTheme } from '../context/useTheme';
import { motion as Motion } from 'framer-motion';

export default function ThemeToggle({ variant = 'pill' }) {
  const { theme, toggleTheme } = useTheme();

  const base =
    'inline-flex items-center justify-center gap-3 font-bold transition-all ' +
    'border-2 border-[var(--border-color)] bg-gradient-to-r from-[var(--bg-card)] to-[var(--bg-secondary)] ' +
    'text-[var(--text-primary)] shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 ' +
    'hover:border-[var(--accent-primary)]';

  const styles =
    variant === 'icon'
      ? base + ' rounded-full w-14 h-14 text-2xl'
      : base + ' rounded-2xl px-6 py-3 text-base';

  return (
    <Motion.button 
      onClick={toggleTheme} 
      className={styles} 
      title="Toggle theme"
      whileHover={{ rotate: theme === 'dark' ? 180 : -180 }}
      transition={{ type: 'spring', stiffness: 200 }}
    >
      {variant === 'icon' ? (theme === 'dark' ? '☀️' : '🌙') : theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
    </Motion.button>
  );
}
