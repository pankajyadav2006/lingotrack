const express = require('express');
const { generateQuiz, submitQuiz } = require('../controllers/quizController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/generate').get(protect, generateQuiz);
router.route('/submit').post(protect, submitQuiz);

module.exports = router;
