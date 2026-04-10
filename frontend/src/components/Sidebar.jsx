import { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LogOut, BookOpen, User, Languages, FileQuestion,
  Moon, Sun, LayoutDashboard, Flame, Star
} from 'lucide-react';
import AuthContext from '../context/AuthContext';
import ThemeContext from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

/* ── XP → Level helper ─────────────────────────────────────────────────── */
const getLevel = (xp = 0) => {
  const level = Math.floor(xp / 100) + 1;
  const progress = xp % 100; // 0-99
  return { level, progress };
};

/* ── Nav items ──────────────────────────────────────────────────────────── */
const navItems = [
  { path: '/dashboard',  label: 'Learn',     icon: LayoutDashboard, accent: '#58cc02' },
  { path: '/vocabulary', label: 'Library',   icon: BookOpen,        accent: '#1cb0f6' },
  { path: '/translator', label: 'Translate', icon: Languages,       accent: '#ff9600' },
  { path: '/quiz',       label: 'Practice',  icon: FileQuestion,    accent: '#ff4b4b' },
  { path: '/profile',    label: 'Profile',   icon: User,            accent: '#a855f7' },
];

/* ════════════════════════════════════════════════════════════════════════ */
const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };
  const isActive = (path) =>
    location.pathname === path || (path === '/dashboard' && location.pathname === '/');

  const { level, progress } = getLevel(user?.totalScore || 0);
  const initials = user?.username?.[0]?.toUpperCase() || '?';

  return (
    <aside className="fixed left-0 top-0 h-screen w-[72px] lg:w-64 flex flex-col bg-white dark:bg-gray-900 border-r-2 border-gray-100 dark:border-gray-800 z-50 transition-colors duration-300 select-none">

      {/* ── Logo ────────────────────────────────────────────────────── */}
      <div className="px-4 pt-6 pb-5 border-b-2 border-gray-50 dark:border-gray-800">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 flex-shrink-0 bg-primary-500 rounded-2xl flex items-center justify-center shadow-[0_4px_0_0_#46a302] group-hover:translate-y-0.5 group-hover:shadow-[0_2px_0_0_#46a302] transition-all">
            <Languages className="text-white w-5 h-5" />
          </div>
          <span className="hidden lg:block text-xl font-black text-gray-700 dark:text-gray-100 tracking-tight">
            lingo<span className="text-primary-500">track</span>
          </span>
        </Link>
      </div>

      {/* ── Navigation ──────────────────────────────────────────────── */}
      <nav className="flex-1 px-3 pt-4 space-y-1 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              title={item.label}
              className={`relative flex items-center gap-3 px-3 py-3 rounded-2xl font-black text-sm transition-all duration-150 group
                ${active
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                  : 'text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
            >
              {/* Active indicator bar */}
              {active && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute -left-3 top-2 bottom-2 w-1 rounded-r-full bg-primary-500"
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}

              {/* Icon */}
              <item.icon
                className="w-5 h-5 flex-shrink-0 transition-colors"
                style={active ? { color: item.accent } : {}}
              />

              {/* Label */}
              <span className="hidden lg:block tracking-wide uppercase text-xs">
                {item.label}
              </span>

              {/* Active dot (mobile only) */}
              {active && (
                <span className="lg:hidden absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary-500" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Bottom Footer ────────────────────────────────────────────── */}
      <div className="px-3 pb-4 pt-3 border-t-2 border-gray-50 dark:border-gray-800 space-y-1">

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200 transition-all font-black text-xs uppercase tracking-wide"
          title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={theme}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {theme === 'dark'
                ? <Sun className="w-5 h-5 text-yellow-400" />
                : <Moon className="w-5 h-5 text-secondary-400" />
              }
            </motion.div>
          </AnimatePresence>
          <span className="hidden lg:block">
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </span>
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-gray-400 dark:text-gray-500 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500 transition-all font-black text-xs uppercase tracking-wide"
          title="Logout"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span className="hidden lg:block">Logout</span>
        </button>

        {/* ── User XP Card (desktop only) ──────────────────────────── */}
        {user && (
          <div className="hidden lg:block mt-3 rounded-[20px] bg-gray-50 dark:bg-gray-800/80 border-2 border-gray-100 dark:border-gray-700 p-4 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-9 h-9 rounded-[14px] bg-primary-500 flex items-center justify-center font-black text-white text-sm shadow-[0_2px_0_0_#46a302]">
                  {initials}
                </div>
                {/* Streak badge */}
                {(user?.currentStreak || 0) > 0 && (
                  <div className="absolute -top-1.5 -right-1.5 flex items-center gap-0.5 bg-orange-400 text-white text-[9px] font-black px-1 py-0.5 rounded-full shadow-sm">
                    <Flame className="w-2.5 h-2.5" />
                    {user.currentStreak}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-gray-700 dark:text-gray-100 truncate leading-none mb-0.5">
                  {user.username}
                </p>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Level {level}
                  </span>
                </div>
              </div>
            </div>

            {/* XP Progress Bar */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">XP Progress</span>
                <span className="text-[9px] font-black text-primary-500">{progress}/100</span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-primary-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
                />
              </div>
              <p className="text-[9px] font-black text-gray-400 mt-1 uppercase tracking-widest">
                {100 - progress} XP to Level {level + 1}
              </p>
            </div>
          </div>
        )}

        {/* Mobile avatar only */}
        {user && (
          <div className="lg:hidden flex justify-center pt-1">
            <div className="w-9 h-9 rounded-2xl bg-primary-500 flex items-center justify-center font-black text-white text-sm shadow-[0_2px_0_0_#46a302]">
              {initials}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
