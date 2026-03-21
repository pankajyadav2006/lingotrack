const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  count: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Compound index for efficient lookup and uniqueness
activityLogSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
