const express = require('express');
const { translate } = require('../controllers/translationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, translate);

module.exports = router;
