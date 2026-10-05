// backend/src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { getDashboard, getAllUsers } = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// All admin routes require authentication + admin role
router.use(authenticateToken, requireAdmin);

// GET /api/admin/dashboard
router.get('/dashboard', getDashboard);

// GET /api/admin/users
router.get('/users', getAllUsers);

module.exports = router;
