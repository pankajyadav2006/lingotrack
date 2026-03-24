const Vocabulary = require('../models/Vocabulary');
const User = require('../models/User');
const { calculateNextReview } = require('../utils/srs');

// @desc    Generate a quiz from vocab ready for review
// @route   GET /api/quiz/generate
// @access  Private
exports.generateQuiz = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    
    // Find words due for review (or new words)
    let dueWords = await Vocabulary.find({
      user: req.user.id,
      nextReviewDate: { $lte: new Date() }
    }).limit(limit).lean();

    // If not enough words due, fetch some random ones
    if (dueWords.length < limit) {
      const extraNeeded = limit - dueWords.length;
      const extraWords = await Vocabulary.aggregate([
        { $match: { 
            user: req.user._id, 
            _id: { $nin: dueWords.map(w => w._id) } 
        }},
        { $sample: { size: extraNeeded } }
      ]);
      dueWords = [...dueWords, ...extraWords];
    }

    // For each word, generate options (1 correct + 3 distractors)
    const quizWithChoices = await Promise.all(dueWords.map(async (word) => {
      // Fetch 3 random other words from user's vocabulary as distractors
      let distractors = await Vocabulary.aggregate([
        { $match: { 
            user: req.user._id, 
            _id: { $ne: word._id },
            translatedText: { $ne: word.translatedText } 
        }},
        { $sample: { size: 3 } }
      ]);

      let choices = distractors.map(d => d.translatedText);
      
      // Fallback if not enough vocab for distractors
      const fallbackPool = ['Hola', 'Adiós', 'Gracias', 'Por favor', 'Sí', 'No', 'Bueno', 'Malo', 'Feliz', 'Triste'];
      while (choices.length < 3) {
        const randomFallback = fallbackPool[Math.floor(Math.random() * fallbackPool.length)];
        if (!choices.includes(randomFallback) && randomFallback !== word.translatedText) {
          choices.push(randomFallback);
        }
      }

      choices.push(word.translatedText);
      
      // Shuffle choices
      choices = choices.sort(() => Math.random() - 0.5);

      return {
        ...word,
        options: choices
      };
    }));

    res.status(200).json({ success: true, count: quizWithChoices.length, data: quizWithChoices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit quiz results and update SRS fields
// @route   POST /api/quiz/submit
// @access  Private
// @body    { results: [{ wordId: String, correct: Boolean, quality: Number (0-5) }] }
exports.submitQuiz = async (req, res) => {
  try {
    const { results } = req.body;
    let scoreEarned = 0;

    for (let result of results) {
      const word = await Vocabulary.findOne({ _id: result.wordId, user: req.user.id });
      if (!word) continue;

      // Default quality if not provided: 5 for correct, 1 for incorrect
      const quality = result.quality !== undefined ? result.quality : (result.correct ? 5 : 1);
      
      const srsUpdate = calculateNextReview(
        quality, 
        word.repetitions, 
        word.easeFactor, 
        word.interval
      );

      word.interval = srsUpdate.interval;
      word.easeFactor = srsUpdate.easeFactor;
      word.repetitions = srsUpdate.repetitions;
      word.nextReviewDate = srsUpdate.nextReviewDate;

      if (result.correct) {
        word.correctAnswers += 1;
        scoreEarned += 10;
      } else {
        word.incorrectAnswers += 1;
      }

      await word.save();
    }

    // Update user streak & score
    const user = await User.findById(req.user.id);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastActive = new Date(user.lastActiveDate);
    lastActive.setHours(0, 0, 0, 0);

    const diffDays = Math.round((today - lastActive) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      user.currentStreak += 1;
    } else if (diffDays > 1) {
      user.currentStreak = 1;
    } else if (diffDays === 0 && user.currentStreak === 0) {
      user.currentStreak = 1; // First activity of today
    }
    
    if (user.currentStreak > user.longestStreak) {
      user.longestStreak = user.currentStreak;
    }

    user.totalScore += scoreEarned;
    user.lastActiveDate = new Date();
    await user.save();

    res.status(200).json({ success: true, message: 'Quiz submitted', scoreEarned });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
