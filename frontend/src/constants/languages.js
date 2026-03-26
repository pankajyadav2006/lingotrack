export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', bcp47: 'en-US' },
  { code: 'es', name: 'Spanish', native: 'Español', bcp47: 'es-ES' },
  { code: 'fr', name: 'French', native: 'Français', bcp47: 'fr-FR' },
  { code: 'de', name: 'German', native: 'Deutsch', bcp47: 'de-DE' },
  { code: 'it', name: 'Italian', native: 'Italiano', bcp47: 'it-IT' },
  { code: 'ja', name: 'Japanese', native: '日本語', bcp47: 'ja-JP' },
  { code: 'ko', name: 'Korean', native: '한국어', bcp47: 'ko-KR' },
  { code: 'zh', name: 'Chinese', native: '中文', bcp47: 'zh-CN' },
  { code: 'pt', name: 'Portuguese', native: 'Português', bcp47: 'pt-PT' },
  { code: 'ru', name: 'Russian', native: 'Русский', bcp47: 'ru-RU' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', bcp47: 'hi-IN' },
];

export const getLanguageName = (code) => {
  const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
  return lang ? lang.name : code;
};

export const getLanguageBCP47 = (code) => {
  const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
  return lang ? lang.bcp47 : code;
};
