const { OpenAI } = require('openai');

const fs = require('fs');
const path = require('path');

const openai = new OpenAI({
  apiKey: process.env.GROK_API_KEY || process.env.OPENAI_API_KEY,
  baseURL: "https://api.x.ai/v1",
});

const logDebug = (msg) => {
  const logPath = path.join(__dirname, '../../debug.log');
  fs.appendFileSync(logPath, `${new Date().toISOString()} - ${msg}\n`);
  console.log(msg);
};

const axios = require('axios');

exports.translateText = async (text, sourceLang, targetLang) => {
  // Try real AI First (if not forced mock)
  if (process.env.USE_MOCK_AI !== 'true') {
    try {
      logDebug(`Attempting AI Translation: ${text} (${sourceLang}->${targetLang})`);
      const response = await openai.chat.completions.create({
        model: 'grok-2-1212',
        messages: [
          { role: 'system', content: `You are an expert language tutor. Translate text from ${sourceLang} to ${targetLang}. Return your response in JSON format.` },
          { role: 'user', content: `Please translate this text into ${targetLang}: "${text}". Provide the response as a JSON object with keys: translatedText, explanation, pronunciation, exampleSentence, and difficultyLevel.` }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      });
      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
       logDebug(`AI API Failed (likely credits): ${error.message}`);
    }
  }

  // Fallback to Free MyMemory API
  try {
    logDebug(`Using MyMemory API for: ${text}`);
    const res = await axios.get('https://api.mymemory.translated.net/get', {
      params: {
        q: text,
        langpair: `${sourceLang}|${targetLang}`
      }
    });

    const translatedText = res.data.responseData.translatedText;
    
    return {
      translatedText,
      explanation: `Translated using MyMemory free API. (AI API is out of credits)`,
      pronunciation: `/${translatedText.replace(/\s+/g, '.')}/`, // Best effort
      exampleSentence: `Example: "${translatedText}"`,
      difficultyLevel: "Beginner"
    };
  } catch (error) {
    logDebug(`MyMemory API Failed: ${error.message}`);
    return getMockResponse(text, targetLang);
  }
};

const COMMON_WORDS = {
  'hello': { es: 'hola', fr: 'bonjour', it: 'ciao', de: 'hallo' },
  'bye': { es: 'adiós', fr: 'au revoir', it: 'arrivederci', de: 'tschuß' },
  'ok': { es: 'vale', fr: 'd\'accord', it: 'va bene', de: 'okay' },
  'thank you': { es: 'gracias', fr: 'merci', it: 'grazie', de: 'danke' },
  'please': { es: 'por favor', fr: 's\'il vous plaît', it: 'per favore', de: 'bitte' },
  'good morning': { es: 'buenos días', fr: 'bonjour', it: 'buongiorno', de: 'guten morgen' },
  'good night': { es: 'buenas noches', fr: 'bonne nuit', it: 'buonanotte', de: 'gute nacht' },
  'yes': { es: 'sí', fr: 'oui', it: 'sì', de: 'ja' },
  'no': { es: 'no', fr: 'non', it: 'no', de: 'nein' },
};

const getMockResponse = (text, targetLang) => {
  const lowerText = text.toLowerCase().trim();
  const langKey = targetLang.toLowerCase();
  
  let translatedText = text; // Just return word if dictionary fails
  let explanation = `Showing original text (All translation services failed or limited credits)`;
  
  if (COMMON_WORDS[lowerText] && COMMON_WORDS[lowerText][langKey]) {
    translatedText = COMMON_WORDS[lowerText][langKey];
    explanation = `Simulated accurate translation for common word "${lowerText}".`;
  }

  return {
    translatedText,
    explanation,
    pronunciation: `/${translatedText.replace(/\s+/g, '.')}/`,
    exampleSentence: `Context: "${translatedText}"`,
    difficultyLevel: "Beginner"
  };
};
