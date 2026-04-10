import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { Languages, ShieldCheck, Mail, Lock, User, Globe } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../constants/languages';
import { motion, AnimatePresence } from 'framer-motion';
import { Shake, HoverButton } from '../components/AnimationUtils';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    baseLanguage: 'en',
    targetLanguage: 'es'
  });

  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('mode') === 'register') {
      setIsLogin(false);
    }
  }, [location]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-6 font-sans transition-colors duration-300">
      
      {/* Background Ambient Mesh */}
      <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[120%] bg-gradient-to-br from-primary-400/10 via-transparent to-secondary-400/10 dark:from-primary-900/20 dark:via-gray-950 dark:to-secondary-900/10 blur-3xl pointer-events-none -z-10 transition-colors duration-500" />

      <div className="w-full max-w-[420px] flex flex-col z-10">
        {/* Branding */}
        <div className="text-center mb-10 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2 group">
                <div className="w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center shadow-[0_4px_0_0_#46a302] group-hover:translate-y-1 group-hover:shadow-none transition-all">
                    <Languages className="text-white w-7 h-7" />
                </div>
                <span className="text-3xl font-black text-gray-700 dark:text-gray-100 tracking-tighter transition-colors">lingotrack</span>
            </Link>
            <h1 className="text-2xl font-black text-gray-600 dark:text-gray-300 transition-colors">
                {isLogin ? 'Log in' : 'Create your profile'}
            </h1>
        </div>

        {error && (
            <Shake active={true}>
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-50 dark:bg-red-950/40 text-red-500 p-4 rounded-2xl mb-6 font-bold text-sm text-center border-2 border-red-100 dark:border-red-900 flex items-center justify-center gap-2 transition-colors"
                >
                    <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                    {error}
                </motion.div>
            </Shake>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="popLayout">
            {!isLogin && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="relative group overflow-hidden"
              >
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                  <input
                      type="text"
                      name="username"
                      placeholder="Username"
                      value={formData.username}
                      onChange={handleChange}
                      className="w-full bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 outline-none focus:border-primary-500 dark:focus:border-primary-500 transition-all shadow-sm"
                      required
                  />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
              <input
                type="email"
                name="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 outline-none focus:border-primary-500 dark:focus:border-primary-500 transition-all shadow-sm"
                required
              />
          </div>

          <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 outline-none focus:border-primary-500 dark:focus:border-primary-500 transition-all shadow-sm"
                required
              />
          </div>

          <AnimatePresence>
          {!isLogin && (
            <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="grid grid-cols-2 gap-4 pt-2 overflow-hidden"
            >
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1 transition-colors">Native Language</label>
                <div className="relative">
                    <select 
                        name="baseLanguage" 
                        value={formData.baseLanguage} 
                        onChange={handleChange}
                        className="w-full bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-xl py-3 px-3 text-xs font-bold text-gray-600 dark:text-gray-300 outline-none focus:border-secondary-500 dark:focus:border-secondary-500 transition-all appearance-none"
                    >
                        {SUPPORTED_LANGUAGES.map(lang => (
                            <option key={lang.code} value={lang.code}>{lang.name}</option>
                        ))}
                    </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1 transition-colors">Target Language</label>
                <div className="relative">
                    <select 
                        name="targetLanguage" 
                        value={formData.targetLanguage} 
                        onChange={handleChange}
                        className="w-full bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-xl py-3 px-3 text-xs font-bold text-gray-600 dark:text-gray-300 outline-none focus:border-primary-500 dark:focus:border-primary-500 transition-all appearance-none"
                    >
                        {SUPPORTED_LANGUAGES.map(lang => (
                            <option key={lang.code} value={lang.code}>{lang.name}</option>
                        ))}
                    </select>
                </div>
              </div>
            </motion.div>
          )}
          </AnimatePresence>

          <HoverButton type="submit" className="w-full bg-primary-500 text-white py-4 uppercase tracking-[0.2em] text-sm font-black rounded-2xl shadow-[0_4px_0_0_#46a302] hover:translate-y-1 hover:shadow-none transition-all mt-4">
            {isLogin ? 'Log In' : 'Sign Up'}
          </HoverButton>
        </form>

        <div className="mt-12 text-center flex flex-col gap-4">
            <p className="text-gray-400 dark:text-gray-500 font-bold text-sm transition-colors">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
            </p>
            <button 
                onClick={() => setIsLogin(!isLogin)}
                className="w-full py-4 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-2xl text-secondary-500 dark:text-secondary-400 font-black uppercase text-xs tracking-widest hover:bg-gray-50 dark:hover:bg-gray-800 active:translate-y-1 active:border-b-0 transition-all shadow-[0_4px_0_0_#e5e7eb] dark:shadow-[0_4px_0_0_#1f2937] hover:shadow-[0_2px_0_0_#e5e7eb] dark:hover:shadow-[0_2px_0_0_#1f2937]"
            >
                {isLogin ? 'Create Account' : 'Log in instead'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
