const { translateText } = require('../services/openaiService');
const User = require('../models/User');

exports.translate = async (req, res) => {
  try {
    const { text, from, to } = req.body;
    console.log('--- Translation Request ---');
    console.log('Text:', text);
    console.log('From:', from);
    console.log('To:', to);
    console.log('User ID:', req.user?.id);
    
    if (!text) {
      return res.status(400).json({ success: false, message: 'Please provide text to translate' });
    }

    const user = await User.findById(req.user.id);
    const baseLang = from || user.baseLanguage;
    const targetLang = to || user.targetLanguage;

    const result = await translateText(text, baseLang, targetLang);

    res.status(200).json({
      success: true,
      data: {
        originalText: text,
        ...result,
        languagePair: { from: baseLang, to: targetLang }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
