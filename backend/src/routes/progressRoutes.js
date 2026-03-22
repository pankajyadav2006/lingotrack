const express = require('express');
const { getProgress, updateQuizProgress } = require('../controllers/progressController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getProgress);
router.post('/quiz', protect, updateQuizProgress);

module.exports = router;
