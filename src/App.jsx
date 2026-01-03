// ═══════════════════════════════════════════════════════════
// MAIN APP COMPONENT
// ═══════════════════════════════════════════════════════════
// Root component with routing and authentication

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import { ThemeProvider } from './context/ThemeProvider';
import Landing from './pages/Landing';
import SignIn from './pages/SignIn';
import Dashboard from './pages/Dashboard';
import ReadingRoom from './pages/ReadingRoom';
import './App.css';

// ───────────────────────────────────────────────────────────
// Protected Route Component
// ───────────────────────────────────────────────────────────
// Redirects to landing page if user is not authenticated
function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/" />;
}

// ───────────────────────────────────────────────────────────
// Main App Component
// ───────────────────────────────────────────────────────────
function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
        {/* Toast Notifications */}
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 3000,
            className: '!bg-(--bg-card) !text-(--text-primary) !border !border-(--border-color) !rounded-2xl !shadow-lg',
            success: {
              iconTheme: {
                primary: 'var(--accent-primary)',
                secondary: 'var(--bg-card)',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />

        {/* Application Routes */}
        <Routes>
          {/* Landing Page - Public */}
          <Route path="/" element={<Landing />} />

          {/* Sign-in Page - Public */}
          <Route path="/signin" element={<SignIn />} />
          
          {/* Dashboard - Protected */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Reading Room - Protected */}
          <Route 
            path="/room/:roomId" 
            element={
              <ProtectedRoute>
                <ReadingRoom />
              </ProtectedRoute>
            } 
          />

          {/* Catch all - Redirect to Landing */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
