import { Link, Navigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ArrowRight, Languages, Moon, Sun, ChevronDown } from 'lucide-react';
import AuthContext from '../context/AuthContext';
import ThemeContext from '../context/ThemeContext';
import { HoverButton } from '../components/AnimationUtils';

const TRANSLATIONS = {
    en: {
        titlePart1: "Master any language.",
        titlePart2: "Without the friction.",
        subtitle: "The free, fun, and highly effective way to expand your vocabulary and practice real-world translations.",
        cta: "Get Started",
        siteLang: "Language",
        langName: "English"
    },
    es: {
        titlePart1: "Domina cualquier idioma.",
        titlePart2: "Sin la fricción.",
        subtitle: "La manera gratuita, divertida y altamente efectiva de ampliar tu vocabulario y practicar traducciones reales.",
        cta: "Empezar",
        siteLang: "Idioma",
        langName: "Español"
    },
    fr: {
        titlePart1: "Maîtrisez n'importe quelle langue.",
        titlePart2: "Sans friction.",
        subtitle: "La façon gratuite, ludique et très efficace d'enrichir votre vocabulaire et de pratiquer des traductions concrètes.",
        cta: "Commencer",
        siteLang: "Langue",
        langName: "Français"
    },
    de: {
        titlePart1: "Meistern Sie jede Sprache.",
        titlePart2: "Ohne Reibung.",
        subtitle: "Der kostenlose und hocheffektive Weg, Ihren Wortschatz zu erweitern und reale Übersetzungen zu üben.",
        cta: "Loslegen",
        siteLang: "Sprache",
        langName: "Deutsch"
    },
    it: {
        titlePart1: "Padroneggia qualsiasi lingua.",
        titlePart2: "Senza attrito.",
        subtitle: "Il modo gratuito, divertente e altamente efficace per espandere il tuo vocabolario e praticare traduzioni.",
        cta: "Inizia",
        siteLang: "Lingua",
        langName: "Italiano"
    },
    ja: {
        titlePart1: "どんな言語もマスターしよう。",
        titlePart2: "摩擦なしで。",
        subtitle: "語彙を増やし、実践的な翻訳を練習するための無料で楽しく非常に効果的な方法。",
        cta: "はじめる",
        siteLang: "言語",
        langName: "日本語"
    },
    hi: {
        titlePart1: "किसी भी भाषा में महारत हासिल करें।",
        titlePart2: "बिना किसी बाधा के।",
        subtitle: "अपनी शब्दावली का विस्तार करने और वास्तविक दुनिया के अनुवादों का अभ्यास करने का मुफ़्त और प्रभावी तरीका।",
        cta: "आरंभ करें",
        siteLang: "भाषा",
        langName: "हिन्दी"
    },
    ko: {
        titlePart1: "어떤 언어든 마스터하세요.",
        titlePart2: "제한 없이.",
        subtitle: "어휘력을 확장하고 실제 번역을 연습하는 무료이고 재미있으며 매우 효과적인 방법입니다.",
        cta: "시작하기",
        siteLang: "언어",
        langName: "한국어"
    }
};

const LANGUAGES_LIST = [
    { code: 'en', flag: '🇺🇸' },
    { code: 'es', flag: '🇪🇸' },
    { code: 'fr', flag: '🇫🇷' },
    { code: 'de', flag: '🇩🇪' },
    { code: 'it', flag: '🇮🇹' },
    { code: 'ja', flag: '🇯🇵' },
    { code: 'hi', flag: '🇮🇳' },
    { code: 'ko', flag: '🇰🇷' },
];

