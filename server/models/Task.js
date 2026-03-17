const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text:        { type: String, required: [true, 'Task text is required'], trim: true },
  tag:         { type: String, enum: ['study', 'project', 'personal', 'exam', 'other'], default: 'study' },
  priority:    { type: String, enum: ['high', 'med', 'low'], default: 'med' },
  done:        { type: Boolean, default: false },
  date:        { type: String, required: true },  // "YYYY-MM-DD"
  completedAt: { type: Date, default: null },
}, { timestamps: true });

// Auto-set completedAt when task is marked done
taskSchema.pre('save', function (next) {
  if (this.isModified('done')) {
    this.completedAt = this.done ? new Date() : null;
  }
  next();
});

module.exports = mongoose.model('Task', taskSchema);
