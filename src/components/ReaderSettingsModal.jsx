// ═══════════════════════════════════════════════════════════
// READER SETTINGS MODAL COMPONENT
// ═══════════════════════════════════════════════════════════
// Comprehensive modal for adjusting reading view preferences:
// - Font family and size
// - Line height
// - Color themes (background & text)
// - Reading orientation (vertical scroll or horizontal page flip)

import { motion as Motion, AnimatePresence } from 'framer-motion';

// ───────────────────────────────────────────────────────────
// Font Options
// ───────────────────────────────────────────────────────────
const fontOptions = [
  { name: 'Cozy Serif', value: 'var(--font-reading)' },
  { name: 'Modern Sans', value: 'var(--font-ui)' },
  { name: 'Mono Space', value: 'monospace' },
];

// ───────────────────────────────────────────────────────────
// Color Theme Options
// ───────────────────────────────────────────────────────────
const themeOptions = [
  { name: 'Warm', bg: 'var(--bg-card)', text: 'var(--text-primary)' },
  { name: 'Paper', bg: '#F8F5F0', text: '#4C4239' },
  { name: 'Night', bg: '#1E2029', text: '#D8D9DE' },
  { name: 'Sepia', bg: '#F4ECD8', text: '#5D4E37' },
  { name: 'Ocean', bg: '#E8F4F8', text: '#2C5F77' },
  { name: 'Forest', bg: '#E8F5E9', text: '#2E5233' },
];

