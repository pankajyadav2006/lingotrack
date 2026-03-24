import { Target, Trophy, X, ArrowRight, Loader2, CheckCircle2, AlertCircle, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { PageTransition, HoverButton } from '../components/AnimationUtils';
import useTextToSpeech from '../hooks/useTextToSpeech';
import SettingsContext from '../context/SettingsContext';
import AuthContext from '../context/AuthContext';
import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';

const Quiz = () => {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(null); // 'correct' | 'incorrect'
  const [results, setResults] = useState([]); // Array of { wordId, correct, quality }
  const [submitting, setSubmitting] = useState(false);

  const { user } = useContext(AuthContext);
  const { settings } = useContext(SettingsContext);
  const { speak, stop, isSpeaking } = useTextToSpeech();

  const currentWord = words[currentIdx];

  useEffect(() => {
    if (currentWord && settings.autoPlay) {
      handlePlayQuestion();
    }
  }, [currentWord]);

  const handlePlayQuestion = () => {
    speak(currentWord.originalText, {
      lang: user?.baseLanguage === 'en' ? 'en-US' : 'es-ES',
      rate: settings.ttsSpeed,
      pitch: settings.ttsPitch
    });
  };

  useEffect(() => {
    // Fetch quiz words from the SRS endpoint
    const fetchQuizWords = async () => {
      try {
        const res = await api.get('/quiz/generate?limit=10');
        setWords(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizWords();
  }, []);


  const handleOptionSelect = (option) => {
    if (feedback || submitting) return;
    setUserAnswer(option);
    
    // Simple matching check (case insensitive)
    const isCorrect = option.trim().toLowerCase() === currentWord.translatedText.toLowerCase();
    
    if (isCorrect) {
      setScore(score + 1);
      setFeedback('correct');
    } else {
      setFeedback('incorrect');
    }
  };

  const nextQuestion = async (qualityOverride) => {
    // Calculate quality: 5 if perfect, 3 if hesitated (override), 1 if wrong
    const quality = feedback === 'correct' ? (qualityOverride || 5) : 1;
    const isCorrect = feedback === 'correct';

    const newResults = [...results, { wordId: currentWord._id, correct: isCorrect, quality }];
    setResults(newResults);

    if (currentIdx + 1 < words.length) {
      setCurrentIdx(currentIdx + 1);
      setUserAnswer('');
      setFeedback(null);
    } else {
      // Quiz over, save stats
      setSubmitting(true);
      try {
        await api.post('/quiz/submit', { results: newResults });
        // Also update the dashboard progress
        await api.post('/progress/quiz', {
          correctAnswers: score + (isCorrect ? 1 : 0),
          totalQuestions: words.length
        });
      } catch (err) {
        console.error('Failed to save score or SRS data');
      }
      setSubmitting(false);
      setFinished(true);
    }
  };

  if (loading) return (
    <div className="p-8 text-center font-bold text-gray-500 dark:text-gray-400 text-xl flex flex-col justify-center items-center h-[50vh] gap-4">
      <Loader2 className="w-12 h-12 animate-spin text-primary-500" />
      <p className="animate-pulse">Preparing your quiz...</p>
    </div>
  );

  if (words.length === 0) {
    return (
      <PageTransition className="max-w-2xl mx-auto p-4 py-20 text-center">
        <Target className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
        <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100 mb-2 transition-colors">You're all caught up!</h2>
        <p className="text-gray-500 dark:text-gray-400 font-bold mb-8 transition-colors">No vocabulary words are due for review. Learn some new ones!</p>
        <a href="/translator" className="btn-primary inline-flex items-center gap-2">
          Go to Translator
        </a>
      </PageTransition>
    );
  }

  if (finished) {
    return (
      <PageTransition className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <Trophy className="w-32 h-32 text-yellow-400 mb-8" />
        </motion.div>
        <h1 className="text-4xl font-black text-gray-800 dark:text-gray-100 mb-2 transition-colors">Quiz Complete!</h1>
        <p className="text-gray-500 dark:text-gray-400 font-bold text-xl mb-8 transition-colors">
          You scored <span className="text-primary-500 dark:text-primary-400">{score}</span> out of {words.length}
        </p>
        <Link to="/" className="btn-primary text-xl">Back to Dashboard</Link>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="max-w-3xl mx-auto p-4 py-12">
      {/* Progress Bar */}
      <div className="flex items-center gap-4 mb-12">
        <Link to="/" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
          <X className="w-8 h-8" />
        </Link>
        <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden transition-colors">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${((currentIdx) / words.length) * 100}%` }}
            className="h-full bg-primary-500"
            transition={{ duration: 0.5, ease: "easeOut" }}
          ></motion.div>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-3xl font-black text-gray-800 dark:text-gray-100 mb-6 transition-colors font-sans">Translate this meaning:</h2>
        <motion.div 
          key={currentIdx}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-gray-50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700 rounded-3xl p-10 text-center shadow-sm transition-colors relative group"
        >
          <button 
            onClick={handlePlayQuestion}
            className="absolute top-4 right-4 p-2 rounded-full bg-white dark:bg-gray-800 text-primary-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
            title="Hear text"
          >
            <Volume2 className={`w-5 h-5 ${isSpeaking ? 'animate-pulse' : ''}`} />
          </button>
          <p className="text-5xl font-black text-primary-600 dark:text-primary-400 mb-4 transition-colors tracking-tight italic">"{currentWord.originalText}"</p>

        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(currentWord.options || []).map((option, idx) => {
          const isSelected = userAnswer === option;
          const isCorrect = option === currentWord.translatedText;
          const showResult = !!feedback;
          
          let buttonClass = "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 hover:border-primary-400 dark:hover:border-primary-500 shadow-sm";
          
          if (showResult) {
            if (isCorrect) {
              buttonClass = "bg-primary-50 dark:bg-primary-900/40 border-primary-500 text-primary-700 dark:text-primary-300 z-10 scale-[1.02] shadow-md";
            } else if (isSelected) {
              buttonClass = "bg-red-50 dark:bg-red-900/40 border-red-500 text-red-700 dark:text-red-300 opacity-60";
            } else {
              buttonClass = "opacity-40 grayscale-[0.5]";
            }
          }

          return (
            <motion.button
              key={`${currentIdx}-${idx}`}
              whileHover={!showResult ? { y: -4, scale: 1.02 } : {}}
              whileTap={!showResult ? { scale: 0.98 } : {}}
              onClick={() => handleOptionSelect(option)}
              disabled={showResult || submitting}
              className={`w-full text-left p-6 rounded-2xl border-4 font-bold text-xl transition-all flex items-center justify-between ${buttonClass}`}
            >
              <span>{option}</span>
              {showResult && isCorrect && <CheckCircle2 className="w-6 h-6 text-primary-500" />}
              {showResult && isSelected && !isCorrect && <X className="w-6 h-6 text-red-500" />}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className={`mt-8 p-6 rounded-2xl flex items-center justify-between border-2 transition-colors ${
              feedback === 'correct' 
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-800' 
                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
            }`}
          >
            <div className="flex items-center gap-4">
              {feedback === 'correct' ? (
                <div className="bg-primary-500 text-white p-2 rounded-full"><CheckCircle2 className="w-6 h-6" /></div>
              ) : (
                <div className="bg-red-500 text-white p-2 rounded-full"><AlertCircle className="w-6 h-6" /></div>
              )}
              <div>
                <h3 className="text-2xl font-black mb-1">
                  {feedback === 'correct' ? 'Exactly!' : 'Not quite...'}
                </h3>
                <p className="text-xl font-bold opacity-90 tracking-wide">
                  {feedback === 'correct' ? 'Keep it up!' : `The correct answer was: ${currentWord.translatedText}`}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              {feedback === 'correct' && (
                <>
                  <HoverButton 
                    type="button" 
                    onClick={() => nextQuestion(3)}
                    disabled={submitting}
                    className="font-black py-3 px-6 rounded-xl border-b-4 uppercase tracking-widest active:border-b-0 active:translate-y-1 bg-yellow-400 border-yellow-600 text-white text-sm"
                  >
                    Hard
                  </HoverButton>
                  <HoverButton 
                    type="button" 
                    onClick={() => nextQuestion(5)}
                    disabled={submitting}
                    className="font-black py-3 px-6 rounded-xl border-b-4 uppercase tracking-widest active:border-b-0 active:translate-y-1 bg-primary-500 border-primary-700 text-white flex items-center gap-2 text-sm"
                  >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Easy'}
                  </HoverButton>
                </>
              )}
              {feedback === 'incorrect' && (
                <HoverButton 
                  type="button" 
                  onClick={() => nextQuestion(1)}
                  disabled={submitting}
                  className="font-black py-3 px-8 rounded-xl border-b-4 uppercase tracking-widest active:border-b-0 active:translate-y-1 bg-red-500 border-red-700 text-white flex items-center gap-2"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continue'}
                </HoverButton>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
};

export default Quiz;
