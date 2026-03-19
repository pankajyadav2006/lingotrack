import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Translator from './pages/Translator';
import Vocabulary from './pages/Vocabulary';
import Quiz from './pages/Quiz';
import Profile from './pages/Profile';
import AuthContext from './context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500 text-xl">Loading Language Data...</div>;
  return user ? children : <Navigate to="/login" />;
};

function App() {
  const { user } = useContext(AuthContext);

  return (
    <BrowserRouter>
      {user && <Navbar />}
      <div className="min-h-screen bg-background dark:bg-gray-900 pb-12 transition-colors duration-300">
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/translator" element={<ProtectedRoute><Translator /></ProtectedRoute>} />
          <Route path="/vocabulary" element={<ProtectedRoute><Vocabulary /></ProtectedRoute>} />
          <Route path="/quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
