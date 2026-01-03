import { useTheme } from '../context/useTheme';

export default function ThemeToggle({ variant = 'pill' }) {
  const { theme, toggleTheme } = useTheme();

  const base =
    'inline-flex items-center justify-center gap-2 text-sm font-semibold transition-colors ' +
    'border border-(--border-color) bg-(--bg-card) ' +
    'text-(--text-primary) shadow-sm hover:shadow-md';

  const styles =
    variant === 'icon'
      ? base + ' rounded-full w-10 h-10'
      : base + ' rounded-full px-4 py-2';

  return (
    <button onClick={toggleTheme} className={styles} title="Toggle theme">
      {variant === 'icon' ? (theme === 'dark' ? '☀️' : '🌙') : theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
    </button>
  );
}
