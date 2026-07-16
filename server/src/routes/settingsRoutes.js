const express = require('express');
const { getSettings, updateSettings } = require('../controllers/settingsController.js');
const { authenticateAdmin } = require('../middleware/auth.js');

const router = express.Router();

// Public route to get settings
router.get('/', getSettings);

// Admin-only route to update settings
router.put('/', authenticateAdmin, updateSettings);

module.exports = router;
