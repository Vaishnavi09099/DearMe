const mongoose = require('mongoose');

const timeLogSchema = new mongoose.Schema({
  user:            { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date:            { type: String, required: true }, // "YYYY-MM-DD"
  productiveHours: { type: Number, default: 0, min: 0, max: 24 },
  wastedHours:     { type: Number, default: 0, min: 0, max: 24 },
}, { timestamps: true });

timeLogSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('TimeLog', timeLogSchema);
