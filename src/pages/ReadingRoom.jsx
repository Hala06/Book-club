// ═══════════════════════════════════════════════════════════
// READING ROOM COMPONENT
// ═══════════════════════════════════════════════════════════
// Main reading interface with real-time highlighting, comments,
// and presence tracking

import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { ref, set, onValue, update, onDisconnect } from '../firebase';
import { db, auth } from '../firebase';
import { getBookById } from '../books';
import toast from 'react-hot-toast';
import { nanoid } from 'nanoid';
import ThemeToggle from '../components/ThemeToggle';
import ReaderSettingsModal from '../components/ReaderSettingsModal';

export default function ReadingRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const currentUser = auth.currentUser;
  const contentRef = useRef(null);

  // ───────────────────────────────────────────────────────────
  // Component State
  // ───────────────────────────────────────────────────────────
  const [room, setRoom] = useState(null);
  const [book, setBook] = useState(null);
  const [highlights, setHighlights] = useState([]);
  const [comments, setComments] = useState({});
  const [participants, setParticipants] = useState([]);
  const [selectedText, setSelectedText] = useState(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [activeHighlight, setActiveHighlight] = useState(null);
  const [showSidebar] = useState(true);
  const userColorsRef = useRef({});
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const [showOthersHighlights, setShowOthersHighlights] = useState(true);
  const [readerSettings, setReaderSettings] = useState({
    orientation: 'vertical',
    fontSize: 18,
    lineHeight: 1.7,
    fontFamily: 'var(--font-reading)',
    textColor: '#2D2A26',
    background: '#FFFFFF',
  });

  // User color palette for highlights
  const colorPalette = [
    'var(--highlight-friend-1)',
    'var(--highlight-friend-2)',
    'var(--highlight-friend-3)',
    '#F0C794',
    '#E89B73',
    '#FFE785'
  ];

  // Pagination builder for horizontal page flip mode
  const pages = useMemo(() => {
    if (!book || readerSettings.orientation !== 'horizontal') return [];
    const full = book.chapters.map((ch) => `${ch.title}\n\n${ch.content}`).join('\n\n');
    const chunkSize = 1400; // rough chunk for cozy sizing
    const slices = [];
    for (let i = 0; i < full.length; i += chunkSize) {
      slices.push(full.slice(i, i + chunkSize));
    }
    return slices;
  }, [book, readerSettings.orientation]);

  const totalPages = readerSettings.orientation === 'horizontal' ? pages.length : 0;

  const readingStyle = useMemo(() => ({
    color: readerSettings.textColor,
    fontFamily: readerSettings.fontFamily,
    fontSize: `${readerSettings.fontSize}px`,
    lineHeight: readerSettings.lineHeight
  }), [readerSettings.textColor, readerSettings.fontFamily, readerSettings.fontSize, readerSettings.lineHeight]);

  const updateSetting = (key, value) => {
    setReaderSettings((prev) => ({ ...prev, [key]: value }));
    if (key === 'orientation') setPageIndex(0);
  };

  useEffect(() => {
    if (readerSettings.orientation !== 'horizontal') return;
    setPageIndex((idx) => Math.min(Math.max(idx, 0), Math.max(pages.length - 1, 0)));
  }, [pages, readerSettings.orientation]);

  // ───────────────────────────────────────────────────────────
  // Listen for Highlight Visibility Toggle
  // ───────────────────────────────────────────────────────────
  useEffect(() => {
    const handleToggle = (e) => setShowOthersHighlights(e.detail);
    window.addEventListener('toggleHighlights', handleToggle);
    return () => window.removeEventListener('toggleHighlights', handleToggle);
  }, []);

  // ───────────────────────────────────────────────────────────
  // Load Room Data
  // ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!roomId || !currentUser) return;

    // Listen to room data
    const roomRef = ref(db, `rooms/${roomId}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const roomData = snapshot.val();
        setRoom(roomData);
        
        // Load book data (custom uploads stored in room.bookData)
        const bookData = roomData.bookData || getBookById(roomData.bookId);
        setBook(bookData);

        // Extract participants
        if (roomData.participants) {
          const participantsList = Object.entries(roomData.participants).map(
            ([uid, data]) => ({ uid, ...data })
          );
          setParticipants(participantsList);
        }
      } else {
        toast.error('Room not found');
        navigate('/dashboard');
      }
    });

    // Set up presence tracking
    const presenceRef = ref(db, `rooms/${roomId}/presence/${currentUser.uid}`);
    set(presenceRef, {
      name: currentUser.displayName,
      photoURL: currentUser.photoURL,
      lastActive: Date.now(),
      online: true
    });

    // Remove presence on disconnect
    onDisconnect(presenceRef).remove();

    // Update last accessed time
    const userRoomRef = ref(db, `users/${currentUser.uid}/rooms/${roomId}`);
    update(userRoomRef, { lastAccessed: Date.now() });

    return () => {
      unsubscribe();
      set(presenceRef, { online: false, lastActive: Date.now() });
    };
  }, [roomId, currentUser, navigate]);

  // ───────────────────────────────────────────────────────────
  // Load Highlights
  // ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!roomId) return;

    const highlightsRef = ref(db, `rooms/${roomId}/highlights`);
    const unsubscribe = onValue(highlightsRef, (snapshot) => {
      if (snapshot.exists()) {
        const highlightsData = snapshot.val();
        const highlightsList = Object.entries(highlightsData).map(
          ([id, data]) => ({ id, ...data })
        );
        setHighlights(highlightsList);
      } else {
        setHighlights([]);
      }
    });

    return () => unsubscribe();
  }, [roomId]);

  // ───────────────────────────────────────────────────────────
  // Load Comments
  // ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!roomId) return;

    const commentsRef = ref(db, `rooms/${roomId}/comments`);
    const unsubscribe = onValue(commentsRef, (snapshot) => {
      if (snapshot.exists()) {
        const commentsData = snapshot.val();
        // Group comments by highlight ID
        const groupedComments = {};
        Object.entries(commentsData).forEach(([id, data]) => {
          const highlightId = data.highlightId;
          if (!groupedComments[highlightId]) {
            groupedComments[highlightId] = [];
          }
          groupedComments[highlightId].push({ id, ...data });
        });
        setComments(groupedComments);
      }
    });

    return () => unsubscribe();
  }, [roomId]);

  // ───────────────────────────────────────────────────────────
  // Get User Color for Highlights
  // ───────────────────────────────────────────────────────────
  const getUserColor = (userId) => {
    const userColors = userColorsRef.current;
    if (!userColors[userId]) {
      const index = Object.keys(userColors).length % colorPalette.length;
      userColors[userId] = colorPalette[index];
    }
    return userColors[userId];
  };

  // ───────────────────────────────────────────────────────────
  // Handle Text Selection
  // ───────────────────────────────────────────────────────────
  const handleTextSelection = () => {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    
    if (text.length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      setSelectedText({
        text,
        range,
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      });
    } else {
      setSelectedText(null);
    }
  };

  // ───────────────────────────────────────────────────────────
  // Create Highlight
  // ───────────────────────────────────────────────────────────
  const createHighlight = async (withComment = false) => {
    if (!selectedText) return;

    try {
      const highlightId = nanoid();
      const userColor = getUserColor(currentUser.uid);

      // Calculate text position in the full book content
      const fullText = book.chapters.map(ch => ch.content).join('\n\n');
      const startPos = fullText.indexOf(selectedText.text);

      const highlightData = {
        id: highlightId,
        userId: currentUser.uid,
        userName: currentUser.displayName,
        userPhoto: currentUser.photoURL,
        text: selectedText.text,
        color: userColor,
        startPos,
        endPos: startPos + selectedText.text.length,
        timestamp: Date.now()
      };

      // Save highlight to Firebase
      const highlightRef = ref(db, `rooms/${roomId}/highlights/${highlightId}`);
      await set(highlightRef, highlightData);

      toast.success('Highlight added! ✨');

      // If user wants to add comment, open modal
      if (withComment) {
        setActiveHighlight(highlightData);
        setShowCommentModal(true);
      }

      // Clear selection
      window.getSelection().removeAllRanges();
      setSelectedText(null);
    } catch (error) {
      console.error('Error creating highlight:', error);
      toast.error('Failed to create highlight');
    }
  };

  // ───────────────────────────────────────────────────────────
  // Add Comment to Highlight
  // ───────────────────────────────────────────────────────────
  const addComment = async () => {
    if (!commentText.trim() || !activeHighlight) return;

    try {
      const commentId = nanoid();
      const commentData = {
        id: commentId,
        highlightId: activeHighlight.id,
        userId: currentUser.uid,
        userName: currentUser.displayName,
        userPhoto: currentUser.photoURL,
        text: commentText,
        timestamp: Date.now()
      };

      const commentRef = ref(db, `rooms/${roomId}/comments/${commentId}`);
      await set(commentRef, commentData);

      toast.success('Comment added! 💬');
      setShowCommentModal(false);
      setCommentText('');
      setActiveHighlight(null);
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  // ───────────────────────────────────────────────────────────
  // Copy Room Link
  // ───────────────────────────────────────────────────────────
  const copyRoomLink = () => {
    const link = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(link);
    toast.success('Room link copied! 📋');
  };

  // ───────────────────────────────────────────────────────────
  // Scroll to Chapter
  // ───────────────────────────────────────────────────────────
  const scrollToChapter = (chapterId) => {
    const element = document.getElementById(`chapter-${chapterId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (!room || !book) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF8F0] to-[#FFE8D6] dark:from-[#1A1815] dark:to-[#2D2926]">
        <Motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Motion.div 
            className="text-6xl mb-6"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            📚
          </Motion.div>
          <div className="text-2xl font-bold text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-reading)' }}>
            Loading room...
          </div>
        </Motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-[#FFF8F0] via-[#FFF5E8] to-[#FFE8D6] dark:from-[#1A1815] dark:via-[#252220] dark:to-[#2D2926] text-[var(--text-primary)] transition-colors duration-300">
      
      {/* ───────────────────────────────────────────────── */}
      {/* Header with New Layout */}
      {/* ───────────────────────────────────────────────── */}
      <header className="bg-[var(--bg-card)]/80 backdrop-blur-xl border-b-2 border-[var(--border-color)] px-6 py-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* ─────────────────────────────────────────── */}
          {/* Left: Profile & Participants */}
          {/* ─────────────────────────────────────────── */}
          <div className="flex items-center gap-4 flex-1">
            <Motion.img
              src={currentUser?.photoURL}
              alt={currentUser?.displayName}
              className="w-12 h-12 rounded-full border-3 border-[var(--accent-primary)] shadow-lg"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            />
            
            <div className="hidden md:block">
              <h2 className="font-bold text-lg" style={{ fontFamily: 'var(--font-reading)' }}>
                {book.title}
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Room: <span className="font-mono font-bold text-[var(--accent-primary)]">{roomId}</span>
              </p>
            </div>

            {/* Participants Avatars */}
            <div className="flex items-center gap-2 ml-4">
              <span className="text-xl">👥</span>
              <div className="flex -space-x-3">
                {participants.slice(0, 4).map((participant) => (
                  <Motion.img
                    key={participant.uid}
                    src={participant.photoURL}
                    alt={participant.name}
                    className="w-10 h-10 rounded-full border-2 border-[var(--bg-card)] shadow-md"
                    title={participant.name}
                    whileHover={{ scale: 1.2, zIndex: 10 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  />
                ))}
              </div>
              {participants.length > 4 && (
                <span className="text-sm font-bold text-[var(--text-secondary)] ml-2">
                  +{participants.length - 4}
                </span>
              )}
            </div>
          </div>

          {/* ─────────────────────────────────────────── */}
          {/* Center: Settings Button */}
          {/* ─────────────────────────────────────────── */}
          <div className="flex items-center gap-3">
            <Motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSettingsOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              title="Settings"
            >
              <span className="text-2xl">⚙️</span>
              <span className="hidden sm:inline">Settings</span>
            </Motion.button>
          </div>

          {/* ─────────────────────────────────────────── */}
          {/* Right: Exit/Leave Button */}
          {/* ─────────────────────────────────────────── */}
          <div className="flex items-center gap-3 flex-1 justify-end">
            <Motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-red-500/10 text-red-600 dark:text-red-400 rounded-2xl font-bold border-2 border-red-500/30 hover:bg-red-500/20 transition-all flex items-center gap-2 shadow-md"
            >
              <span className="text-xl">🚪</span>
              <span className="hidden sm:inline">Leave</span>
            </Motion.button>
          </div>
        </div>
      </header>

      {/* ───────────────────────────────────────────────── */}
      {/* Main Content Area */}
      {/* ───────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* ─────────────────────────────────────────────── */}
        {/* Left Sidebar - Chapters (Hidden on smaller screens) */}
        {/* ─────────────────────────────────────────────── */}
        {showSidebar && (
          <aside className="hidden lg:block w-72 bg-[var(--bg-card)]/80 backdrop-blur-xl border-r-2 border-[var(--border-color)] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ fontFamily: 'var(--font-reading)' }}>
                <span className="text-2xl">📑</span> Chapters
              </h3>
              <div className="space-y-2">
                {book.chapters.map((chapter, index) => (
                  <Motion.button
                    key={chapter.id}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => scrollToChapter(chapter.id)}
                    className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold
                             hover:bg-[var(--bg-secondary)] hover:text-[var(--accent-primary)] transition-all
                             text-[var(--text-secondary)] border-2 border-transparent hover:border-[var(--accent-primary)]/30"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[var(--accent-primary)]">{index + 1}.</span>
                      <span>{chapter.title}</span>
                    </div>
                  </Motion.button>
                ))}
              </div>

              <div className="mt-10 pt-6 border-t-2 border-[var(--border-color)]">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-reading)' }}>
                  <span className="text-2xl">🎨</span> Quick Tips
                </h3>
                <div className="space-y-3 text-sm text-[var(--text-secondary)]">
                  <div className="p-3 bg-[var(--bg-secondary)] rounded-xl">
                    <div className="font-bold mb-1 text-[var(--text-primary)]">Select text</div>
                    <div>to highlight or add comments</div>
                  </div>
                  <div className="p-3 bg-[var(--bg-secondary)] rounded-xl">
                    <div className="font-bold mb-1 text-[var(--text-primary)]">Click highlights</div>
                    <div>to view and add comments</div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* ─────────────────────────────────────────────── */}
        {/* Main Reading Area with Cozy Design */}
        {/* ─────────────────────────────────────────────── */}
        <main 
          className="flex-1 overflow-y-auto"
          onMouseUp={handleTextSelection}
        >
          <div className="max-w-5xl mx-auto px-8 py-12">
            
            {/* ───────────────────────────────────────── */}
            {/* Progress & Navigation Bar */}
            {/* ───────────────────────────────────────── */}
            <div className="flex items-center justify-between mb-8">
              <Motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-sm font-bold text-[var(--text-primary)] bg-[var(--bg-card)] px-6 py-3 rounded-full border-2 border-[var(--border-color)] shadow-md flex items-center gap-2"
              >
                <span className="text-xl">📖</span>
                {readerSettings.orientation === 'horizontal' 
                  ? <span>Page {pageIndex + 1} of {totalPages}</span>
                  : <span>{book.chapters.length} Chapters</span>
                }
                {readerSettings.orientation === 'horizontal' && totalPages > 0 && (
                  <span className="text-[var(--accent-primary)] ml-2">
                    ({Math.round(((pageIndex + 1) / totalPages) * 100)}%)
                  </span>
                )}
              </Motion.div>

              {/* Page Navigation Buttons for Horizontal Mode */}
              {readerSettings.orientation === 'horizontal' && (
                <div className="flex items-center gap-3">
                  <Motion.button
                    whileHover={{ scale: 1.05, x: -3 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPageIndex((idx) => Math.max(idx - 1, 0))}
                    disabled={pageIndex === 0}
                    className="px-6 py-3 bg-[var(--bg-card)] border-2 border-[var(--border-color)] rounded-2xl hover:bg-[var(--bg-secondary)] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md font-bold flex items-center gap-2"
                  >
                    ← Previous
                  </Motion.button>
                  <Motion.button
                    whileHover={{ scale: 1.05, x: 3 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPageIndex((idx) => Math.min(idx + 1, Math.max(totalPages - 1, 0)))}
                    disabled={pageIndex >= totalPages - 1}
                    className="px-6 py-3 bg-[var(--bg-card)] border-2 border-[var(--border-color)] rounded-2xl hover:bg-[var(--bg-secondary)] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md font-bold flex items-center gap-2"
                  >
                    Next →
                  </Motion.button>
                </div>
              )}
            </div>

            {/* ───────────────────────────────────────── */}
            {/* Reading Content Card */}
            {/* ───────────────────────────────────────── */}
            <div className="rounded-3xl shadow-2xl overflow-hidden border-2 border-[var(--border-color)]" style={{ backgroundColor: readerSettings.background }}>
              <div className="p-12" ref={contentRef}>
                
                {/* Book Title & Author */}
                <Motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-10 pb-8 border-b-2 border-[var(--border-color)]"
                >
                  <h2 className="text-5xl font-bold mb-3 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-reading)' }}>
                    {book.title}
                  </h2>
                  <p className="text-xl italic" style={{ color: readerSettings.textColor, opacity: 0.7 }}>by {book.author}</p>
                </Motion.div>

                {/* Content Display Based on Orientation */}
                {readerSettings.orientation === 'horizontal' ? (
                  /* ═══════════════════════════════════ */
                  /* Horizontal Page Flip Mode */
                  /* ═══════════════════════════════════ */
                  <AnimatePresence mode="wait">
                    <Motion.div
                      key={pageIndex}
                      initial={{ opacity: 0, rotateY: 15, x: 100 }}
                      animate={{ opacity: 1, rotateY: 0, x: 0 }}
                      exit={{ opacity: 0, rotateY: -15, x: -100 }}
                      transition={{ 
                        duration: 0.6,
                        type: 'spring',
                        stiffness: 100,
                        damping: 20
                      }}
                      className="min-h-[60vh]"
                      style={{
                        ...readingStyle,
                        transformStyle: 'preserve-3d',
                        perspective: '1000px'
                      }}
                    >
                      {pages.length > 0 ? (
                        <>
                          {pages[pageIndex].split('\n\n').map((paragraph, idx) => (
                            <Motion.p 
                              key={idx} 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className="mb-6 leading-relaxed"
                            >
                              {paragraph}
                            </Motion.p>
                          ))}
                        </>
                      ) : (
                        <p className="text-[var(--text-secondary)] text-center py-20 text-lg">
                          Preparing your pages...
                        </p>
                      )}
                    </Motion.div>
                  </AnimatePresence>
                ) : (
                  /* ═══════════════════════════════════ */
                  /* Vertical Scroll Mode */
                  /* ═══════════════════════════════════ */
                  book.chapters.map((chapter, chapterIdx) => (
                    <Motion.div 
                      key={chapter.id} 
                      id={`chapter-${chapter.id}`} 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: chapterIdx * 0.1 }}
                      className="mb-16" 
                      style={readingStyle}
                    >
                      <h3 className="text-3xl font-bold mb-8 text-[var(--accent-primary)] flex items-center gap-3" style={{ fontFamily: 'var(--font-reading)' }}>
                        <span className="text-2xl">📖</span>
                        {chapter.title}
                      </h3>
                      <div className="space-y-6">
                        {chapter.content.split('\n\n').map((paragraph, idx) => (
                          <p key={idx} className="leading-relaxed">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </Motion.div>
                  ))
                )}

                {/* ───────────────────────────────────── */}
                {/* Progress Bar for Horizontal Mode */}
                {/* ───────────────────────────────────── */}
                {readerSettings.orientation === 'horizontal' && totalPages > 0 && (
                  <Motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-12 pt-8 border-t-2 border-[var(--border-color)]"
                  >
                    <div className="h-3 bg-[var(--bg-secondary)] rounded-full overflow-hidden shadow-inner">
                      <Motion.div
                        className="h-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] rounded-full shadow-lg"
                        initial={{ width: 0 }}
                        animate={{ width: `${((pageIndex + 1) / totalPages) * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <div className="mt-3 text-center text-sm font-bold text-[var(--text-secondary)]">
                      {Math.round(((pageIndex + 1) / totalPages) * 100)}% Complete
                    </div>
                  </Motion.div>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* ─────────────────────────────────────────────── */}
        {/* Right Sidebar - Activity Feed (Optional) */}
        {/* ─────────────────────────────────────────────── */}
        <aside className="hidden xl:block w-96 bg-[var(--bg-card)]/80 backdrop-blur-xl border-l-2 border-[var(--border-color)] overflow-y-auto">
          <div className="p-6">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ fontFamily: 'var(--font-reading)' }}>
              <span className="text-3xl">💬</span> 
              Recent Activity
            </h3>
            
            <div className="space-y-4">
              {highlights.length > 0 && showOthersHighlights ? (
                highlights
                  .filter(h => showOthersHighlights || h.userId === currentUser.uid)
                  .sort((a, b) => b.timestamp - a.timestamp)
                  .slice(0, 10)
                  .map((highlight, index) => (
                    <Motion.div
                      key={highlight.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02, x: -5 }}
                      className="p-4 bg-[var(--bg-secondary)] rounded-2xl cursor-pointer 
                               hover:shadow-lg transition-all border-2 border-transparent hover:border-[var(--accent-primary)]/30"
                      onClick={() => {
                        setActiveHighlight(highlight);
                        setShowCommentModal(true);
                      }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <img
                          src={highlight.userPhoto}
                          alt={highlight.userName}
                          className="w-10 h-10 rounded-full border-2 border-[var(--accent-primary)]"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-bold block truncate">
                            {highlight.userName}
                          </span>
                          <span className="text-xs text-[var(--text-secondary)]">
                            {new Date(highlight.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                      <div 
                        className="text-sm p-3 rounded-xl leading-relaxed"
                        style={{ 
                          backgroundColor: highlight.color + '30',
                          color: readerSettings.textColor 
                        }}
                      >
                        "{highlight.text.substring(0, 100)}
                        {highlight.text.length > 100 ? '...' : ''}"
                      </div>
                      {comments[highlight.id] && showOthersHighlights && (
                        <div className="mt-3 text-xs font-bold text-[var(--accent-primary)] flex items-center gap-1">
                          <span>💬</span> {comments[highlight.id].length} comment{comments[highlight.id].length !== 1 ? 's' : ''}
                        </div>
                      )}
                    </Motion.div>
                  ))
              ) : (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">
                    {showOthersHighlights ? '✨' : '🙈'}
                  </div>
                  <p className="text-[var(--text-secondary)]">
                    {showOthersHighlights ? 'No highlights yet!' : 'Others\' highlights hidden'}
                  </p>
                  <p className="text-sm text-[var(--text-secondary)] mt-2">
                    {showOthersHighlights ? 'Select text to get started' : 'Toggle in settings to see'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* ───────────────────────────────────────────────── */}
      {/* Selection Popup - Enhanced */}
      {/* ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedText && (
          <Motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed z-50 bg-[var(--bg-card)] border-2 border-[var(--accent-primary)] rounded-2xl shadow-2xl p-2 flex gap-2"
            style={{
              left: selectedText.x,
              top: selectedText.y,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <Motion.button
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => createHighlight(false)}
              className="px-5 py-3 bg-gradient-to-r from-[var(--highlight-you)] to-[#FFD966] hover:opacity-90 rounded-xl 
                       text-sm font-bold transition-all text-[var(--text-primary)] shadow-md"
            >
              ✨ Highlight
            </Motion.button>
            <Motion.button
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => createHighlight(true)}
              className="px-5 py-3 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] hover:opacity-90 text-white 
                       rounded-xl text-sm font-bold transition-all shadow-md"
            >
              💬 Comment
            </Motion.button>
          </Motion.div>
        )}
      </AnimatePresence>

      {/* ───────────────────────────────────────────────── */}
      {/* Comment Modal - Enhanced */}
      {/* ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {showCommentModal && activeHighlight && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center 
                     justify-center z-50 p-4"
            onClick={() => setShowCommentModal(false)}
          >
            <Motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="bg-[var(--bg-card)] border-2 border-[var(--border-color)] rounded-3xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">💬</span>
                <h3 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-reading)' }}>
                  Comments
                </h3>
              </div>

              {/* Highlighted Text Display */}
              <Motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl mb-6 border-2"
                style={{ 
                  backgroundColor: activeHighlight.color + '20',
                  borderColor: activeHighlight.color + '40'
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={activeHighlight.userPhoto}
                    alt={activeHighlight.userName}
                    className="w-10 h-10 rounded-full border-2 border-[var(--accent-primary)]"
                  />
                  <div>
                    <span className="font-bold block">
                      {activeHighlight.userName}
                    </span>
                    <span className="text-xs text-[var(--text-secondary)]">
                      {new Date(activeHighlight.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
                <p className="text-[var(--text-primary)] italic text-lg leading-relaxed">
                  "{activeHighlight.text}"
                </p>
              </Motion.div>

              {/* Existing Comments */}
              {comments[activeHighlight.id] && comments[activeHighlight.id].length > 0 && (
                <div className="mb-6 max-h-64 overflow-y-auto space-y-3">
                  <h4 className="font-bold text-sm text-[var(--text-secondary)] mb-3 uppercase tracking-wider">
                    Discussion ({comments[activeHighlight.id].length})
                  </h4>
                  {comments[activeHighlight.id].map((comment, index) => (
                    <Motion.div 
                      key={comment.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-[var(--bg-secondary)] p-4 rounded-2xl border border-[var(--border-color)]"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <img
                          src={comment.userPhoto}
                          alt={comment.userName}
                          className="w-8 h-8 rounded-full"
                        />
                        <div className="flex-1">
                          <span className="font-bold text-sm">
                            {comment.userName}
                          </span>
                          <span className="text-xs text-[var(--text-secondary)] ml-2">
                            {new Date(comment.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <p className="text-[var(--text-primary)] leading-relaxed">{comment.text}</p>
                    </Motion.div>
                  ))}
                </div>
              )}

              {/* Add Comment Input */}
              <div className="space-y-4">
                <label className="font-bold text-sm text-[var(--text-secondary)] uppercase tracking-wider">
                  Add Your Thoughts
                </label>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Share your thoughts about this highlight..."
                  className="w-full px-5 py-4 border-2 border-[var(--border-color)] rounded-2xl 
                           focus:border-[var(--accent-primary)] focus:outline-none resize-none 
                           bg-[var(--bg-secondary)] text-[var(--text-primary)] 
                           placeholder:text-[var(--text-secondary)]/50 transition-all"
                  rows={4}
                />
                <div className="flex gap-3">
                  <Motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowCommentModal(false);
                      setCommentText('');
                      setActiveHighlight(null);
                    }}
                    className="flex-1 px-6 py-4 border-2 border-[var(--border-color)] rounded-2xl 
                             font-bold hover:bg-[var(--bg-secondary)] transition-all text-lg"
                  >
                    Cancel
                  </Motion.button>
                  <Motion.button
                    whileHover={{ scale: 1.02, boxShadow: '0 10px 30px rgba(212, 132, 92, 0.3)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={addComment}
                    disabled={!commentText.trim()}
                    className="flex-1 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white px-6 py-4 rounded-2xl 
                             font-bold hover:shadow-xl transition-all text-lg
                             disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    Add Comment ✓
                  </Motion.button>
                </div>
              </div>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>

      <ReaderSettingsModal 
        isOpen={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
        settings={readerSettings} 
        updateSetting={updateSetting} 
      />
    </div>
  );
}
