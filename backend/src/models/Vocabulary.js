const mongoose = require('mongoose');

const vocabularySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  originalText: {
    type: String,
    required: [true, 'Please add the original text'],
    trim: true
  },
  translatedText: {
    type: String,
    required: [true, 'Please add the translated text']
  },
  languagePair: {
    from: { type: String, required: true },
    to: { type: String, required: true }
  },
  pronunciation: {
    type: String
  },
  exampleSentence: {
    type: String
  },
  difficultyLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced']
  },
  learningStatus: {
    type: String,
    enum: ['new', 'learning', 'mastered'],
    default: 'new'
  },
  nextReviewDate: {
    type: Date,
    default: Date.now
  },
  
  // Spaced Repetition (SM-2) Fields
  interval: {
    type: Number,
    default: 0 // in days
  },
  easeFactor: {
    type: Number,
    default: 2.5 // default SM-2 ease factor
  },
  repetitions: {
    type: Number,
    default: 0
  },
  
  // Quiz/Tracking Stats
  correctAnswers: {
    type: Number,
    default: 0
  },
  incorrectAnswers: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Create a compound index for efficient querying
vocabularySchema.index({ user: 1, learningStatus: 1 });

module.exports = mongoose.model('Vocabulary', vocabularySchema);
