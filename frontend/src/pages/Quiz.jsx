import { Target, Trophy, X, ArrowRight, Loader2, CheckCircle2, AlertCircle, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { PageTransition, HoverButton, Shake } from '../components/AnimationUtils';
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
    const [feedback, setFeedback] = useState(null); 
    const [results, setResults] = useState([]); 
    const [submitting, setSubmitting] = useState(false);

    const { user } = useContext(AuthContext);
    const { settings } = useContext(SettingsContext);
    const { speak, isSpeaking } = useTextToSpeech();

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
        const isCorrect = option.trim().toLowerCase() === currentWord.translatedText.toLowerCase();
        if (isCorrect) {
            setScore(score + 1);
            setFeedback('correct');
        } else {
            setFeedback('incorrect');
        }
    };

    const nextQuestion = async (qualityOverride) => {
        const quality = feedback === 'correct' ? (qualityOverride || 5) : 1;
        const isCorrect = feedback === 'correct';
        const newResults = [...results, { wordId: currentWord._id, correct: isCorrect, quality }];
        setResults(newResults);

        if (currentIdx + 1 < words.length) {
            setCurrentIdx(currentIdx + 1);
            setUserAnswer('');
            setFeedback(null);
        } else {
            setSubmitting(true);
            try {
                await api.post('/quiz/submit', { results: newResults });
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
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
            <p className="font-black text-gray-400 uppercase tracking-widest text-sm">Generating Practice Session...</p>
        </div>
    );

    if (words.length === 0) {
        return (
            <PageTransition className="max-w-2xl mx-auto py-32 text-center px-6">
                <div className="w-24 h-24 bg-gray-50 dark:bg-gray-900 rounded-[32px] flex items-center justify-center mx-auto mb-8 border-2 border-gray-100 dark:border-gray-800">
                    <Target className="w-12 h-12 text-gray-300" />
                </div>
                <h2 className="text-3xl font-black text-gray-800 dark:text-gray-100 mb-2 transition-colors">You're All Caught Up!</h2>
                <p className="text-lg text-gray-400 font-bold mb-10 transition-colors">Your vocabulary is fresh in your mind. Go learn some new words to review later!</p>
                <Link to="/translator" className="btn-primary inline-flex items-center gap-2 px-10 py-4 shadow-[0_4px_0_0_#46a302]">
                    Explore Translator
                </Link>
            </PageTransition>
        );
    }

    if (finished) {
        return (
            <PageTransition className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
                <motion.div 
                    initial={{ scale: 0, rotate: -20 }} 
                    animate={{ scale: 1, rotate: 0 }} 
                    className="mb-12"
                >
                    <Trophy className="w-40 h-40 text-accent-yellow drop-shadow-2xl" />
                </motion.div>
                <h1 className="text-5xl font-black text-gray-800 dark:text-gray-100 mb-4 transition-colors tracking-tight">Practice Complete!</h1>
                <p className="text-2xl text-gray-400 font-bold mb-12 transition-colors">
                    You earned <span className="text-primary-500">{score * 10} XP</span> and mastered {score} words.
                </p>
                <Link to="/dashboard" className="btn-primary px-12 py-4 uppercase tracking-[0.2em] text-sm shadow-[0_4px_0_0_#46a302]">
                    Continue Training
                </Link>
            </PageTransition>
        );
    }

    return (
        <PageTransition className="max-w-4xl mx-auto px-6 py-12">
            {/* Header / Progress */}
            <div className="flex items-center gap-6 mb-16">
                <Link to="/dashboard" className="text-gray-300 hover:text-red-500 transition-all">
                    <X className="w-10 h-10" />
                </Link>
                <div className="flex-1 h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden border-2 border-transparent">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentIdx) / words.length) * 100}%` }}
                        className="h-full bg-primary-500 rounded-full"
                        transition={{ duration: 0.6, type: 'spring' }}
                    />
                </div>
            </div>

            <div className="space-y-12">
                <div className="space-y-4">
                    <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">Question {currentIdx + 1} of {words.length}</h2>
                    <h3 className="text-4xl font-black text-gray-800 dark:text-gray-100 tracking-tight transition-colors">What does this word mean?</h3>
                </div>

                <div className="flex items-center gap-8 bg-gray-50 dark:bg-gray-950/50 rounded-[40px] p-10 border-2 border-gray-100 dark:border-gray-800 group relative">
                    <div className="w-20 h-20 bg-white dark:bg-gray-900 rounded-3xl flex items-center justify-center shadow-lg border-2 border-transparent group-hover:border-primary-500 transition-all">
                        <Volume2 className={`w-8 h-8 text-primary-500 ${isSpeaking ? 'animate-pulse' : ''}`} />
                    </div>
                    <p className="text-5xl font-black text-primary-600 dark:text-primary-400 tracking-tight italic transition-colors">
                        "{currentWord.originalText}"
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-24">
                    {(currentWord.options || []).map((option, idx) => {
                        const isSelected = userAnswer === option;
                        const isCorrect = option === currentWord.translatedText;
                        const showResult = !!feedback;
                        
                        let btnStyle = "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-200 shadow-[0_4px_0_0_#e5e7eb] dark:shadow-[0_4px_0_0_#1f2937]";
                        
                        if (showResult) {
                            if (isCorrect) {
                                btnStyle = "bg-primary-50 dark:bg-primary-950/40 border-primary-500 text-primary-700 dark:text-primary-300 shadow-[0_4px_0_0_#46a302] scale-[1.02]";
                            } else if (isSelected) {
                                btnStyle = "bg-red-50 dark:bg-red-950/40 border-red-500 text-red-700 dark:text-red-300 shadow-[0_4px_0_0_#c53030] opacity-60";
                            } else {
                                btnStyle = "opacity-30 grayscale";
                            }
                        }

                        return (
                            <motion.button
                                key={`${currentIdx}-${idx}`}
                                whileHover={!showResult ? { y: -2 } : {}}
                                whileTap={!showResult ? { y: 2 } : {}}
                                onClick={() => handleOptionSelect(option)}
                                disabled={showResult || submitting}
                                className={`w-full text-left p-6 rounded-[28px] border-2 font-black text-xl transition-all flex items-center justify-between ${btnStyle}`}
                            >
                                <span>{option}</span>
                                {showResult && isCorrect && <CheckCircle2 className="w-6 h-6 text-primary-500" />}
                                {showResult && isSelected && !isCorrect && <X className="w-6 h-6 text-red-500" />}
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Sticky Feedback Bar */}
            <AnimatePresence>
                {feedback && (
                    <motion.div 
                        initial={{ y: 200 }}
                        animate={{ y: 0 }}
                        exit={{ y: 200 }}
                        className={`fixed bottom-0 left-0 right-0 p-8 z-[60] border-t-2 ${
                            feedback === 'correct' 
                                ? 'bg-primary-50 dark:bg-gray-900 border-primary-200 dark:border-primary-900' 
                                : 'bg-red-50 dark:bg-gray-900 border-red-200 dark:border-red-950'
                        }`}
                    >
                        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <div className={`p-4 rounded-[20px] shadow-lg ${feedback === 'correct' ? 'bg-primary-500 text-white' : 'bg-red-500 text-white'}`}>
                                    {feedback === 'correct' ? <CheckCircle2 className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
                                </div>
                                <div>
                                    <Shake active={feedback === 'incorrect'}>
                                        <h3 className={`text-2xl font-black ${feedback === 'correct' ? 'text-primary-700 dark:text-primary-400' : 'text-red-700 dark:text-red-400'}`}>
                                            {feedback === 'correct' ? 'Nicely done!' : 'The correct answer:'}
                                        </h3>
                                        <p className={`font-bold text-lg opacity-80 ${feedback === 'correct' ? 'text-primary-600' : 'text-red-600'}`}>
                                            {feedback === 'correct' ? 'Keep the momentum going!' : currentWord.translatedText}
                                        </p>
                                    </Shake>
                                </div>
                            </div>
                            
                            <div className="flex gap-4 w-full md:w-auto">
                                {feedback === 'correct' ? (
                                    <>
                                        <HoverButton 
                                            onClick={() => nextQuestion(3)}
                                            className="flex-1 md:flex-none py-4 px-8 rounded-2xl bg-white dark:bg-gray-800 text-gray-600 font-black uppercase tracking-widest text-xs border-2 border-gray-100 dark:border-gray-800 hover:bg-gray-50 active:translate-y-1 transition-all"
                                        >
                                            Hard
                                        </HoverButton>
                                        <HoverButton 
                                            onClick={() => nextQuestion(5)}
                                            className="flex-1 md:flex-none py-4 px-8 rounded-2xl bg-primary-500 text-white font-black uppercase tracking-widest text-xs shadow-[0_4px_0_0_#46a302] hover:translate-y-1 hover:shadow-none transition-all"
                                        >
                                            Got it!
                                        </HoverButton>
                                    </>
                                ) : (
                                    <HoverButton 
                                        onClick={() => nextQuestion(1)}
                                        className="w-full md:w-auto py-4 px-12 rounded-2xl bg-red-500 text-white font-black uppercase tracking-widest text-xs shadow-[0_4px_0_0_#c53030] hover:translate-y-1 hover:shadow-none transition-all"
                                    >
                                        Continue
                                    </HoverButton>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </PageTransition>
    );
};

export default Quiz;
