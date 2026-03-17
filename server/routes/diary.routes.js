const express = require('express');
const router = express.Router();
const { getEntry, saveEntry, deleteEntry } = require('../controllers/diary.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.route('/').get(getEntry).post(saveEntry);
router.route('/:id').delete(deleteEntry);

module.exports = router;