const Home = () => {
    const { user } = useContext(AuthContext);
    const { theme, toggleTheme } = useContext(ThemeContext);
    
    const [currentLang, setCurrentLang] = useState('en');
    const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

    if (user) {
        return <Navigate to="/dashboard" />;
    }

    const t = TRANSLATIONS[currentLang];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col font-sans overflow-x-hidden relative transition-colors duration-300">
            
            {/* Background Ambient Mesh */}
            <div className={`absolute top-[-20%] left-[-10%] w-[120%] h-[120%] ${theme === 'dark' ? 'bg-gradient-to-br from-primary-900/20 via-gray-950 to-secondary-900/10' : 'bg-gradient-to-br from-primary-400/20 via-transparent to-secondary-400/20'} blur-3xl pointer-events-none -z-10 transition-colors duration-500`} />

            {/* Header */}
            <header className="h-24 flex items-center justify-between px-6 md:px-12 max-w-7xl mx-auto w-full z-50">
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 flex-shrink-0 bg-primary-500 rounded-2xl flex items-center justify-center shadow-[0_4px_0_0_#46a302] group-hover:translate-y-0.5 group-hover:shadow-[0_2px_0_0_#46a302] transition-all">
                        <Languages className="text-white w-5 h-5" />
                    </div>
                    <span className="text-2xl font-black text-gray-800 dark:text-gray-100 tracking-tight transition-colors">
                        lingo<span className="text-primary-500">track</span>
                    </span>
                </Link>
                
                <div className="flex items-center gap-4">
                    {/* Theme Toggle */}
                    <button 
                        onClick={toggleTheme}
                        className="p-3 bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-2xl text-gray-400 hover:text-primary-500 hover:border-primary-200 dark:hover:border-primary-900 transition-all shadow-sm flex-shrink-0"
                    >
                        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>

                    {/* Language Dropdown */}
                    <div className="relative">
                        <button 
                            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                            className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-2xl text-gray-500 dark:text-gray-400 font-bold uppercase text-xs tracking-widest cursor-pointer hover:border-primary-200 dark:hover:border-primary-900 transition-colors shadow-sm"
                        >
                            <Globe className="w-4 h-4" />
                            <span className="hidden sm:block">{t.siteLang}: {t.langName}</span>
                            <ChevronDown className={`w-3 h-3 transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {isLangMenuOpen && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden z-50 flex flex-col"
                                >
                                    {LANGUAGES_LIST.map((lang) => (
                                        <button
                                            key={lang.code}
                                            onClick={() => {
                                                setCurrentLang(lang.code);
                                                setIsLangMenuOpen(false);
                                            }}
                                            className={`flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${currentLang === lang.code ? 'bg-primary-50/50 dark:bg-primary-900/20 text-primary-500 font-black' : 'text-gray-600 dark:text-gray-300 font-bold'}`}
                                        >
                                            <span className="text-xl">{lang.flag}</span>
                                            <span className="text-xs uppercase tracking-widest">{TRANSLATIONS[lang.code].langName}</span>
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </header>

            {/* Main Hero */}
            <main className="flex-1 flex flex-col items-center justify-center gap-12 px-6 py-12 md:px-24 max-w-5xl mx-auto w-full z-10">
                <div className="w-full flex flex-col items-center text-center gap-8">
                    
                    <motion.div
                        key={currentLang} // animate slightly when language changes
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="space-y-6"
                    >
                        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-gray-800 dark:text-gray-100 leading-[1.1] tracking-tight text-balance transition-colors duration-300">
                            {t.titlePart1}<br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-secondary-500">
                                {t.titlePart2}
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 font-bold max-w-2xl mx-auto text-balance transition-colors duration-300">
                            {t.subtitle}
                        </p>
                    </motion.div>
                    
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex flex-col sm:flex-row gap-4 w-full max-w-sm mx-auto pt-4"
                    >
                        <Link to="/login?mode=register" className="flex-1">
                            <HoverButton className="w-full bg-primary-500 text-white font-black py-4 px-8 uppercase tracking-[0.2em] text-sm rounded-2xl shadow-[0_4px_0_0_#46a302] hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-2">
                                {t.cta} <ArrowRight className="w-5 h-5" />
                            </HoverButton>
                        </Link>
                    </motion.div>
                </div>
            </main>

            {/* Scrolling Footer Marquee */}
            <footer className="py-8 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-t-2 border-gray-100 dark:border-gray-800 flex items-center relative overflow-hidden group shadow-[0_-10px_40px_rgba(0,0,0,0.02)] transition-colors duration-300">
                <motion.div 
                    className="flex items-center gap-12 whitespace-nowrap"
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
                >
                    {[...LANGUAGES_LIST, ...LANGUAGES_LIST].map((lang, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                            <span className="text-3xl grayscale-[0.2] opacity-80">{lang.flag}</span>
                            <span className="text-sm font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest">{TRANSLATIONS[lang.code].langName}</span>
                        </div>
                    ))}
                </motion.div>
            </footer>

            {/* Close dropdown when clicking outside hack */}
            {isLangMenuOpen && (
                <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsLangMenuOpen(false)} 
                />
            )}

        </div>
    );
};

export default Home;
