import { useState, useEffect, useContext } from 'react';
import { User, Languages, Flame, BrainCircuit, Target, Award, Save, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import AuthContext from '../context/AuthContext';
import { PageTransition, HoverButton } from '../components/AnimationUtils';
import { SUPPORTED_LANGUAGES } from '../constants/languages';

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
    <PageTransition className="max-w-6xl mx-auto p-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Side: Profile Settings */}
        <div className="md:w-1/3 flex flex-col gap-6">
          <div className="card">
            <div className="flex items-center gap-3 mb-6 border-b-2 border-gray-100 dark:border-gray-700 pb-4">
              <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded-lg">
                <User className="w-6 h-6 text-primary-500" />
              </div>
              <h1 className="text-2xl font-black text-gray-800 dark:text-gray-100">Profile Settings</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 block">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-xl font-bold text-gray-800 dark:text-gray-100 outline-none focus:border-primary-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 block">I speak</label>
                  <select
                    name="baseLanguage"
                    value={formData.baseLanguage}
                    onChange={handleChange}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-xl font-bold text-gray-800 dark:text-gray-100 outline-none focus:border-primary-500 transition-colors"
                  >
                    {SUPPORTED_LANGUAGES.map(lang => (
                      <option key={lang.code} value={lang.code}>{lang.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 block">I'm learning</label>
                  <select
                    name="targetLanguage"
                    value={formData.targetLanguage}
                    onChange={handleChange}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-xl font-bold text-gray-800 dark:text-gray-100 outline-none focus:border-primary-500 transition-colors"
                  >
                    {SUPPORTED_LANGUAGES.map(lang => (
                      <option key={lang.code} value={lang.code}>{lang.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {message.text && (
                <div className={`p-4 rounded-xl flex items-center gap-2 font-bold transition-all ${message.type === 'success' ? 'bg-green-50 text-green-600 dark:bg-green-900/20' : 'bg-red-50 text-red-600 dark:bg-red-900/20'}`}>
                  {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  {message.text}
                </div>
              )}

              <HoverButton
                type="submit"
                disabled={saving}
                className="btn-primary w-full flex justify-center items-center gap-2 mt-4"
              >
                {saving ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Updating...</>
                ) : (
                  <><Save className="w-5 h-5" /> Save Changes</>
                )}
              </HoverButton>
            </form>
          </div>

          {/* Mini Stats Card */}
          <div className="card space-y-4">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <span className="font-bold text-gray-600 dark:text-gray-400">Current Streak</span>
                </div>
                <span className="text-2xl font-black text-gray-800 dark:text-gray-100">{stats?.currentStreak || 0}</span>
             </div>
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-primary-500" />
                  <span className="font-bold text-gray-600 dark:text-gray-400">Words Mastered</span>
                </div>
                <span className="text-2xl font-black text-gray-800 dark:text-gray-100">{stats?.wordsLearned || 0}</span>
             </div>
             <div className="flex items-center justify-between border-t-2 border-gray-50 dark:border-gray-800 pt-4">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-secondary-500" />
                  <span className="font-bold text-gray-600 dark:text-gray-400">Total Score</span>
                </div>
                <span className="text-2xl font-black text-gray-800 dark:text-gray-100">{user?.totalScore || 0}</span>
             </div>
          </div>
        </div>

        {/* Right Side: Activity Visualization */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="card flex-1 min-h-[400px]">
            <div className="flex items-center justify-between mb-8 border-b-2 border-gray-100 dark:border-gray-700 pb-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                  <Award className="w-6 h-6 text-green-500" />
                </div>
                <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100">Learning Activity</h2>
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Global Rank</p>
                <p className="text-xl font-black text-primary-500">#42</p>
              </div>
            </div>

            {loadingStats ? (
              <div className="h-64 flex flex-col items-center justify-center gap-4 text-gray-400">
                <Loader2 className="w-10 h-10 animate-spin" />
                <p className="font-bold">Syncing progress...</p>
              </div>
            ) : (
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50}>
                  <AreaChart data={stats?.chartData || []}>
                    <defs>
                      <linearGradient id="colorWordsProfile" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" style={{ opacity: 0.3 }} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontWeight: 'bold'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontWeight: 'bold'}} dx={-10} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', fontWeight: 'bold', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                    />
                    <Area type="monotone" dataKey="words" stroke="#16a34a" strokeWidth={4} fillOpacity={1} fill="url(#colorWordsProfile)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="mt-8 grid grid-cols-2 gap-4">
               <div className="bg-gray-50 dark:bg-gray-900/40 p-6 rounded-2xl border-2 border-gray-100 dark:border-gray-800 transition-colors">
                  <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Longest Streak</p>
                  <p className="text-3xl font-black text-gray-800 dark:text-gray-100">{stats?.highestStreak || 0} Days</p>
               </div>
               <div className="bg-gray-50 dark:bg-gray-900/40 p-6 rounded-2xl border-2 border-gray-100 dark:border-gray-800 transition-colors">
                  <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Total Quizzes</p>
                  <p className="text-3xl font-black text-gray-800 dark:text-gray-100">{stats?.totalQuizTaken || 0}</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Profile;
