// ═══════════════════════════════════════════════════════════
// DASHBOARD PAGE COMPONENT
// ═══════════════════════════════════════════════════════════
// User's home screen after login - create rooms, join rooms, 
// view recent rooms

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { nanoid } from 'nanoid';
import { ref, set, onValue } from '../firebase';
import { db, auth } from '../firebase';
import { getAllBooks } from '../books';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';

export default function Dashboard() {
  const navigate = useNavigate();
  const currentUser = auth.currentUser;
  
  // ───────────────────────────────────────────────────────────
  // Component State
  // ───────────────────────────────────────────────────────────
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [recentRooms, setRecentRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customAuthor, setCustomAuthor] = useState('');
  const [customContent, setCustomContent] = useState('');

  // ───────────────────────────────────────────────────────────
  // Load User's Recent Rooms
  // ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser) return;

    // Listen to user's room history
    const userRoomsRef = ref(db, `users/${currentUser.uid}/rooms`);
    const unsubscribe = onValue(userRoomsRef, (snapshot) => {
      if (snapshot.exists()) {
        const roomsData = snapshot.val();
        const roomsList = Object.entries(roomsData).map(([roomId, data]) => ({
          roomId,
          ...data
        }));
        // Sort by last accessed time (most recent first)
        roomsList.sort((a, b) => (b.lastAccessed || 0) - (a.lastAccessed || 0));
        setRecentRooms(roomsList.slice(0, 5)); // Show only 5 most recent
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  // ───────────────────────────────────────────────────────────
  // Create New Room
  // ───────────────────────────────────────────────────────────
  const handleCustomFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setCustomContent((e.target?.result || '').toString());
      toast.success('Loaded book text from file');
    };
    reader.onerror = () => toast.error('Could not read file');
    reader.readAsText(file);
  };

  const handleCreateRoom = async () => {
    if (!selectedBook) return toast.error('Please select a book');

    // If user chose custom, ensure content exists
    if (selectedBook === 'custom' && !customContent.trim()) {
      toast.error('Add custom book content (paste text or upload file)');
      return;
    }

    setIsLoading(true);
    try {
      // Generate unique 6-character room code
      const newRoomCode = nanoid(6).toUpperCase();
      
      // Get selected book data or custom payload
      const books = getAllBooks();
      const book = selectedBook === 'custom'
        ? {
            id: 'custom',
            title: customTitle || 'Custom Book',
            author: customAuthor || currentUser?.displayName || 'You',
            coverImage: '/books.png',
            chapters: [
              {
                id: 'custom-1',
                title: customTitle || 'Custom Book',
                content: customContent,
              },
            ],
          }
        : books.find(b => b.id === selectedBook);

      if (!book) {
        toast.error('Book not found');
        setIsLoading(false);
        return;
      }

      // Create room in Firebase
      const roomRef = ref(db, `rooms/${newRoomCode}`);
      await set(roomRef, {
        roomId: newRoomCode,
        bookId: book.id,
        bookTitle: book.title,
        bookAuthor: book.author,
        bookData: book,
        createdBy: currentUser.uid,
        createdByName: currentUser.displayName,
        createdAt: Date.now(),
        participants: {
          [currentUser.uid]: {
            name: currentUser.displayName,
            email: currentUser.email,
            photoURL: currentUser.photoURL,
            joinedAt: Date.now()
          }
        }
      });

      // Add room to user's history
      const userRoomRef = ref(db, `users/${currentUser.uid}/rooms/${newRoomCode}`);
      await set(userRoomRef, {
        bookTitle: book.title,
        lastAccessed: Date.now()
      });

      // Set room code for modal display
      setRoomCode(newRoomCode);
      
      toast.success('Room created successfully! 🎉');
    } catch (error) {
      console.error('Error creating room:', error);
      toast.error('Failed to create room. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ───────────────────────────────────────────────────────────
  // Join Room by Code
  // ───────────────────────────────────────────────────────────
  const handleJoinRoom = async (roomId) => {
    if (!roomId) {
      toast.error('Please enter a room code');
      return;
    }

    setIsLoading(true);
    try {
      // Check if room exists
      const roomRef = ref(db, `rooms/${roomId}`);
      onValue(roomRef, async (snapshot) => {
        if (snapshot.exists()) {
          const roomData = snapshot.val();
          
          // Add user to room participants
          const participantRef = ref(db, `rooms/${roomId}/participants/${currentUser.uid}`);
          await set(participantRef, {
            name: currentUser.displayName,
            email: currentUser.email,
            photoURL: currentUser.photoURL,
            joinedAt: Date.now()
          });

          // Add to user's history
          const userRoomRef = ref(db, `users/${currentUser.uid}/rooms/${roomId}`);
          await set(userRoomRef, {
            bookTitle: roomData.bookTitle,
            lastAccessed: Date.now()
          });

          toast.success('Joined room successfully! 📖');
          navigate(`/room/${roomId}`);
        } else {
          toast.error('Room not found. Please check the code.');
        }
        setIsLoading(false);
      }, { onlyOnce: true });
    } catch (err) {
      console.error('Error joining room:', err);
      toast.error('Failed to join room. Please try again.');
      setIsLoading(false);
    }
  };

  // ───────────────────────────────────────────────────────────
  // Copy Room Link to Clipboard
  // ───────────────────────────────────────────────────────────
  const copyRoomLink = () => {
    const link = `${window.location.origin}/room/${roomCode}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copied to clipboard! 📋');
  };

  const books = getAllBooks();

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
      
      <Sidebar 
        onShowCreateModal={() => setShowCreateModal(true)}
        onJoinRoom={handleJoinRoom}
      />

      {/* ───────────────────────────────────────────────── */}
      {/* Main Content */}
      {/* ───────────────────────────────────────────────── */}
      <main className="flex-1 p-12">
        
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-5xl font-bold mb-2" style={{ fontFamily: 'var(--font-reading)' }}>Your Bookshelf</h1>
            <p className="text-xl text-[var(--text-secondary)]">Continue your reading adventures.</p>
          </div>

          {/* Current/Recent Rooms Section - Bookshelf Style */}
          {recentRooms.length > 0 ? (
            <Motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {recentRooms.map((room, index) => (
                  <Motion.div
                    key={room.roomId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -10 }}
                    className="group cursor-pointer"
                    onClick={() => navigate(`/room/${room.roomId}`)}
                  >
                    {/* Bookshelf Book */}
                    <div className="relative h-64 w-48 mx-auto">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#C97943] to-[#E8B17A] rounded-lg shadow-2xl transform group-hover:rotate-3 transition-transform">
                        {/* Book Cover Image */}
                        {books.find(b => b.id === room.bookId)?.coverImage && books.find(b => b.id === room.bookId)?.coverImage !== '/books.png' ? (
                          <img src={books.find(b => b.id === room.bookId).coverImage} alt={room.bookTitle} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-5xl">📖</span>
                          </div>
                        )}
                        {/* Book Spine */}
                        <div className="absolute left-0 top-0 bottom-0 w-6 bg-gray-800/50 rounded-l-lg"></div>
                      </div>
                    </div>
                    <div className="text-center mt-4">
                      <h4 className="font-bold text-lg truncate group-hover:text-[var(--accent-primary)]" style={{ fontFamily: 'var(--font-reading)' }}>
                        {room.bookTitle}
                      </h4>
                      <p className="text-sm text-[var(--text-secondary)]">Room: {room.roomId}</p>
                    </div>
                  </Motion.div>
                ))}
              </div>
            </Motion.section>
          ) : (
            <Motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center py-20 bg-[var(--bg-secondary)] rounded-3xl border-2 border-dashed border-[var(--border-color)]"
            >
              <Motion.div 
                className="text-7xl mb-6"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                📚
              </Motion.div>
              <p className="text-2xl font-semibold text-[var(--text-secondary)] mb-2">Your bookshelf is empty!</p>
              <p className="text-lg text-[var(--text-secondary)]">Create or join a room to add a book.</p>
            </Motion.div>
          )}
        </div>
      </main>

      {/* ───────────────────────────────────────────────── */}
      {/* Create Room Modal */}
      {/* ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {showCreateModal && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center 
                     justify-center z-50 p-4"
            onClick={() => !roomCode && setShowCreateModal(false)}
          >
            <Motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="bg-[var(--bg-card)] rounded-3xl p-10 max-w-2xl w-full shadow-2xl border-2 border-[var(--border-color)] max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {!roomCode ? (
                // ─────────────────────────────────────────
                // Book Selection View
                // ─────────────────────────────────────────
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-5xl">📚</span>
                    <h3 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-reading)' }}>
                      Create a New Room
                    </h3>
                  </div>
                  
                  <p className="text-[var(--text-secondary)] mb-6 text-lg">
                    Select a book to read together:
                  </p>
                  
                  {/* Book Options */}
                  <div className="space-y-4 mb-8 max-h-96 overflow-y-auto pr-2">
                    {books.map((book) => (
                      <Motion.label
                        key={book.id}
                        whileHover={{ scale: 1.03, x: 8 }}
                        className={`block p-6 border-2 rounded-2xl cursor-pointer 
                                 transition-all ${
                          selectedBook === book.id
                            ? 'border-[var(--accent-primary)] bg-gradient-to-r from-[var(--accent-primary)]/15 to-[var(--accent-secondary)]/15 shadow-xl ring-2 ring-[var(--accent-primary)]/30'
                            : 'border-[var(--border-color)] hover:border-[var(--accent-secondary)] bg-[var(--bg-secondary)]/40 hover:shadow-lg'
                        }`}
                      >
                        <input
                          type="radio"
                          name="book"
                          value={book.id}
                          checked={selectedBook === book.id}
                          onChange={(e) => setSelectedBook(e.target.value)}
                          className="sr-only"
                        />
                        <div className="flex items-center gap-5">
                          {/* Book Cover or Icon */}
                          <div className="w-16 h-20 flex-shrink-0 bg-gradient-to-br from-[#C97943]/30 to-[#E8B17A]/30 rounded-lg flex items-center justify-center border-2 border-[var(--border-color)] shadow-md overflow-hidden">
                            {book.coverImage && book.coverImage !== '/books.png' ? (
                              <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-4xl">📖</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-xl mb-1" style={{ fontFamily: 'var(--font-reading)' }}>
                              {book.title}
                            </div>
                            <div className="text-base text-[var(--text-secondary)]">by {book.author}</div>
                          </div>
                          {selectedBook === book.id && (
                            <Motion.div 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="text-3xl text-[var(--accent-primary)]"
                            >
                              ✓
                            </Motion.div>
                          )}
                        </div>
                      </Motion.label>
                    ))}

                    {/* Custom Upload Option */}
                    <Motion.label
                      whileHover={{ scale: 1.03, x: 8 }}
                      className={`block p-6 border-2 rounded-2xl cursor-pointer 
                                 transition-all ${
                        selectedBook === 'custom'
                          ? 'border-[var(--accent-primary)] bg-gradient-to-r from-[var(--accent-primary)]/15 to-[var(--accent-secondary)]/15 shadow-xl ring-2 ring-[var(--accent-primary)]/30'
                          : 'border-[var(--border-color)] hover:border-[var(--accent-secondary)] bg-[var(--bg-secondary)]/40 hover:shadow-lg'
                      }`}
                    >
                      <input
                        type="radio"
                        name="book"
                        value="custom"
                        checked={selectedBook === 'custom'}
                        onChange={(e) => setSelectedBook(e.target.value)}
                        className="sr-only"
                      />
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-20 flex-shrink-0 bg-gradient-to-br from-[#FFB8D1]/30 to-[#C9B4E7]/30 rounded-lg flex items-center justify-center border-2 border-[var(--border-color)] shadow-md">
                          <span className="text-4xl">📝</span>
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-xl mb-1" style={{ fontFamily: 'var(--font-reading)' }}>
                            Upload your own book
                          </div>
                          <div className="text-base text-[var(--text-secondary)]">Paste text or upload a .txt file</div>
                        </div>
                        {selectedBook === 'custom' && (
                          <Motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-3xl text-[var(--accent-primary)]"
                          >
                            ✓
                          </Motion.div>
                        )}
                      </div>
                    </Motion.label>
                  </div>

                  {/* Custom Book Details */}
                  {selectedBook === 'custom' && (
                    <Motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 mb-8 p-6 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)]"
                    >
                      <input
                        type="text"
                        value={customTitle}
                        onChange={(e) => setCustomTitle(e.target.value)}
                        placeholder="Custom book title"
                        className="w-full px-5 py-3 border-2 border-[var(--border-color)] rounded-xl 
                                 focus:border-[var(--accent-primary)] focus:outline-none bg-[var(--bg-card)] 
                                 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 
                                 font-semibold transition-all"
                      />
                      <input
                        type="text"
                        value={customAuthor}
                        onChange={(e) => setCustomAuthor(e.target.value)}
                        placeholder="Author (optional)"
                        className="w-full px-5 py-3 border-2 border-[var(--border-color)] rounded-xl 
                                 focus:border-[var(--accent-primary)] focus:outline-none bg-[var(--bg-card)] 
                                 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 
                                 transition-all"
                      />
                      <textarea
                        value={customContent}
                        onChange={(e) => setCustomContent(e.target.value)}
                        placeholder="Paste your book text here..."
                        className="w-full px-5 py-3 border-2 border-[var(--border-color)] rounded-xl 
                                 focus:border-[var(--accent-primary)] focus:outline-none bg-[var(--bg-card)] 
                                 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 
                                 min-h-[160px] transition-all"
                      />
                      <div className="flex items-center gap-4">
                        <label className="px-6 py-3 rounded-xl border-2 border-[var(--border-color)] cursor-pointer 
                                       hover:border-[var(--accent-primary)] bg-[var(--bg-card)] hover:bg-[var(--bg-secondary)] 
                                       transition-all font-semibold flex items-center gap-2">
                          <span>📎</span>
                          <input
                            type="file"
                            accept=".txt"
                            className="hidden"
                            onChange={(e) => handleCustomFile(e.target.files?.[0])}
                          />
                          Upload .txt file
                        </label>
                        <span className="text-sm text-[var(--text-secondary)]">We keep it in this room only.</span>
                      </div>
                    </Motion.div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <Motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 px-6 py-4 border-2 border-[var(--border-color)] rounded-2xl 
                               font-bold hover:bg-[var(--bg-secondary)] transition-all text-lg"
                    >
                      Cancel
                    </Motion.button>
                    <Motion.button
                      whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(201, 121, 67, 0.3)' }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCreateRoom}
                      disabled={!selectedBook || isLoading}
                      className="flex-1 bg-gradient-to-r from-[#D4845C] to-[#E8B17A] 
                                text-white px-6 py-4 rounded-2xl font-bold 
                                hover:shadow-2xl transition-all disabled:opacity-50 
                                disabled:cursor-not-allowed text-lg shadow-lg"
                    >
                      {isLoading ? 'Creating...' : 'Create Room 🎉'}
                    </Motion.button>
                  </div>
                </>
              ) : (
                // ─────────────────────────────────────────
                // Room Created View (Success)
                // ─────────────────────────────────────────
                <>
                  <div className="text-center mb-8">
                    <Motion.div 
                      className="text-8xl mb-6"
                      animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 0.6 }}
                    >
                      🎉
                    </Motion.div>
                    <h3 className="text-4xl font-bold mb-3" style={{ fontFamily: 'var(--font-reading)' }}>
                      Room Created!
                    </h3>
                    <p className="text-[var(--text-secondary)] text-lg">Share this code with your friends</p>
                  </div>

                  {/* Room Code Display */}
                  <div className="bg-gradient-to-br from-[var(--accent-primary)]/10 to-[var(--accent-secondary)]/10 
                                border-2 border-[var(--accent-primary)]/30 rounded-2xl 
                                p-8 mb-8 text-center">
                    <div className="text-sm font-bold text-[var(--accent-primary)] mb-3 uppercase tracking-wider">
                      Room Code
                    </div>
                    <Motion.div 
                      className="text-6xl font-mono font-bold text-[var(--accent-primary)] 
                                tracking-widest mb-6"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      {roomCode}
                    </Motion.div>
                    <Motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={copyRoomLink}
                      className="text-sm text-[var(--accent-primary)] hover:text-[var(--accent-secondary)] 
                               font-bold flex items-center gap-2 mx-auto px-6 py-3 rounded-xl 
                               bg-[var(--bg-card)] border border-[var(--accent-primary)]/30 
                               hover:bg-[var(--accent-primary)]/10 transition-all"
                    >
                      📋 Copy Shareable Link
                    </Motion.button>
                  </div>

                  {/* Start Reading Button */}
                  <Motion.button
                    whileHover={{ scale: 1.02, boxShadow: '0 25px 50px rgba(212, 132, 92, 0.4)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(`/room/${roomCode}`)}
                    className="w-full bg-gradient-to-r from-[#D4845C] to-[#E8B17A] 
                             text-white px-8 py-5 rounded-2xl font-bold text-xl
                             hover:shadow-2xl transition-all flex items-center justify-center gap-3"
                  >
                    Start Reading 
                    <span className="text-2xl">→</span>
                  </Motion.button>
                </>
              )}
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
