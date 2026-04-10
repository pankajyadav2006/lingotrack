import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { motion } from 'framer-motion';
import { Languages } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Translator from './pages/Translator';
import Vocabulary from './pages/Vocabulary';
import Quiz from './pages/Quiz';
import Profile from './pages/Profile';
import Home from './pages/Home';
import AuthContext from './context/AuthContext';

/* ── Full-screen loading splash ──────────────────────────────────────── */
const AppLoader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-white dark:bg-gray-950">
    <motion.div
      animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
      transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
      className="w-16 h-16 bg-primary-500 rounded-[22px] flex items-center justify-center shadow-[0_6px_0_0_#46a302]"
    >
      <Languages className="text-white w-9 h-9" />
    </motion.div>
    <div className="flex flex-col items-center gap-2">
      <p className="font-black text-gray-800 dark:text-gray-100 text-xl tracking-tight">
        lingo<span className="text-primary-500">track</span>
      </p>
      <div className="flex gap-1.5 mt-1">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-primary-400"
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
            transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
          />
        ))}
      </div>
    </div>
  </div>
);

/* ── Protected route wrapper ─────────────────────────────────────────── */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <AppLoader />;
  return user ? children : <Navigate to="/login" />;
};

/* ══════════════════════════════════════════════════════════════════════ */
function App() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <AppLoader />;

  return (
    <BrowserRouter>
      {user && <Sidebar />}
      <div
        className={`min-h-screen transition-colors duration-300 bg-gray-50 dark:bg-gray-950 ${
          user ? 'pl-[72px] lg:pl-64' : ''
        }`}
      >
        <main className="min-h-screen">
          <Routes>
            {/* Public */}
            <Route path="/"      element={user ? <Navigate to="/dashboard" /> : <Home />} />
            <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />

            {/* Protected */}
            <Route path="/dashboard"  element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/translator" element={<ProtectedRoute><Translator /></ProtectedRoute>} />
            <Route path="/vocabulary" element={<ProtectedRoute><Vocabulary /></ProtectedRoute>} />
            <Route path="/quiz"       element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
            <Route path="/profile"    element={<ProtectedRoute><Profile /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to={user ? '/dashboard' : '/'} />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
