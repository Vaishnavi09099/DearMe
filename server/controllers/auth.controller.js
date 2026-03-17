const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
};

// @route  POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, branch, semester } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email and password' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password, branch, semester });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      branch: user.branch,
      semester: user.semester,
      streak: user.streak,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      branch: user.branch,
      semester: user.semester,
      streak: user.streak,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route  GET /api/auth/me
const getMe = async (req, res) => {
  res.json(req.user);
};

// @route  PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const { name, branch, semester, pin } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (branch) user.branch = branch;
    if (semester) user.semester = semester;
    if (pin) user.pin = pin;

    await user.save();
    res.json({ message: 'Profile updated', user: { name: user.name, branch: user.branch, semester: user.semester } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, getMe, updateProfile };
