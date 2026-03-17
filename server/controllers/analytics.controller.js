const Task = require('../models/Task');
const DiaryEntry = require('../models/DiaryEntry');
const TimeLog = require('../models/TimeLog');

// @route GET /api/analytics/weekly
const getWeeklyAnalytics = async (req, res) => {
  try {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }

    const result = await Promise.all(days.map(async (date) => {
      const tasks = await Task.find({ user: req.user._id, date });
      const done = tasks.filter(t => t.done).length;
      const total = tasks.length;
      const timeLog = await TimeLog.findOne({ user: req.user._id, date });
      const mood = await DiaryEntry.findOne({ user: req.user._id, date });
      return {
        date,
        done,
        total,
        pending: total - done,
        completionRate: total > 0 ? Math.round((done / total) * 100) : 0,
        productiveHours: timeLog?.productiveHours || 0,
        wastedHours: timeLog?.wastedHours || 0,
        mood: mood?.mood ?? null,
      };
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/analytics/streak
const getStreak = async (req, res) => {
  try {
    const user = req.user;
    res.json({ streak: user.streak, lastActiveDate: user.lastActiveDate });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getWeeklyAnalytics, getStreak };
