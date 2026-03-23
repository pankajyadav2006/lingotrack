import { useState, useEffect, useContext } from 'react';
import { Volume2, Search, BookOpen, Trash2 } from 'lucide-react';
import api from '../services/api';
import { PageTransition, HoverCard, HoverButton } from '../components/AnimationUtils';
import useTextToSpeech from '../hooks/useTextToSpeech';
import SettingsContext from '../context/SettingsContext';
import AuthContext from '../context/AuthContext';

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
    <PageTransition className="max-w-5xl mx-auto p-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-800 dark:text-gray-100 transition-colors">Your Vocabulary</h1>
          <p className="text-gray-500 dark:text-gray-400 font-bold mt-1 transition-colors">
            You've collected {words.length} words.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl transition-colors">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 px-4 py-2 font-bold text-sm rounded-lg transition-all ${filter === 'all' ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
            >
              All Words
            </button>
            <button
              onClick={() => setFilter('weak')}
              className={`flex-1 px-4 py-2 font-bold text-sm rounded-lg transition-all ${filter === 'weak' ? 'bg-white dark:bg-red-900/30 text-red-600 dark:text-red-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-red-500'}`}
            >
              Needs Review
            </button>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search words..." 
              className="input-field pl-10 h-12"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 font-bold text-gray-500 dark:text-gray-400 text-xl">Loading library...</div>
      ) : filteredWords.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 transition-colors">
          <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-black text-gray-500 dark:text-gray-400">No words found</h2>
          <p className="text-gray-400 dark:text-gray-500 font-bold mt-2">Go to the Translator to save new words!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWords.map((word) => (
            <HoverCard key={word._id} className="card relative group">
              <button 
                onClick={() => handleDelete(word._id)}
                className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all dark:text-gray-600"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              
              <div className="flex justify-between items-start mb-4">
                <div className={`inline-block px-3 py-1 rounded-lg border-2 text-xs font-black uppercase tracking-wider transition-colors ${getStatusColor(word.learningStatus)}`}>
                  {word.learningStatus}
                </div>
                {filter === 'weak' && (
                  <span className="text-xs font-black text-red-500 dark:text-red-400 uppercase tracking-wider bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-lg border-red-200 dark:border-red-800 border-2 transition-colors">
                    Weak
                  </span>
                )}
              </div>

              <h3 className="text-2xl font-black text-gray-800 dark:text-gray-100 mb-1 leading-tight transition-colors">
                {word.translatedText}
              </h3>
              
              <button 
                onClick={() => handleSpeak(word.translatedText)}
                className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold mb-4 transition-colors hover:text-primary-800 dark:hover:text-primary-300 group/speak"
              >
                <div className="bg-primary-100 dark:bg-primary-900/40 p-1.5 rounded-full group-hover/speak:bg-primary-200 dark:group-hover/speak:bg-primary-800 transition-colors">
                  <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-pulse' : ''}`} />
                </div>
                <span className="text-sm">{word.pronunciation}</span>
              </button>

              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3 mb-4 transition-colors">
                <span className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-1 transition-colors">Meaning</span>
                <p className="font-bold text-gray-700 dark:text-gray-200 transition-colors">{word.originalText}</p>
              </div>

              {word.exampleSentence && (
                <div>
                  <span className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-1 transition-colors">Example</span>
                  <p className="font-bold text-gray-600 dark:text-gray-400 text-sm line-clamp-3 italic transition-colors">"{word.exampleSentence}"</p>
                </div>
              )}
            </HoverCard>
          ))}
        </div>
      )}
    </PageTransition>
  );
};

export default Vocabulary;
