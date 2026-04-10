import { useState, useEffect, useContext } from 'react';
import { User, Flame, BrainCircuit, Target, Award, Save, CheckCircle2, AlertCircle, Loader2, Globe } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import AuthContext from '../context/AuthContext';
import { PageTransition, HoverButton, HoverCard } from '../components/AnimationUtils';
import { SUPPORTED_LANGUAGES } from '../constants/languages';
import { motion } from 'framer-motion';

const Profile = () => {
  const { user, updateUserInfo } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    username: user?.username || '',
    baseLanguage: user?.baseLanguage || 'en',
    targetLanguage: user?.targetLanguage || 'es'
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/progress');
        setStats(res.data.data);
      } catch (err) {
        console.error('Failed to fetch stats', err);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await api.put('/auth/profile', formData);
      if (res.data.success) {
        updateUserInfo(res.data.data);
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Update failed' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageTransition className="px-6 py-12 max-w-7xl mx-auto transition-colors">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-gray-800 dark:text-gray-100 tracking-tight transition-colors">Settings & Stats</h1>
        <p className="text-lg text-gray-500 font-bold mt-2 transition-colors">Manage your profile and track your learning journey.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Profile Settings */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-[32px] p-8 shadow-sm transition-colors">
            <div className="flex items-center gap-4 mb-10 pb-6 border-b-2 border-gray-50 dark:border-gray-800">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-[22px] flex items-center justify-center font-black text-2xl text-primary-600">
                {user?.username[0].toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <h2 className="text-xl font-black text-gray-800 dark:text-gray-100 truncate">{user?.username}</h2>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{user?.email}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Display Name</label>
                <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-950 border-2 border-transparent focus:border-primary-500 rounded-2xl font-black text-gray-700 dark:text-gray-100 outline-none transition-all"
                    />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Daily Language</label>
                  <select
                    name="baseLanguage"
                    value={formData.baseLanguage}
                    onChange={handleChange}
                    className="w-full p-4 bg-gray-50 dark:bg-gray-950 border-2 border-transparent rounded-2xl font-black text-gray-700 dark:text-gray-100 outline-none transition-all appearance-none"
                  >
                    {SUPPORTED_LANGUAGES.map(lang => (
                      <option key={lang.code} value={lang.code}>{lang.native}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Learning</label>
                  <select
                    name="targetLanguage"
                    value={formData.targetLanguage}
                    onChange={handleChange}
                    className="w-full p-4 bg-gray-50 dark:bg-gray-950 border-2 border-transparent focus:border-primary-500 rounded-2xl font-black text-gray-700 dark:text-gray-100 outline-none transition-all appearance-none"
                  >
                    {SUPPORTED_LANGUAGES.map(lang => (
                      <option key={lang.code} value={lang.code}>{lang.native}</option>
                    ))}
                  </select>
                </div>
              </div>

              {message.text && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-4 rounded-2xl flex items-center gap-3 font-black text-xs transition-all border-2 ${message.type === 'success' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}
                >
                  {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                  {message.text}
                </motion.div>
              )}

              <HoverButton
                type="submit"
                disabled={saving}
                className="w-full bg-primary-500 text-white py-4 uppercase tracking-[0.2em] text-xs font-black shadow-[0_4px_0_0_#46a302] hover:translate-y-1 hover:shadow-none transition-all mt-4 rounded-2xl"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Synchronizing</span>
                ) : (
                  <span className="flex items-center justify-center gap-2"><Save className="w-5 h-5" /> Save Changes</span>
                )}
              </HoverButton>
            </form>
          </div>
        </div>

        {/* Right Side: Activity Visualization */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-[32px] p-8 shadow-sm transition-colors">
            <div className="flex items-center justify-between mb-10 pb-6 border-b-2 border-gray-50 dark:border-gray-800 transition-colors">
              <div className="flex items-center gap-4">
                <div className="bg-primary-500 text-white p-3 rounded-2xl shadow-lg shadow-primary-500/20">
                    <Target className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100 transition-colors">Learning Momentum</h2>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Global Standing</p>
                <p className="text-2xl font-black text-primary-500">Unranked</p>
              </div>
            </div>

            {loadingStats ? (
              <div className="h-[300px] flex flex-col items-center justify-center gap-4 text-gray-400">
                <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
                <p className="font-black text-xs uppercase tracking-widest">Aggregating Data...</p>
              </div>
            ) : (
              <div className="h-[360px] w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50}>
                  <AreaChart data={stats?.chartData || []}>
                    <defs>
                      <linearGradient id="colorWordsProfile" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#58cc02" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#58cc02" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" style={{ opacity: 0.2 }} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontWeight: '900', fontSize: '10px'}} dy={15} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontWeight: '900', fontSize: '10px'}} dx={-15} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '24px', border: '2px solid #F3F4F6', fontWeight: 'bold', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
                    />
                    <Area type="monotone" dataKey="words" stroke="#58cc02" strokeWidth={5} fillOpacity={1} fill="url(#colorWordsProfile)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
                <HoverCard className="h-full">
                  <div className="h-full bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/20 dark:to-orange-900/10 p-6 rounded-[24px] border-2 border-orange-100 dark:border-orange-900 transition-colors">
                      <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-3">Longest Streak</p>
                      <div className="flex items-center gap-3">
                          <Flame className="w-8 h-8 text-orange-500" />
                          <p className="text-3xl font-black text-orange-600 dark:text-orange-400">{stats?.highestStreak || 0} <span className="text-xs uppercase opacity-60">Days</span></p>
                      </div>
                  </div>
                </HoverCard>
                <HoverCard className="h-full">
                  <div className="h-full bg-gradient-to-br from-primary-50 to-primary-100/50 dark:from-primary-950/20 dark:to-primary-900/10 p-6 rounded-[24px] border-2 border-primary-100 dark:border-primary-900 transition-colors">
                      <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest mb-3">Words Mastered</p>
                      <div className="flex items-center gap-3">
                          <BrainCircuit className="w-8 h-8 text-primary-500" />
                          <p className="text-3xl font-black text-primary-600 dark:text-primary-400">{stats?.wordsLearned || 0}</p>
                      </div>
                  </div>
                </HoverCard>
                <HoverCard className="h-full">
                  <div className="h-full bg-gradient-to-br from-secondary-50 to-secondary-100/50 dark:from-secondary-950/20 dark:to-secondary-900/10 p-6 rounded-[24px] border-2 border-secondary-100 dark:border-secondary-900 transition-colors">
                      <p className="text-[10px] font-black text-secondary-400 uppercase tracking-widest mb-3">Total Quizzes</p>
                      <div className="flex items-center gap-3">
                          <Award className="w-8 h-8 text-secondary-500" />
                          <p className="text-3xl font-black text-secondary-600 dark:text-secondary-400">{stats?.totalQuizTaken || 0}</p>
                      </div>
                  </div>
                </HoverCard>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Profile;
