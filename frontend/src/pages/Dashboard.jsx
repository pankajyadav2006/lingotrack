import { useState, useEffect, useContext, useRef } from 'react';
import {
  Flame, BrainCircuit, Target, Award, ArrowRight,
  BookOpen, AlertTriangle, PlayCircle, Zap, TrendingUp,
  Languages, Volume2, ChevronRight, Calendar, Star
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';
import api from '../services/api';
import AuthContext from '../context/AuthContext';
import { PageTransition } from '../components/AnimationUtils';
import { motion, useInView, animate } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getLanguageName } from '../constants/languages';

// ── Circular Ring Progress ───────────────────────────────────────────────────
const CircularRing = ({ value, max = 100, size = 96, stroke = 8, color, label, sublabel }) => {
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  const offset = circumference - pct * circumference;
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F3F4F6" strokeWidth={stroke} />
          <motion.circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={inView ? { strokeDashoffset: offset } : {}}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-black text-gray-800 dark:text-gray-100 leading-none">{value}</span>
          {sublabel && <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{sublabel}</span>}
        </div>
      </div>
      {label && <p className="text-xs font-black text-gray-500 uppercase tracking-widest text-center">{label}</p>}
    </div>
  );
};

// ── Animated Counter ─────────────────────────────────────────────────────────
const Counter = ({ to, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const ctrl = animate(0, to, { duration: 1.2, ease: 'easeOut', onUpdate: v => setCount(Math.round(v)) });
    return () => ctrl.stop();
  }, [inView, to]);

  return <span ref={ref}>{count}{suffix}</span>;
};

// ── Animated Progress Bar ────────────────────────────────────────────────────
const ProgressBar = ({ value, max = 100, color }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div ref={ref} className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={inView ? { width: `${pct}%` } : {}}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
      />
    </div>
  );
};

// ── Custom Tooltip for BarChart ──────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-2xl px-4 py-3 shadow-xl">
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-xl font-black text-primary-500">{payload[0].value} <span className="text-xs text-gray-400">words</span></p>
      </div>
    );
  }
  return null;
};

// ── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, suffix, sub, iconBg, iconColor, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-[28px] p-6 hover:shadow-xl hover:-translate-y-1 transition-all group cursor-default"
  >
    <div className="flex items-start justify-between mb-5">
      <div className={`p-3 rounded-2xl ${iconBg} group-hover:scale-110 transition-transform`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      {sub && (
        <span className="text-[10px] font-black text-green-500 bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900 px-2 py-1 rounded-full uppercase tracking-wide">
          {sub}
        </span>
      )}
    </div>
    <p className="text-3xl font-black text-gray-800 dark:text-gray-100 leading-none mb-2">
      <Counter to={Number(value) || 0} suffix={suffix || ''} />
    </p>
    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{label}</p>
  </motion.div>
);

