const Progress = require('../models/Progress');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get user progress dashboard
// @route   GET /api/progress
// @access  Private
exports.getProgress = async (req, res) => {
  try {
    let progress = await Progress.findOne({ user: req.user.id });

    if (!progress) {
      // Create if it doesn't exist for some reason
      progress = await Progress.create({ user: req.user.id });
    }

    // Streak checking logic
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastActive = new Date(progress.lastActiveDate);
    lastActive.setHours(0, 0, 0, 0);
    
    const diffTime = Math.abs(today - lastActive);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 1) {
      // Streak broken
      progress.currentStreak = 0;
    } else if (diffDays === 1) {
      // Streak continued
      progress.currentStreak += 1;
      if (progress.currentStreak > progress.highestStreak) {
        progress.highestStreak = progress.currentStreak;
      }
    }
    
    // Update last active
    progress.lastActiveDate = Date.now();
    await progress.save();

    // Fetch activity for the last 7 days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      last7Days.push(d);
    }

    const activity = await ActivityLog.find({
      user: req.user.id,
      date: { $in: last7Days }
    }).sort('date');

    // Format for the chart (Mon, Tue, etc.)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const chartData = last7Days.map(date => {
      const log = activity.find(a => a.date.getTime() === date.getTime());
      return {
        name: days[date.getDay()],
        words: log ? log.count : 0
      };
    });

    res.status(200).json({
      success: true,
      data: {
        ...progress.toObject(),
        chartData
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update progress (e.g., after a quiz)
// @route   POST /api/progress/quiz
// @access  Private
exports.updateQuizProgress = async (req, res) => {
  try {
    const { correctAnswers, totalQuestions } = req.body;
    
    const progress = await Progress.findOneAndUpdate(
      { user: req.user.id },
      { 
        $inc: { 
          totalCorrectQuizAnswers: correctAnswers || 0,
          totalQuizTaken: 1
        },
        lastActiveDate: Date.now()
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      data: progress
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
