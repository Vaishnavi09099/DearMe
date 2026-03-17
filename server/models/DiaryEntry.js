const mongoose = require('mongoose');

const diarySchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date:    { type: String, required: true },   // "YYYY-MM-DD"
  content: { type: String, default: '' },
  mood:    { type: Number, min: 0, max: 4, default: null }, // 0=exhausted 1=sad 2=neutral 3=good 4=excellent
}, { timestamps: true });

// Each user can have only one diary entry per day
diarySchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DiaryEntry', diarySchema);