// ════════════════════════════════════════════════════════════════════════════
const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [vocab, setVocab] = useState([]);
  const [weakWords, setWeakWords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [progressRes, vocabRes, weakRes] = await Promise.all([
          api.get('/progress'),
          api.get('/vocabulary'),
          api.get('/vocabulary/weak'),
        ]);
        setStats(progressRes.data.data);
        setVocab((vocabRes.data.data || []).slice(0, 5));
        setWeakWords((weakRes.data.data || []).slice(0, 4));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full"
      />
      <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Loading Your Dashboard</p>
    </div>
  );

  const accuracy = stats?.totalQuizTaken > 0
    ? Math.round((stats.totalCorrectQuizAnswers / (stats.totalQuizTaken * 10)) * 100)
    : 0;

  const chartColors = stats?.chartData?.map((d, i) => {
    if (i === stats.chartData.length - 1) return '#58cc02';
    return d.words > 3 ? '#a3e635' : '#d1fae5';
  }) || [];

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <PageTransition className="min-h-screen bg-gray-50/50 dark:bg-gray-950 transition-colors px-6 py-10 max-w-7xl mx-auto">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
        <div>
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" /> {today}
          </p>
          <h1 className="text-4xl font-black text-gray-800 dark:text-gray-100 tracking-tight">
            Hey, {user?.username}! 👋
          </h1>
          <p className="text-gray-500 font-bold mt-1.5 flex items-center gap-2">
            You're learning
            <span className="font-black text-primary-500 bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-900 px-3 py-0.5 rounded-full text-sm uppercase tracking-widest">
              {getLanguageName(user?.targetLanguage)}
            </span>
          </p>
        </div>

        <Link
          to="/translator"
          className="flex items-center gap-2 bg-primary-500 text-white font-black px-6 py-3 rounded-2xl shadow-[0_4px_0_0_#46a302] hover:translate-y-1 hover:shadow-none transition-all text-sm uppercase tracking-widest"
        >
          <Zap className="w-4 h-4" /> Start Translating
        </Link>
      </div>

      {/* ── Top Stats Row ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard icon={Flame} label="Day Streak" value={stats?.currentStreak || 0} suffix=" 🔥" iconBg="bg-orange-50 dark:bg-orange-950/30" iconColor="text-orange-500" delay={0} />
        <StatCard icon={BrainCircuit} label="Words Mastered" value={stats?.wordsLearned || 0} sub="+3 today" iconBg="bg-primary-50 dark:bg-primary-950/30" iconColor="text-primary-500" delay={0.05} />
        <StatCard icon={Target} label="Total XP" value={user?.totalScore || 0} suffix=" xp" iconBg="bg-sky-50 dark:bg-sky-950/30" iconColor="text-sky-500" delay={0.1} />
        <StatCard icon={Award} label="Best Streak" value={stats?.highestStreak || 0} suffix=" days" iconBg="bg-purple-50 dark:bg-purple-950/30" iconColor="text-purple-500" delay={0.15} />
      </div>

      {/* ── Main Grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">

        {/* -- Weekly Chart (2/3 width) -- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="xl:col-span-2 bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-[32px] p-8 shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-black text-gray-800 dark:text-gray-100">Weekly Activity</h2>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-1">Words learned per day</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-black text-primary-500 bg-primary-50 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-900 px-3 py-2 rounded-xl">
              <TrendingUp className="w-3.5 h-3.5" /> Last 7 Days
            </div>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.chartData || []} barSize={32} barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontWeight: '900', fontSize: 11 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontWeight: '900', fontSize: 11 }} dx={-8} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(88,204,2,0.05)', radius: 12 }} />
                <Bar dataKey="words" radius={[12, 12, 6, 6]}>
                  {(stats?.chartData || []).map((_, i) => (
                    <Cell key={i} fill={chartColors[i] || '#d1fae5'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* -- Circular Progress (1/3 width) -- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-[32px] p-8 shadow-sm flex flex-col justify-between"
        >
          <div className="mb-6">
            <h2 className="text-xl font-black text-gray-800 dark:text-gray-100">Progress Overview</h2>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-1">Your mastery metrics</p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <CircularRing value={stats?.currentStreak || 0} max={30} size={88} stroke={8} color="#f97316" label="Streak" sublabel="days" />
            <CircularRing value={Math.min(stats?.wordsLearned || 0, 100)} max={100} size={88} stroke={8} color="#58cc02" label="Words" sublabel="/ 100" />
            <CircularRing value={accuracy} max={100} size={88} stroke={8} color="#1cb0f6" label="Accuracy" sublabel="%" />
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-xs font-black text-gray-500">Daily Goal (10 words)</span>
                <span className="text-xs font-black text-primary-500">{Math.min(stats?.wordsLearned || 0, 10)}/10</span>
              </div>
              <ProgressBar value={Math.min(stats?.wordsLearned || 0, 10)} max={10} color="#58cc02" />
            </div>
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-xs font-black text-gray-500">Quiz Accuracy</span>
                <span className="text-xs font-black text-sky-500">{accuracy}%</span>
              </div>
              <ProgressBar value={accuracy} max={100} color="#1cb0f6" />
            </div>
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-xs font-black text-gray-500">Streak Goal (7 days)</span>
                <span className="text-xs font-black text-orange-500">{Math.min(stats?.currentStreak || 0, 7)}/7</span>
              </div>
              <ProgressBar value={Math.min(stats?.currentStreak || 0, 7)} max={7} color="#f97316" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Bottom 3-Column Grid ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* -- Continue Learning -- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-[32px] p-8 shadow-xl shadow-primary-500/20 flex flex-col justify-between text-white"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
              <PlayCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">CONTINUE</span>
          </div>

          <div className="space-y-2 mb-8">
            <h2 className="text-2xl font-black leading-tight">Continue Learning</h2>
            <p className="text-white/70 font-bold text-sm">You have {weakWords.length} words that need review and more vocabulary to discover.</p>
          </div>

          <div className="space-y-3 mb-8">
            <Link to="/quiz" className="flex items-center justify-between bg-white/20 hover:bg-white/30 backdrop-blur-sm px-5 py-3.5 rounded-2xl transition-all group">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5" />
                <span className="font-black text-sm">Practice Quiz</span>
              </div>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/translator" className="flex items-center justify-between bg-white/20 hover:bg-white/30 backdrop-blur-sm px-5 py-3.5 rounded-2xl transition-all group">
              <div className="flex items-center gap-3">
                <Languages className="w-5 h-5" />
                <span className="font-black text-sm">Translate & Discover</span>
              </div>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/vocabulary" className="flex items-center justify-between bg-white/20 hover:bg-white/30 backdrop-blur-sm px-5 py-3.5 rounded-2xl transition-all group">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5" />
                <span className="font-black text-sm">Browse Library</span>
              </div>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="border-t border-white/20 pt-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-2">Today's Progress</p>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(((stats?.wordsLearned || 0) / 10) * 100, 100)}%` }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.6 }}
              />
            </div>
          </div>
        </motion.div>

        {/* -- Recent Words -- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-[32px] p-8 shadow-sm"
        >
          <div className="flex items-center justify-between mb-7">
            <div>
              <h2 className="text-xl font-black text-gray-800 dark:text-gray-100">Recent Words</h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Your latest additions</p>
            </div>
            <Link to="/vocabulary" className="text-primary-500 hover:text-primary-600 transition-colors">
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {vocab.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BookOpen className="w-10 h-10 text-gray-200 dark:text-gray-700 mb-4" />
              <p className="font-black text-gray-400 text-sm">No saved words yet</p>
              <Link to="/translator" className="text-primary-500 font-black text-xs mt-2">Translate something →</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {vocab.map((w, i) => (
                <motion.div
                  key={w._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  className="flex items-center justify-between bg-gray-50 dark:bg-gray-950/60 rounded-2xl px-4 py-3.5 hover:bg-primary-50 dark:hover:bg-primary-950/20 hover:border-primary-100 border-2 border-transparent transition-all group"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-black text-gray-800 dark:text-gray-100 text-sm truncate">{w.translatedText}</p>
                    <p className="text-[10px] font-bold text-gray-400 truncate">{w.originalText}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                      w.learningStatus === 'mastered'
                        ? 'text-yellow-600 bg-yellow-50 border-yellow-200'
                        : w.learningStatus === 'learning'
                          ? 'text-primary-600 bg-primary-50 border-primary-200'
                          : 'text-gray-500 bg-gray-100 border-gray-200'
                    }`}>
                      {w.learningStatus}
                    </span>
                    <Volume2 className="w-3.5 h-3.5 text-gray-300 group-hover:text-primary-500 transition-colors" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <Link
            to="/vocabulary"
            className="mt-6 flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl py-3 text-xs font-black text-gray-400 hover:border-primary-400 hover:text-primary-500 transition-all"
          >
            View Full Library <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>

        {/* -- Weak Areas -- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-[32px] p-8 shadow-sm"
        >
          <div className="flex items-center justify-between mb-7">
            <div>
              <h2 className="text-xl font-black text-gray-800 dark:text-gray-100">Weak Areas</h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Focus here to improve</p>
            </div>
            <div className="bg-red-50 dark:bg-red-950/20 p-2.5 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
          </div>

          {weakWords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Star className="w-10 h-10 text-yellow-300 mb-4" />
              <p className="font-black text-gray-800 dark:text-gray-100 text-sm">All caught up!</p>
              <p className="text-xs text-gray-400 font-bold mt-1">No weak words. Amazing work!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {weakWords.map((w, i) => {
                const strength = Math.max(10, Math.min(85, (w.reviewCount || 0) * 15));
                return (
                  <motion.div
                    key={w._id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.45 + i * 0.05 }}
                    className="group"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-black text-gray-800 dark:text-gray-100 text-sm truncate">{w.translatedText}</p>
                          <span className="text-[9px] font-black text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 px-1.5 py-0.5 rounded-full uppercase tracking-widest flex-shrink-0">Weak</span>
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 truncate">{w.originalText}</p>
                      </div>
                      <span className="text-xs font-black text-gray-400 ml-3 flex-shrink-0">{strength}%</span>
                    </div>
                    <ProgressBar value={strength} max={100} color={strength < 30 ? '#ef4444' : strength < 60 ? '#f97316' : '#eab308'} />
                  </motion.div>
                );
              })}
            </div>
          )}

          <Link
            to="/quiz"
            className="mt-6 flex items-center justify-center gap-2 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/40 text-red-500 border-2 border-red-100 dark:border-red-900 rounded-2xl py-3 text-xs font-black transition-all"
          >
            <Target className="w-4 h-4" />
            Practice Weak Words
          </Link>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default Dashboard;
