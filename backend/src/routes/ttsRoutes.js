const express = require('express');
const axios = require('axios');
const router = express.Router();

// @desc    Proxy Google TTS audio to bypass CORS/Referrer issues
// @route   GET /api/tts
router.get('/', async (req, res) => {
  try {
    const { text, lang, rate = 1 } = req.query;
    if (!text) return res.status(400).send('Text is required');

    const url = `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang || 'en'}&client=tw-ob&ttsspeed=${rate}`;

    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Referer': 'https://translate.google.com/'
    };

    const response = await axios({
      method: 'get',
      url,
      responseType: 'stream',
      headers
    });

    res.setHeader('Content-Type', 'audio/mpeg');
    response.data.pipe(res);
  } catch (error) {
    console.error('TTS Proxy error:', error.message);
    res.status(500).send('Failed to proxy TTS');
  }
});

module.exports = router;
