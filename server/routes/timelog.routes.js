const express = require('express');
const router = express.Router();
const TimeLog = require('../models/TimeLog');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

// GET /api/timelog?date=YYYY-MM-DD
router.get('/', async (req, res) => {
  try {
    const { date } = req.query;
    const log = await TimeLog.findOne({ user: req.user._id, date });
    res.json(log || { productiveHours: 0, wastedHours: 0 });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/timelog  — upsert
router.post('/', async (req, res) => {
  try {
    const { date, productiveHours, wastedHours } = req.body;
    const log = await TimeLog.findOneAndUpdate(
      { user: req.user._id, date },
      { productiveHours, wastedHours },
      { new: true, upsert: true }
    );
    res.json(log);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
