import { useState, useEffect, useContext } from 'react';
import { Flame, BrainCircuit, Target, Award } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import AuthContext from '../context/AuthContext';
import { PageTransition } from '../components/AnimationUtils';

// Chart data will be fetched from API

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/progress');
        setStats(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-8 text-center font-bold text-gray-500 text-xl">Loading stats...</div>;

  return (
    <PageTransition className="max-w-5xl mx-auto p-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-800 dark:text-gray-100 transition-colors">Welcome back, {user?.username}! 🌍</h1>
        <p className="text-gray-500 dark:text-gray-400 font-bold text-lg mt-1 transition-colors">
          Keep your streak alive. You're learning <span className="uppercase text-primary-500 bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded-lg border-2 border-primary-100 dark:border-primary-800 transition-colors">{user?.targetLanguage}</span>!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Streak Card */}
        <div className="card flex items-center gap-4">
          <div className="bg-orange-100 dark:bg-orange-900/30 p-4 rounded-xl transition-colors">
            <Flame className="w-8 h-8 text-orange-500 dark:text-orange-400" />
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400 font-bold uppercase text-sm tracking-wider">Day Streak</p>
            <p className="text-3xl font-black text-gray-800 dark:text-gray-100">{stats?.currentStreak || 0}</p>
          </div>
        </div>

        {/* Total Learned */}
        <div className="card flex items-center gap-4">
          <div className="bg-primary-100 dark:bg-primary-900/40 p-4 rounded-xl transition-colors">
            <BrainCircuit className="w-8 h-8 text-primary-500 dark:text-primary-400" />
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400 font-bold uppercase text-sm tracking-wider">Words Mastered</p>
            <p className="text-3xl font-black text-gray-800 dark:text-gray-100">{stats?.wordsLearned || 0}</p>
          </div>
        </div>

        {/* Total Score */}
        <div className="card flex items-center gap-4">
          <div className="bg-secondary-100 dark:bg-secondary-900/40 p-4 rounded-xl transition-colors">
            <Target className="w-8 h-8 text-secondary-500 dark:text-secondary-400" />
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400 font-bold uppercase text-sm tracking-wider">Total Score</p>
            <p className="text-3xl font-black text-gray-800 dark:text-gray-100">{user?.totalScore || 0}</p>
          </div>
        </div>

        {/* Top Streak */}
        <div className="card flex items-center gap-4">
          <div className="bg-purple-100 dark:bg-purple-900/40 p-4 rounded-xl transition-colors">
            <Award className="w-8 h-8 text-purple-500 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400 font-bold uppercase text-sm tracking-wider">Best Streak</p>
            <p className="text-3xl font-black text-gray-800 dark:text-gray-100">{stats?.highestStreak || 0}</p>
          </div>
        </div>
      </div>

      <div className="card mb-8">
        <h2 className="text-xl font-black text-gray-800 dark:text-gray-100 mb-6 transition-colors">Learning Activity</h2>
        <div className="h-72 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50}>
            <AreaChart data={stats?.chartData || []}>
              <defs>
                <linearGradient id="colorWords" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" style={{ opacity: 0.3 }} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontWeight: 'bold'}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontWeight: 'bold'}} dx={-10} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', fontWeight: 'bold', color: '#1F2937' }}
              />
              <Area type="monotone" dataKey="words" stroke="#16a34a" strokeWidth={4} fillOpacity={1} fill="url(#colorWords)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </PageTransition>
  );
};

export default Dashboard;