export default function ReaderSettingsModal({ isOpen, onClose, settings, updateSetting }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <Motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="bg-[var(--bg-card)] border-2 border-[var(--border-color)] rounded-3xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ─────────────────────────────────────────── */}
            {/* Header */}
            {/* ─────────────────────────────────────────── */}
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-bold flex items-center gap-3" style={{ fontFamily: 'var(--font-reading)' }}>
                <span className="text-4xl">⚙️</span>
                Reader Settings
              </h3>
              <Motion.button 
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose} 
                className="text-3xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors w-10 h-10 flex items-center justify-center rounded-full hover:bg-[var(--bg-secondary)]"
              >
                &times;
              </Motion.button>
            </div>

            <div className="space-y-8">
              {/* ─────────────────────────────────────────── */}
              {/* Reading Orientation */}
              {/* ─────────────────────────────────────────── */}
              <div className="space-y-3">
                <label className="font-bold text-lg text-[var(--text-primary)] flex items-center gap-2">
                  <span>📖</span> Reading Mode
                </label>
                <div className="grid grid-cols-2 gap-3 p-2 bg-[var(--bg-secondary)] rounded-2xl">
                  <Motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => updateSetting('orientation', 'vertical')} 
                    className={`py-4 rounded-xl text-sm font-bold transition-all ${
                      settings.orientation === 'vertical' 
                        ? 'bg-[var(--accent-primary)] text-white shadow-lg' 
                        : 'hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
                    }`}
                  >
                    <div className="text-2xl mb-1">↕️</div>
                    Vertical Scroll
                  </Motion.button>
                  <Motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => updateSetting('orientation', 'horizontal')} 
                    className={`py-4 rounded-xl text-sm font-bold transition-all ${
                      settings.orientation === 'horizontal' 
                        ? 'bg-[var(--accent-primary)] text-white shadow-lg' 
                        : 'hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
                    }`}
                  >
                    <div className="text-2xl mb-1">📄</div>
                    Page Flip
                  </Motion.button>
                </div>
                <p className="text-sm text-[var(--text-secondary)] ml-1">
                  {settings.orientation === 'horizontal' 
                    ? '✨ Includes physical book page flip animations' 
                    : 'Scroll continuously through the book'}
                </p>
              </div>

              {/* ─────────────────────────────────────────── */}
              {/* Font Family */}
              {/* ─────────────────────────────────────────── */}
              <div className="space-y-3">
                <label className="font-bold text-lg text-[var(--text-primary)] flex items-center gap-2">
                  <span>✍️</span> Font Style
                </label>
                <div className="grid grid-cols-3 gap-3 p-2 bg-[var(--bg-secondary)] rounded-2xl">
                  {fontOptions.map(font => (
                    <Motion.button 
                      key={font.name}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => updateSetting('fontFamily', font.value)} 
                      className={`py-3 px-2 rounded-xl text-sm font-bold transition-all ${
                        settings.fontFamily === font.value 
                          ? 'bg-[var(--accent-primary)] text-white shadow-lg' 
                          : 'hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
                      }`}
                      style={{ fontFamily: font.value }}
                    >
                      {font.name}
                    </Motion.button>
                  ))}
                </div>
              </div>

              {/* ─────────────────────────────────────────── */}
              {/* Font Size */}
              {/* ─────────────────────────────────────────── */}
              <div className="space-y-3">
                <label htmlFor="font-size" className="font-bold text-lg text-[var(--text-primary)] flex items-center gap-2">
                  <span>🔤</span> Font Size
                </label>
                <div className="flex items-center gap-4 px-4">
                  <span className="text-sm font-bold">A</span>
                  <input
                    id="font-size"
                    type="range"
                    min="14"
                    max="28"
                    step="1"
                    value={settings.fontSize}
                    onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
                    className="flex-1 h-3 bg-[var(--bg-secondary)] rounded-full appearance-none cursor-pointer accent-[var(--accent-primary)]"
                  />
                  <span className="text-2xl font-bold">A</span>
                  <span className="ml-2 font-mono font-bold text-[var(--accent-primary)] min-w-[3rem]">{settings.fontSize}px</span>
                </div>
              </div>

              {/* ─────────────────────────────────────────── */}
              {/* Line Height */}
              {/* ─────────────────────────────────────────── */}
              <div className="space-y-3">
                <label htmlFor="line-height" className="font-bold text-lg text-[var(--text-primary)] flex items-center gap-2">
                  <span>📏</span> Line Spacing
                </label>
                <div className="flex items-center gap-4 px-4">
                  <span className="text-xl">↕️</span>
                  <input
                    id="line-height"
                    type="range"
                    min="1.4"
                    max="2.5"
                    step="0.1"
                    value={settings.lineHeight}
                    onChange={(e) => updateSetting('lineHeight', parseFloat(e.target.value))}
                    className="flex-1 h-3 bg-[var(--bg-secondary)] rounded-full appearance-none cursor-pointer accent-[var(--accent-primary)]"
                  />
                  <span className="ml-2 font-mono font-bold text-[var(--accent-primary)] min-w-[3rem]">{settings.lineHeight.toFixed(1)}</span>
                </div>
              </div>

              {/* ─────────────────────────────────────────── */}              {/* Show Others' Highlights Toggle */}
              {/* ─────────────────────────────────────────────── */}
              <div className="space-y-3">
                <label className="font-bold text-lg text-[var(--text-primary)] flex items-center gap-2">
                  <span>👥</span> Other Readers
                </label>
                <div className="grid grid-cols-2 gap-3 p-2 bg-[var(--bg-secondary)] rounded-2xl">
                  <Motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => window.dispatchEvent(new CustomEvent('toggleHighlights', { detail: true }))}
                    className="py-4 rounded-xl text-sm font-bold transition-all bg-[var(--accent-primary)] text-white shadow-lg"
                  >
                    <div className="text-2xl mb-1">👀</div>
                    Show Highlights
                  </Motion.button>
                  <Motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => window.dispatchEvent(new CustomEvent('toggleHighlights', { detail: false }))}
                    className="py-4 rounded-xl text-sm font-bold transition-all hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                  >
                    <div className="text-2xl mb-1">🙈</div>
                    Hide Highlights
                  </Motion.button>
                </div>
                <p className="text-sm text-[var(--text-secondary)] ml-1">
                  Toggle visibility of other readers' highlights and comments
                </p>
              </div>

              {/* ─────────────────────────────────────────────── */}              {/* Color Theme */}
              {/* ─────────────────────────────────────────── */}
              <div className="space-y-3">
                <label className="font-bold text-lg text-[var(--text-primary)] flex items-center gap-2">
                  <span>🎨</span> Color Theme
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {themeOptions.map(theme => (
                    <Motion.button
                      key={theme.name}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        updateSetting('background', theme.bg);
                        updateSetting('textColor', theme.text);
                      }}
                      className={`py-5 px-3 rounded-2xl border-3 transition-all shadow-md hover:shadow-lg ${
                        settings.background === theme.bg 
                          ? 'border-[var(--accent-primary)] scale-105' 
                          : 'border-transparent hover:border-[var(--border-color)]'
                      }`}
                      style={{ backgroundColor: theme.bg, color: theme.text }}
                    >
                      <div className="font-bold text-base mb-1">{theme.name}</div>
                      <div className="text-xs opacity-70">Aa</div>
                    </Motion.button>
                  ))}
                </div>
              </div>

              {/* ─────────────────────────────────────────── */}
              {/* Preview */}
              {/* ─────────────────────────────────────────── */}
              <div className="p-6 rounded-2xl border-2 border-[var(--border-color)]" 
                   style={{ 
                     backgroundColor: settings.background, 
                     color: settings.textColor 
                   }}>
                <div className="font-bold text-sm mb-2 opacity-60">Preview</div>
                <p style={{
                  fontFamily: settings.fontFamily,
                  fontSize: `${settings.fontSize}px`,
                  lineHeight: settings.lineHeight
                }}>
                  The quick brown fox jumps over the lazy dog. This is how your reading text will appear with your current settings.
                </p>
              </div>
            </div>

            {/* ─────────────────────────────────────────── */}
            {/* Close Button */}
            {/* ─────────────────────────────────────────── */}
            <Motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="mt-8 w-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
            >
              Done ✓
            </Motion.button>
          </Motion.div>
        </Motion.div>
      )}
    </AnimatePresence>
  );
}
