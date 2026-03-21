const express = require('express');
const { saveWord, getVocabulary, updateWordStatus, deleteWord, getWeakWords } = require('../controllers/vocabularyController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/weak')
  .get(protect, getWeakWords);

router.route('/')
  .post(protect, saveWord)
  .get(protect, getVocabulary);

router.route('/:id')
  .put(protect, updateWordStatus)
  .delete(protect, deleteWord);

module.exports = router;
