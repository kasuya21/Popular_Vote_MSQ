const express = require('express');
const { login, logout, getMe } = require('../controllers/adminAuthController');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

router.post('/login', login);
router.post('/logout', logout);
router.get('/me', authenticateAdmin, getMe);

module.exports = router;
