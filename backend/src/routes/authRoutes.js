// backend/src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { register, registerValidation, login, loginValidation, getProfile } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', registerValidation, register);

// POST /api/auth/login
router.post('/login', loginValidation, login);

// GET /api/auth/profile (protected)
router.get('/profile', authenticateToken, getProfile);

module.exports = router;
