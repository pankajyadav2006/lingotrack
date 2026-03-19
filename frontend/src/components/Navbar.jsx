import { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, BookOpen, User, Languages, FileQuestion, Moon, Sun } from 'lucide-react';
import AuthContext from '../context/AuthContext';
import ThemeContext from '../context/ThemeContext';
import { HoverButton } from './AnimationUtils';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;
  
  const linkClass = (path) => `flex items-center gap-2 font-bold px-3 py-2 rounded-xl transition-colors ${
    isActive(path) 
      ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400' 
      : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
  }`;

  if (!user) return null;

  return (
    <nav className="bg-white dark:bg-gray-900 border-b-2 border-gray-200 dark:border-gray-800 sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 text-2xl font-black text-primary-500 dark:text-primary-400 tracking-tight">
            <Languages className="w-8 h-8" />
            LingoTrack
          </Link>

          <div className="flex items-center gap-2">
            <Link to="/" className={linkClass('/')}>
              <User className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>
            <Link to="/translator" className={linkClass('/translator')}>
              <Languages className="w-5 h-5" />
              <span>Translate</span>
            </Link>
            <Link to="/vocabulary" className={linkClass('/vocabulary')}>
              <BookOpen className="w-5 h-5" />
              <span>Vocabulary</span>
            </Link>
            <Link to="/quiz" className={linkClass('/quiz')}>
              <FileQuestion className="w-5 h-5" />
              <span>Quiz</span>
            </Link>
            <Link to="/profile" className={linkClass('/profile')}>
              <User className="w-5 h-5" />
              <span>Profile</span>
            </Link>
            
            <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 mx-1"></div>
            
            <HoverButton 
              onClick={toggleTheme}
              className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 font-bold px-3 py-2 rounded-xl transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </HoverButton>

            <HoverButton 
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-bold px-3 py-2 rounded-xl transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </HoverButton>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
