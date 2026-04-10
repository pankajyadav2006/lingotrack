import { useState, useEffect, useContext } from 'react';
import { Volume2, Search, BookOpen, Trash2, Loader2 } from 'lucide-react';
import api from '../services/api';
import { PageTransition, HoverCard } from '../components/AnimationUtils';
import useTextToSpeech from '../hooks/useTextToSpeech';
import SettingsContext from '../context/SettingsContext';
import AuthContext from '../context/AuthContext';
import { motion } from 'framer-motion';

const Vocabulary = () => {
    const [words, setWords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');

    const { user } = useContext(AuthContext);
    const { settings } = useContext(SettingsContext);
    const { isSpeaking, speak } = useTextToSpeech();

    const handleSpeak = (wordText) => {
        speak(wordText, {
            lang: user?.targetLanguage === 'es' ? 'es-ES' : 'en-US',
            rate: settings.ttsSpeed,
            pitch: settings.ttsPitch
        });
    };

    useEffect(() => {
        fetchVocabulary(filter);
    }, [filter]);

    const fetchVocabulary = async (type = 'all') => {
        setLoading(true);
        try {
            const endpoint = type === 'weak' ? '/vocabulary/weak' : '/vocabulary';
            const res = await api.get(endpoint);
            setWords(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to remove this?")) return;
        try {
            await api.delete(`/vocabulary/${id}`);
            setWords(words.filter(w => w._id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const filteredWords = words.filter(word => 
        word.originalText.toLowerCase().includes(searchTerm.toLowerCase()) || 
        word.translatedText.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status) => {
        if (status === 'mastered') return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
        if (status === 'learning') return 'bg-primary-100 text-primary-700 border-primary-200 dark:bg-primary-900/30 dark:text-primary-400 dark:border-primary-800';
        return 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
    };

    return (
        <PageTransition className="px-6 py-12 max-w-7xl mx-auto transition-colors">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-gray-800 dark:text-gray-100 tracking-tight transition-colors">Your Library</h1>
                    <p className="text-lg text-gray-500 font-bold transition-colors">
                        You have collected <span className="text-primary-600 dark:text-primary-400">{words.length}</span> unique items.
                    </p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                    <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl w-full sm:w-auto transition-colors">
                        <button
                            onClick={() => setFilter('all')}
                            className={`flex-1 sm:flex-none px-6 py-2.5 font-black text-xs uppercase tracking-widest rounded-xl transition-all ${filter === 'all' ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
                        >
                            Collection
                        </button>
                        <button
                            onClick={() => setFilter('weak')}
                            className={`flex-1 sm:flex-none px-6 py-2.5 font-black text-xs uppercase tracking-widest rounded-xl transition-all ${filter === 'weak' ? 'bg-white dark:bg-red-900/10 text-red-600 dark:text-red-400 shadow-sm border-2 border-red-100 dark:border-red-900/20' : 'text-gray-400 dark:text-gray-500 hover:text-red-500'}`}
                        >
                            Needs Review
                        </button>
                    </div>
                    <div className="relative w-full sm:w-72 group">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-300 group-focus-within:text-primary-500 transition-colors w-5 h-5" />
                        <input 
                            type="text" 
                            placeholder="Search library..." 
                            className="w-full bg-white dark:bg-gray-950 border-2 border-gray-100 dark:border-gray-800 rounded-2xl py-3 pl-12 pr-4 text-sm font-black text-gray-800 dark:text-gray-100 outline-none focus:border-primary-500 transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-[32px] p-8 h-72 flex flex-col">
                            <div className="w-24 h-6 skeleton rounded-full mb-6"></div>
                            <div className="w-2/3 h-8 skeleton mb-4"></div>
                            <div className="w-1/2 h-8 skeleton mb-8"></div>
                            <div className="w-full flex-1 skeleton rounded-2xl"></div>
                        </div>
                    ))}
                </div>
            ) : filteredWords.length === 0 ? (
                <div className="text-center py-24 bg-gray-50/50 dark:bg-gray-950/50 rounded-[40px] border-2 border-dashed border-gray-100 dark:border-gray-800 transition-colors">
                    <BookOpen className="w-16 h-16 text-gray-200 dark:text-gray-800 mx-auto mb-6" />
                    <h2 className="text-2xl font-black text-gray-400 dark:text-gray-600 tracking-tight">Library is empty</h2>
                    <p className="text-gray-400 dark:text-gray-600 font-bold mt-2 max-w-sm mx-auto transition-colors">Words you translate will appear here for practice and mastery.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {filteredWords.map((word) => (
                        <HoverCard key={word._id} className="h-full">
                            <motion.div 
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 rounded-[32px] p-8 relative group hover:shadow-xl hover:border-primary-100 dark:hover:border-primary-900/40 transition-all flex flex-col h-full"
                            >
                                <button 
                                    onClick={() => handleDelete(word._id)}
                                    className="absolute top-6 right-6 p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all dark:text-gray-700 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-full"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                                
                                <div className="flex justify-between items-start mb-6">
                                <div className={`px-4 py-1 rounded-full border-2 text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${getStatusColor(word.learningStatus)}`}>
                                    {word.learningStatus}
                                </div>
                            </div>

                            <div className="flex-1 space-y-4">
                                <div>
                                    <h3 className="text-3xl font-black text-gray-800 dark:text-gray-100 mb-2 leading-tight transition-colors">
                                        {word.translatedText}
                                    </h3>
                                    
                                    <button 
                                        onClick={() => handleSpeak(word.translatedText)}
                                        className="flex items-center gap-2 group/speak transition-all"
                                    >
                                        <div className="bg-primary-50 dark:bg-primary-950/40 p-2 rounded-full border border-primary-100 dark:border-primary-900 transition-colors group-hover/speak:bg-primary-500 group-hover/speak:text-white">
                                            <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-pulse' : ''}`} />
                                        </div>
                                        <span className="text-sm font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest">{word.pronunciation}</span>
                                    </button>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-950/50 rounded-2xl p-5 transition-colors">
                                    <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-2 transition-colors inline-block border-b-2 border-primary-500">Meaning</span>
                                    <p className="text-xl font-black text-gray-700 dark:text-gray-200 transition-colors">{word.originalText}</p>
                                </div>

                                {word.exampleSentence && (
                                    <div className="pt-2">
                                        <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-1 transition-colors">Usage Context</span>
                                        <p className="font-bold text-gray-500 dark:text-gray-400 text-sm italic transition-colors leading-relaxed">"{word.exampleSentence}"</p>
                                    </div>
                                )}
                            </div>
                            </motion.div>
                        </HoverCard>
                    ))}
                </div>
            )}
        </PageTransition>
    );
};

export default Vocabulary;
