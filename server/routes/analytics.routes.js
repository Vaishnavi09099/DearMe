const express = require('express');
const router = express.Router();
const { getWeeklyAnalytics, getStreak } = require('../controllers/analytics.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/weekly', getWeeklyAnalytics);
router.get('/streak', getStreak);

module.exports = router;
