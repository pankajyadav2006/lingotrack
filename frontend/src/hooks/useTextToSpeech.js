import { useState, useCallback, useRef, useEffect } from 'react';

// Short code → BCP-47 (for Web Speech API) and Google Translate lang code
const LANG_MAP = {
  en: 'en', es: 'es', fr: 'fr', de: 'de',
  it: 'it', pt: 'pt', ja: 'ja', zh: 'zh-CN',
  ru: 'ru', ar: 'ar', hi: 'hi', ko: 'ko',
};

const toLangCode = (lang) => {
  if (!lang) return 'en';
  const base = lang.split(/[-_]/)[0].toLowerCase();
  return LANG_MAP[base] || base;
};

// ─── Primary: Google Translate TTS via Backend Proxy ─────────────────────────
// This bypasses CORS and browser bot-detection issues
const buildGoogleTTSUrl = (text, lang, rate = 1) => {
  const langCode = toLangCode(lang);
  // Using the backend proxy on :5050
  return `http://127.0.0.1:5050/api/tts?text=${encodeURIComponent(text)}&lang=${langCode}&rate=${rate}`;
};

// ─── Fallback: Web Speech API ─────────────────────────────────────────────────
const WEB_LANG_MAP = {
  en: 'en-US', es: 'es-ES', fr: 'fr-FR', de: 'de-DE',
  it: 'it-IT', pt: 'pt-PT', ja: 'ja-JP', zh: 'zh-CN',
  ru: 'ru-RU', ar: 'ar-SA', hi: 'hi-IN', ko: 'ko-KR',
};

const toWebLang = (lang) => {
  if (!lang) return 'en-US';
  if (lang.includes('-') || lang.includes('_')) return lang.replace('_', '-');
  const base = lang.split(/[-_]/)[0].toLowerCase();
  return WEB_LANG_MAP[base] || lang;
};

const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking]     = useState(false);
  const [isPaused, setIsPaused]         = useState(false);
  const [voices, setVoices]             = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const audioRef = useRef(null); // for Google TTS audio element

  // Load Web Speech voices (used for the settings voice picker UI)
  useEffect(() => {
    if (!window.speechSynthesis) return;
    const load = () => {
      const v = window.speechSynthesis.getVoices();
      if (!v.length) return;
      setVoices(v);
      setSelectedVoice(prev => prev ?? (v.find(x => x.default) || v[0]));
    };
    load();
    window.speechSynthesis.addEventListener('voiceschanged', load);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', load);
  }, []);

  // ── Google Translate TTS (primary) ──────────────────────────────────────────
  const speakViaGoogleTTS = useCallback((text, options = {}) => {
    // Stop any current audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }

    const url = buildGoogleTTSUrl(text, options.lang, options.rate);
    const audio = new Audio(url);
    audioRef.current = audio;

    audio.volume = options.volume ?? 1;

    audio.onplay  = () => { setIsSpeaking(true);  setIsPaused(false); };
    audio.onended = () => { setIsSpeaking(false); setIsPaused(false); audioRef.current = null; };
    audio.onerror = (e) => {
      console.warn('Google TTS failed, falling back to Web Speech API:', e);
      setIsSpeaking(false);
      speakViaWebSpeech(text, options); // fallback
    };

    audio.play().catch((e) => {
      console.warn('Audio.play() rejected, falling back to Web Speech API:', e);
      speakViaWebSpeech(text, options);
    });
  }, []); // eslint-disable-line

  // ── Web Speech API (fallback) ────────────────────────────────────────────────
  const speakViaWebSpeech = useCallback((text, options = {}) => {
    const synth = window.speechSynthesis;
    if (!synth) { console.error('TTS: No speech synthesis available.'); return; }

    synth.cancel();
    const allVoices = synth.getVoices();
    const targetLocale = toWebLang(options.lang);
    const targetPrefix = targetLocale.split('-')[0].toLowerCase();

    let voice =
      allVoices.find(v => v.lang.toLowerCase().replace('_','-') === targetLocale.toLowerCase()) ??
      allVoices.find(v => v.lang.toLowerCase().startsWith(targetPrefix)) ??
      selectedVoice ?? null;

    const utterance = new SpeechSynthesisUtterance(text);
    if (voice)        utterance.voice  = voice;
    utterance.lang   = targetLocale;
    utterance.rate   = options.rate   ?? 1;
    utterance.pitch  = options.pitch  ?? 1;
    utterance.volume = options.volume ?? 1;

    utterance.onstart = ()  => { setIsSpeaking(true);  setIsPaused(false); };
    utterance.onend   = ()  => { setIsSpeaking(false); setIsPaused(false); };
    utterance.onerror = (e) => {
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        console.error('Web Speech TTS error:', e.error);
      }
      setIsSpeaking(false); setIsPaused(false);
    };

    console.log(`TTS (WebSpeech) ▶ lang: ${utterance.lang} | voice: ${voice?.name ?? 'default'}`);
    synth.speak(utterance);
  }, [selectedVoice]);

  // ── Public speak() — tries Google TTS first ───────────────────────────────
  const speak = useCallback((text, options = {}) => {
    if (!text?.trim()) return;
    console.log(`TTS ▶ "${text.slice(0, 40)}" | lang: ${options.lang}`);
    speakViaGoogleTTS(text, options);
  }, [speakViaGoogleTTS]);

  const testSpeak = useCallback(() => {
    speak('Audio test. One, two, three.', { lang: 'en' });
  }, [speak]);

  const pause = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setIsPaused(true);
    } else if (window.speechSynthesis?.speaking) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current?.paused) {
      audioRef.current.play();
      setIsPaused(false);
    } else if (window.speechSynthesis?.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);

  return {
    isSpeaking, isPaused,
    voices, selectedVoice, setSelectedVoice,
    speak, testSpeak,
    pause, resume, stop,
    supported: true, // Audio element works everywhere
  };
};

export default useTextToSpeech;
