import { Volume2, BookmarkPlus, ArrowRight, Loader2, AlertCircle, CheckCircle2, Mic, MicOff, Settings, ArrowLeftRight, Languages } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import AuthContext from '../context/AuthContext';
import SettingsContext from '../context/SettingsContext';
import { PageTransition, HoverButton, SuccessPulse, Shake } from '../components/AnimationUtils';
import { SUPPORTED_LANGUAGES, getLanguageName, getLanguageBCP47 } from '../constants/languages';
import useSpeechToText from '../hooks/useSpeechToText';
import useTextToSpeech from '../hooks/useTextToSpeech';
import { useEffect, useState, useContext, useRef } from 'react';

const Translator = () => {
    const { user } = useContext(AuthContext);
    const { settings, updateSettings } = useContext(SettingsContext);
    
    // Internal state for languages allows swapping without mutating global user profile
    const [sourceLang, setSourceLang] = useState(user?.baseLanguage || 'en');
    const [targetLang, setTargetLang] = useState(user?.targetLanguage || 'es');
    
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [micError, setMicError] = useState('');
    const [saved, setSaved] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    const inputRef = useRef(null);

    const { isListening, transcript, error: speechError, startListening, stopListening } = useSpeechToText({
        lang: getLanguageBCP47(sourceLang),
        continuous: false,
        interimResults: true
    });

    const { 
        isSpeaking, voices, selectedVoice, setSelectedVoice, speak, testSpeak
    } = useTextToSpeech();

    const handlePlayTTS = (textToSpeak, lang) => {
        speak(textToSpeak, {
            lang: lang,
            rate: settings.ttsSpeed,
            pitch: settings.ttsPitch,
        });
    };

    const handleTranslateInternal = async (overrideText) => {
        const textToTranslate = overrideText || text;
        if (!textToTranslate.trim()) return;
        
        setLoading(true);
        setError('');
        setResult(null);
        setSaved(false);

        try {
            const res = await api.post('/translation', {
                text: textToTranslate,
                from: sourceLang,
                to: targetLang
            });
            setResult(res.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Translation failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSwapLanguages = () => {
        const temp = sourceLang;
        setSourceLang(targetLang);
        setTargetLang(temp);
        
        // If there's translated result, we can swap the text and result seamlessly
        if (result && result.translatedText) {
            setText(result.translatedText);
            setResult(null); // Clear result so they translate again
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleTranslateInternal();
        }
    };

    useEffect(() => {
        if (speechError) setMicError(speechError);
    }, [speechError]);

    useEffect(() => {
        if (transcript) setText(transcript);
    }, [transcript]);

    useEffect(() => {
        if (result && settings.autoPlay) {
            const timeout = setTimeout(() => {
                handlePlayTTS(result.translatedText, targetLang);
            }, 500);
            return () => clearTimeout(timeout);
        }
    }, [result, settings.autoPlay]);

    useEffect(() => {
        if (!isListening && transcript) {
            handleTranslateInternal(transcript);
        }
    }, [isListening, transcript]);

    const handleTranslate = (e) => {
        if (e) e.preventDefault();
        handleTranslateInternal();
    };

    const handleSaveWord = async () => {
        if (!result || saved) return;
        try {
            await api.post('/vocabulary', {
                originalText: result.originalText,
                translatedText: result.translatedText,
                languagePair: result.languagePair,
                pronunciation: result.pronunciation,
                exampleSentence: result.exampleSentence,
                difficultyLevel: result.difficultyLevel
            });
            setSaved(true);
        } catch (err) {
            alert('Failed to save word');
        }
    };

    // Auto focus on mount
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    return (
        <PageTransition className="px-6 py-12 max-w-6xl mx-auto transition-colors">
            
            {/* ── Top Bar: Language Selectors ────────────────────────────────────── */}
            <div className="flex flex-col md:flex-row items-center justify-between bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-[32px] p-4 shadow-sm mb-6 z-10 relative">
                
                {/* Source Lang dropdown */}
                <div className="flex-1 w-full relative">
                    <select
                        value={sourceLang}
                        onChange={(e) => setSourceLang(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary-500 rounded-2xl py-3 px-4 text-center text-sm font-black text-gray-700 dark:text-gray-200 uppercase tracking-widest outline-none appearance-none cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        {SUPPORTED_LANGUAGES.map(lang => (
                            <option key={lang.code} value={lang.code}>{lang.name}</option>
                        ))}
                    </select>
                </div>

                {/* Swap button */}
                <HoverButton 
                    onClick={handleSwapLanguages}
                    className="mx-4 my-2 md:my-0 p-3 bg-primary-50 dark:bg-primary-950/40 text-primary-500 rounded-full shadow-sm border border-primary-100 dark:border-primary-900"
                    title="Swap Languages"
                >
                    <ArrowLeftRight className="w-5 h-5" />
                </HoverButton>

                {/* Target Lang dropdown */}
                <div className="flex-1 w-full relative">
                    <select
                        value={targetLang}
                        onChange={(e) => setTargetLang(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary-500 rounded-2xl py-3 px-4 text-center text-sm font-black text-gray-700 dark:text-gray-200 uppercase tracking-widest outline-none appearance-none cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        {SUPPORTED_LANGUAGES.map(lang => (
                            <option key={lang.code} value={lang.code}>{lang.name}</option>
                        ))}
                    </select>
                </div>
                
                {/* Settings Toggle */}
                <div className="ml-4 pl-4 border-l-2 border-gray-100 dark:border-gray-800 hidden md:block">
                    <button 
                        onClick={() => setShowSettings(!showSettings)}
                        className={`p-3 rounded-full transition-all bg-white dark:bg-gray-900 shadow-sm border-2 ${showSettings ? 'border-primary-500 text-primary-500' : 'border-gray-100 dark:border-gray-800 text-gray-400 hover:text-primary-500'}`}
                        title="Translation Settings"
                    >
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* ── Settings Dropdown ──────────────────────────────────────────────── */}
            <AnimatePresence>
                {showSettings && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className="w-full md:w-96 ml-auto mb-6 bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-[32px] p-6 shadow-2xl space-y-6"
                    >
                        <div>
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 block">Audio Voice</label>
                            <select 
                                value={selectedVoice?.name || ''} 
                                onChange={(e) => setSelectedVoice(voices.find(v => v.name === e.target.value))}
                                className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary-500 rounded-xl p-3 text-sm font-bold outline-none transition-all appearance-none"
                            >
                                {voices.map(voice => (
                                    <option key={voice.name} value={voice.name}>{voice.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Speed</span>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => updateSettings({ ttsSpeed: Math.max(0.5, settings.ttsSpeed - 0.1) })} className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-gray-600">-</button>
                                    <span className="text-sm font-bold text-primary-500">{settings.ttsSpeed.toFixed(1)}x</span>
                                    <button onClick={() => updateSettings({ ttsSpeed: Math.min(2.0, settings.ttsSpeed + 0.1) })} className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-gray-600">+</button>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between pt-2">
                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest italic">Auto-play</span>
                            <button 
                                onClick={() => updateSettings({ autoPlay: !settings.autoPlay })}
                                className={`w-10 h-5 rounded-full transition-all relative ${settings.autoPlay ? 'bg-primary-500' : 'bg-gray-300'}`}
                            >
                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settings.autoPlay ? 'right-1' : 'left-1'}`} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-stretch">
                {/* ── Input Region ───────────────────────────────────────────────── */}
                <div className="bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-[32px] shadow-sm transition-colors flex flex-col h-full overflow-hidden focus-within:border-primary-500 focus-within:shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    <form onSubmit={handleTranslate} className="flex-1 flex flex-col relative h-full">
                        <textarea
                            ref={inputRef}
                            className="w-full flex-1 min-h-[300px] p-8 bg-transparent resize-none outline-none text-2xl lg:text-3xl text-gray-800 dark:text-gray-100 font-bold placeholder-gray-300 dark:placeholder-gray-700 transition-colors"
                            placeholder="Type to translate (Press Enter to submit)..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isListening}
                        />
                        <div className="p-4 bg-gray-50 dark:bg-gray-950/50 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <button 
                                        type="button"
                                        onClick={() => { setMicError(''); isListening ? stopListening() : startListening(); }}
                                        className={`p-3 rounded-2xl transition-all ${isListening ? 'bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'}`}
                                        title={isListening ? 'Stop listening' : 'Translate by voice'}
                                    >
                                        {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                        {isListening && (
                                            <motion.div 
                                                initial={{ scale: 0.8, opacity: 0.5 }}
                                                animate={{ scale: 1.5, opacity: 0 }}
                                                transition={{ repeat: Infinity, duration: 1 }}
                                                className="absolute inset-0 bg-red-400 rounded-2xl -z-10"
                                            />
                                        )}
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handlePlayTTS(text, sourceLang)}
                                    disabled={!text.trim() || loading}
                                    className="p-3 rounded-2xl bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 transition-all disabled:opacity-50"
                                >
                                    <Volume2 className="w-5 h-5" />
                                </button>
                            </div>

                            <HoverButton 
                                type="submit" 
                                disabled={loading || !text.trim()}
                                className="bg-primary-500 px-8 py-3 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-[0_4px_0_0_#46a302] hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center gap-2 min-w-[200px]"
                            >
                                {loading ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Translating</>
                                ) : (
                                    <>Translate <ArrowRight className="w-4 h-4" /></>
                                )}
                            </HoverButton>
                        </div>
                    </form>
                </div>

                {/* ── Output Region ──────────────────────────────────────────────── */}
                <div className="bg-primary-50/50 dark:bg-primary-950/20 border-2 border-primary-200 dark:border-primary-900 rounded-[32px] shadow-sm flex flex-col h-full min-h-[300px] overflow-hidden">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full text-primary-500 gap-6 my-auto min-h-[300px]">
                            <motion.div
                                key="loader-icon"
                              animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                            >
                              <Languages className="w-16 h-16 opacity-50" />
                            </motion.div>
                            <p className="uppercase tracking-[0.3em] font-black text-sm animate-pulse">Analyzing...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center h-full text-red-500 gap-3 font-black my-auto min-h-[300px]">
                            <Shake active={true}>
                                <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                                <p className="uppercase tracking-widest text-xs text-center">{error}</p>
                            </Shake>
                        </div>
                    ) : !result ? (
                        <div className="flex flex-col items-center justify-center h-full text-primary-300 dark:text-primary-800 font-black gap-4 my-auto min-h-[300px]">
                            <Languages className="w-16 h-16 opacity-30" />
                            <p className="uppercase tracking-[0.3em] text-xs opacity-50">Translation Output</p>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-[30px] p-8 m-1 space-y-6">
                            <motion.div 
                                key="result-content"
                                className="flex-1 space-y-6"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 dark:text-gray-100 px-2 py-4 border-l-4 border-primary-500 bg-primary-50 dark:bg-primary-950/40 rounded-r-2xl leading-tight">
                                    {result.translatedText}
                                </h2>
                                
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => handlePlayTTS(result.translatedText, targetLang)}
                                        className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 px-4 py-2 rounded-xl hover:border-primary-500 hover:text-primary-500 transition-all group"
                                    >
                                        <Volume2 className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
                                        <span className="text-[15px] font-black text-gray-600 dark:text-gray-300 tracking-wide">{result.pronunciation}</span>
                                    </button>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-950/50 rounded-2xl p-5 border-2 border-gray-100 dark:border-gray-800">
                                    <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest mb-2 block">Contextual usage</span>
                                    <p className="font-bold text-gray-700 dark:text-gray-300 italic text-sm">"{result.exampleSentence}"</p>
                                </div>
                            </motion.div>

                            <div className="pt-6 relative">
                                <AnimatePresence>
                                    {saved && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                            animate={{ opacity: 1, y: -45, scale: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute inset-x-0 mx-auto w-max bg-green-500 text-white font-black py-1.5 px-4 rounded-full shadow-lg flex items-center gap-2 z-50 text-xs"
                                        >
                                            <CheckCircle2 className="w-4 h-4" /> Word Saved to Collection
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                <SuccessPulse active={saved}>
                                    <HoverButton 
                                        onClick={handleSaveWord}
                                        disabled={saved}
                                        className={`w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-sm transition-all ${saved ? 'bg-green-500 text-white pointer-events-none' : 'bg-primary-50 dark:bg-primary-950/30 text-primary-600 border-2 border-primary-200 dark:border-primary-900 border-b-4 hover:border-b-2 hover:translate-y-0.5'}`}
                                    >
                                        {saved ? '✓ Collected' : 'Save to Vocabulary'}
                                    </HoverButton>
                                </SuccessPulse>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </PageTransition>
    );
};

export default Translator;
