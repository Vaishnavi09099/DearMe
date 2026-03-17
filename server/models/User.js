const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:           { type: String, required: [true, 'Name is required'], trim: true },
  email:          { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true },
  password:       { type: String, required: [true, 'Password is required'], minlength: 6, select: false },
  branch:         { type: String, default: '' },
  semester:       { type: Number, default: 1 },
  pin:            { type: String, select: false },  // optional 4-digit PIN (hashed)
  streak:         { type: Number, default: 0 },
  lastActiveDate: { type: String, default: '' },
  avatar:         { type: String, default: '' },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Hash PIN before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('pin') || !this.pin) return next();
  const salt = await bcrypt.genSalt(10);
  this.pin = await bcrypt.hash(this.pin, salt);
  next();
});

// Method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to compare PIN
userSchema.methods.matchPin = async function (enteredPin) {
  return await bcrypt.compare(enteredPin, this.pin);
};

module.exports = mongoose.model('User', userSchema);
