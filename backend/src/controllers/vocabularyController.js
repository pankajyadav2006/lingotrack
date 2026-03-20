const Vocabulary = require('../models/Vocabulary');
const Progress = require('../models/Progress');
const ActivityLog = require('../models/ActivityLog');

// @desc    Save translated word
// @route   POST /api/vocabulary
// @access  Private
exports.saveWord = async (req, res) => {
  try {
    req.body.user = req.user.id;

    const vocabulary = await Vocabulary.create(req.body);

    // Track activity for the dashboard graph
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await ActivityLog.findOneAndUpdate(
      { user: req.user.id, date: today },
      { $inc: { count: 1 } },
      { upsert: true, new: true }
    );

    res.status(201).json({
      success: true,
      data: vocabulary
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's vocabulary
// @route   GET /api/vocabulary
// @access  Private
exports.getVocabulary = async (req, res) => {
  try {
    const vocabulary = await Vocabulary.find({ user: req.user.id }).sort('-createdAt');

    res.status(200).json({
      success: true,
      count: vocabulary.length,
      data: vocabulary
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update learning status
// @route   PUT /api/vocabulary/:id
// @access  Private
exports.updateWordStatus = async (req, res) => {
  try {
    let word = await Vocabulary.findById(req.params.id);

    if (!word) {
      return res.status(404).json({ success: false, message: 'Word not found' });
    }

    // Make sure user owns word
    if (word.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this word' });
    }

    const { learningStatus, nextReviewDate } = req.body;
    
    // Check if word transitions to mastered for progress tracking
    if (word.learningStatus !== 'mastered' && learningStatus === 'mastered') {
       await Progress.findOneAndUpdate(
         { user: req.user.id },
         { $inc: { wordsLearned: 1 } }
       );
    }

    word = await Vocabulary.findByIdAndUpdate(req.params.id, {
      learningStatus: learningStatus || word.learningStatus,
      nextReviewDate: nextReviewDate || word.nextReviewDate
    }, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: word
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete word
// @route   DELETE /api/vocabulary/:id
// @access  Private
exports.deleteWord = async (req, res) => {
  try {
    const word = await Vocabulary.findById(req.params.id);

    if (!word) {
      return res.status(404).json({ success: false, message: 'Word not found' });
    }

    if (word.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete' });
    }

    await word.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get weak words (accuracy < 70%)
// @route   GET /api/vocabulary/weak
// @access  Private
exports.getWeakWords = async (req, res) => {
  try {
    const vocabulary = await Vocabulary.find({ user: req.user.id });
    
    // Filter words where accuracy is less than 0.7 and has been tested at least once
    const weakWords = vocabulary.filter(word => {
      const total = word.correctAnswers + word.incorrectAnswers;
      if (total === 0) return false;
      return (word.correctAnswers / total) < 0.7;
    });

    res.status(200).json({
      success: true,
      count: weakWords.length,
      data: weakWords
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
