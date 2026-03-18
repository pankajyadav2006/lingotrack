import { Volume2, BookmarkPlus, ArrowRight, Loader2, AlertCircle, CheckCircle2, Mic, MicOff, Settings, Play, Pause, Square, Headphones } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import AuthContext from '../context/AuthContext';
import SettingsContext from '../context/SettingsContext';
import { PageTransition, HoverButton } from '../components/AnimationUtils';
import { getLanguageName, getLanguageBCP47 } from '../constants/languages';
import useSpeechToText from '../hooks/useSpeechToText';
import useTextToSpeech from '../hooks/useTextToSpeech';
import { useEffect, useState, useContext } from 'react';

const Translator = () => {
  const { user } = useContext(AuthContext);
  const { settings, updateSettings } = useContext(SettingsContext);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [micError, setMicError] = useState('');
  const [saved, setSaved] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const { isListening, transcript, error: speechError, startListening, stopListening } = useSpeechToText({
    lang: getLanguageBCP47(user?.baseLanguage),
    continuous: false,
    interimResults: true
  });

  const { 
    isSpeaking, 
    isPaused, 
    voices, 
    selectedVoice, 
    setSelectedVoice, 
    speak, 
    testSpeak,
    pause, 
    resume, 
    stop,
    supported 
  } = useTextToSpeech();


  // ── Handler definitions (must be before useEffects that call them) ──────────
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
    setMicError('');
    setResult(null);
    setSaved(false);

    try {
      const res = await api.post('/translation', {
        text: textToTranslate,
        from: user.baseLanguage,
        to: user.targetLanguage
      });
      setResult(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Translation failed');
    } finally {
      setLoading(false);
    }
  };

  // ── Effects ──────────────────────────────────────────────────────────────────

  // Show mic errors separately — don't overwrite the translation output
  useEffect(() => {
    if (speechError) {
      setMicError(speechError);
    }
  }, [speechError]);

  // Automatically update the main text state with transcript
  useEffect(() => {
    if (transcript) {
      setText(transcript);
    }
  }, [transcript]);

  // Auto-play translated result
  useEffect(() => {
    if (result && settings.autoPlay) {
      const timeout = setTimeout(() => {
        handlePlayTTS(result.translatedText, user?.targetLanguage);
      }, 500);
      return () => clearTimeout(timeout);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, settings.autoPlay]);

  // Auto-trigger translation once listening stops and there's text
  useEffect(() => {
    if (!isListening && transcript) {
      const timeout = setTimeout(() => {
        handleTranslateInternal(transcript);
      }, 500);
      return () => clearTimeout(timeout);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  return (
    <PageTransition className="max-w-4xl mx-auto p-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-800 dark:text-gray-100 transition-colors">Translate & Learn</h1>
        <p className="text-gray-500 dark:text-gray-400 font-bold mt-2 transition-colors">
          Discover new words and save them to your vocabulary.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Region */}
        <div className="card h-[400px] flex flex-col relative w-full">
          <div className="flex justify-between items-center mb-4 border-b-2 border-gray-100 dark:border-gray-700 pb-4 transition-colors">
            <span className="font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-sm transition-colors">
              {getLanguageName(user?.baseLanguage)}
            </span>
            <div className="flex items-center gap-4">
              <div className="relative">
                <button 
                  onClick={() => { setMicError(''); isListening ? stopListening() : startListening(); }}
                  className={`relative p-2 rounded-full transition-all ${isListening ? 'bg-red-500 text-white' : 'text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20'}`}
                  title={isListening ? 'Stop listening' : 'Translate by voice'}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  {isListening && (
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0.5 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="absolute inset-0 bg-red-400 rounded-full"
                    />
                  )}
                </button>
                {micError && (
                  <div className="absolute top-10 left-1/2 -translate-x-1/2 z-30 bg-red-500 text-white text-xs font-bold py-1 px-3 rounded-xl whitespace-nowrap shadow-lg">
                    Mic: {micError}
                  </div>
                )}
              </div>
              <button 
                onClick={() => handlePlayTTS(text, user?.baseLanguage)}
                disabled={!text.trim() || loading}
                className={`text-gray-400 hover:text-primary-500 transition-colors ${!text.trim() || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                title="Listen to original text"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
          </div>
          <form onSubmit={handleTranslate} className="flex-1 flex flex-col pt-2 relative">
            <AnimatePresence>
              {isListening && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-0 left-0 right-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm z-20 p-4 rounded-xl flex items-center gap-3 transition-colors"
                >
                  <div className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse delay-75" />
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse delay-150" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 font-bold italic animate-pulse">
                    Listening: <span className="text-gray-800 dark:text-gray-100">{transcript || '...'}</span>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            
            <textarea
              className={`flex-1 w-full resize-none outline-none text-2xl text-gray-800 dark:text-gray-100 font-bold placeholder-gray-300 dark:placeholder-gray-600 bg-transparent transition-all ${isListening ? 'blur-[1px]' : ''}`}
              placeholder="Type or click the mic to speak..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isListening}
            />
            <HoverButton 
              type="submit" 
              disabled={loading || !text.trim()}
              className={`btn-primary w-full mt-4 flex justify-center items-center gap-2 ${loading || !text.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <><Loader2 className="w-6 h-6 animate-spin" /> Translating...</>
              ) : (
                <><ArrowRight className="w-6 h-6" /> Translate</>
              )}
            </HoverButton>
          </form>
        </div>

        {/* Output Region */}
        <div className="card h-[400px] flex flex-col bg-primary-50 dark:bg-gray-800/80 border-primary-100 dark:border-gray-700 transition-colors">
          <div className="flex justify-between items-center mb-4 border-b-2 border-primary-200 dark:border-gray-700 pb-4 transition-colors">
            <span className="font-black text-primary-500 dark:text-primary-400 uppercase tracking-widest text-sm transition-colors">
              {getLanguageName(user?.targetLanguage)}
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-full transition-colors ${showSettings ? 'bg-primary-200 text-primary-700' : 'text-primary-400 hover:bg-primary-100'}`}
                title="Audio Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 relative">
            <AnimatePresence>
              {showSettings && (
                <motion.div 
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  className="absolute top-0 left-0 right-0 z-20 bg-white dark:bg-gray-800 border-2 border-primary-100 dark:border-gray-700 rounded-2xl p-4 shadow-xl space-y-4"
                >
                   <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2 block">Voice Selection</label>
                    {voices.length > 0 ? (
                      <select 
                        value={selectedVoice?.name || ''} 
                        onChange={(e) => setSelectedVoice(voices.find(v => v.name === e.target.value))}
                        className="w-full bg-gray-50 dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-700 rounded-lg p-2 text-sm font-bold outline-none focus:border-primary-500 transition-colors"
                      >
                        {voices.map(voice => (
                          <option key={voice.name} value={voice.name}>{voice.name} ({voice.lang})</option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-xs font-bold text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg border border-red-100 dark:border-red-900/30">
                        No voices available on this browser/OS.
                      </div>
                    )}
                    
                    <button 
                      onClick={testSpeak}
                      className="w-full mt-2 py-2 px-4 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-xl font-bold text-sm hover:bg-primary-200 dark:hover:bg-primary-800 transition-all flex items-center justify-center gap-2"
                    >
                      <Headphones className="w-4 h-4" /> Test Audio System
                    </button>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1 block">Speed ({settings.ttsSpeed}x)</label>
                        <input 
                          type="range" min="0.5" max="2" step="0.1" 
                          value={settings.ttsSpeed} 
                          onChange={(e) => updateSettings({ ttsSpeed: parseFloat(e.target.value) })}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-black text-gray-400 uppercase tracking-wider mb-1 block">Pitch ({settings.ttsPitch})</label>
                        <input 
                          type="range" min="0.5" max="2" step="0.1" 
                          value={settings.ttsPitch} 
                          onChange={(e) => updateSettings({ ttsPitch: parseFloat(e.target.value) })}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-secondary-500"
                        />
                      </div>
                   </div>

                   <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-600 dark:text-gray-300">Auto-play after translate</span>
                      <button 
                        onClick={() => updateSettings({ autoPlay: !settings.autoPlay })}
                        className={`w-12 h-6 rounded-full transition-all relative ${settings.autoPlay ? 'bg-primary-500' : 'bg-gray-300'}`}
                      >
                        <motion.div 
                          animate={{ x: settings.autoPlay ? 26 : 2 }}
                          className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-md"
                        />
                      </button>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error ? (
              <div className="flex flex-col items-center justify-center h-full text-red-500 gap-2">
                <AlertCircle className="w-12 h-12" />
                <p className="font-bold">{error}</p>
              </div>
            ) : !result && !loading ? (
              <div className="flex flex-col items-center justify-center h-full text-primary-300 font-bold">
                Translation will appear here
              </div>
            ) : result && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-4">
                <div>
                  <div className="flex items-center gap-4 mb-2">
                    <h2 className="text-4xl font-black text-primary-700 dark:text-primary-400 transition-colors">
                      {result.translatedText}
                    </h2>
                    {isSpeaking && (
                      <div className="flex gap-1 items-end h-6">
                        {[0, 1, 2, 3].map(i => (
                          <motion.div 
                            key={i}
                            animate={{ height: [4, 16, 8, 12, 4] }}
                            transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1 }}
                            className="w-1 bg-primary-500 rounded-full"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!isSpeaking ? (
                      <button 
                        onClick={() => handlePlayTTS(result.translatedText, user?.targetLanguage)}
                        disabled={!supported}
                        className={`text-primary-600 dark:text-primary-400 font-bold text-lg flex items-center gap-2 transition-colors group ${!supported ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:text-primary-800 dark:hover:text-primary-300'}`}
                        title={supported ? "Listen to pronunciation" : "Audio not supported"}
                      >
                        <div className="bg-primary-100 dark:bg-primary-900/40 p-2 rounded-full group-hover:bg-primary-200 dark:group-hover:bg-primary-800 transition-colors">
                          <Volume2 className="w-5 h-5" /> 
                        </div>
                        {result.pronunciation}
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button 
                          onClick={isPaused ? resume : pause}
                          className="bg-primary-500 text-white p-2 rounded-full hover:bg-primary-600 transition-colors"
                        >
                          {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                        </button>
                        <button 
                          onClick={stop}
                          className="bg-gray-500 text-white p-2 rounded-full hover:bg-gray-600 transition-colors"
                        >
                          <Square className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border-2 border-primary-100 dark:border-gray-700 transition-colors">
                  <span className="text-xs font-black text-primary-400 dark:text-primary-500 uppercase tracking-wider mb-1 block transition-colors">Level</span>
                  <p className="font-bold text-gray-700 dark:text-gray-200 transition-colors">{result.difficultyLevel}</p>
                </div>

                {result.explanation && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border-2 border-primary-100 dark:border-gray-700 border-l-4 border-l-secondary-500 dark:border-l-secondary-500 transition-colors">
                    <span className="text-xs font-black text-secondary-500 uppercase tracking-wider mb-1 block">AI Explanation</span>
                    <p className="font-bold text-gray-700 dark:text-gray-200 transition-colors">{result.explanation}</p>
                  </div>
                )}

                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border-2 border-primary-100 dark:border-gray-700 transition-colors">
                  <span className="text-xs font-black text-primary-400 dark:text-primary-500 uppercase tracking-wider mb-1 block transition-colors">Example Context</span>
                  <p className="font-bold text-gray-700 dark:text-gray-300 italic transition-colors">"{result.exampleSentence}"</p>
                </div>
              </div>
            )}
          </div>

          {result && (
            <div className="relative mt-4">
              <AnimatePresence>
                {saved && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: -45, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute inset-x-0 mx-auto w-max bg-green-500 text-white font-bold py-1 px-4 rounded-full shadow-lg flex items-center gap-2 z-10"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Word Saved!
                  </motion.div>
                )}
              </AnimatePresence>
              
              <HoverButton 
                onClick={handleSaveWord}
                disabled={saved}
                className={`w-full font-bold py-3 px-6 rounded-xl border-b-4 transition-all duration-150 flex justify-center items-center gap-2
                  ${saved 
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-800 cursor-not-allowed' 
                    : 'bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 border-primary-200 dark:border-gray-600 hover:bg-primary-50 dark:hover:bg-gray-700 active:border-b-0 active:translate-y-1'
                  }
                `}
              >
                <BookmarkPlus className="w-6 h-6" />
                {saved ? 'Saved to Vocabulary' : 'Save to Vocabulary'}
              </HoverButton>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default Translator;
