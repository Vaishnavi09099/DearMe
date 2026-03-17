const Task = require('../models/Task');

// @route GET /api/tasks?date=YYYY-MM-DD
const getTasks = async (req, res) => {
  try {
    const { date } = req.query;
    const filter = { user: req.user._id };
    if (date) filter.date = date;
    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route POST /api/tasks
const createTask = async (req, res) => {
  try {
    const { text, tag, priority, date } = req.body;
    if (!text || !date) return res.status(400).json({ message: 'Text and date are required' });

    const task = await Task.create({ user: req.user._id, text, tag, priority, date });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/tasks/:id
const updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const { text, tag, priority, done } = req.body;
    if (text !== undefined) task.text = text;
    if (tag !== undefined) task.tag = tag;
    if (priority !== undefined) task.priority = priority;
    if (done !== undefined) task.done = done;

    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };
