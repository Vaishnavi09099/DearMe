const DiaryEntry = require('../models/DiaryEntry');

// @route GET /api/diary?date=YYYY-MM-DD
const getEntry = async (req, res) => {
  try {
    const { date } = req.query;
    const filter = { user: req.user._id };
    if (date) filter.date = date;
    const entries = await DiaryEntry.find(filter).sort({ date: -1 });
    res.json(date ? entries[0] || null : entries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route POST /api/diary  (upsert — creates or updates for the day)
const saveEntry = async (req, res) => {
  try {
    const { date, content, mood } = req.body;
    if (!date) return res.status(400).json({ message: 'Date is required' });

    const entry = await DiaryEntry.findOneAndUpdate(
      { user: req.user._id, date },
      { content, mood },
      { new: true, upsert: true, runValidators: true }
    );
    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route DELETE /api/diary/:id
const deleteEntry = async (req, res) => {
  try {
    await DiaryEntry.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: 'Entry deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getEntry, saveEntry, deleteEntry };
