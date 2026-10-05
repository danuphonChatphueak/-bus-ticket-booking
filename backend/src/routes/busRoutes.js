// backend/src/routes/busRoutes.js
const express = require('express');
const router = express.Router();
const { getAllBuses, getBusById, createBus, updateBus, deleteBus, busValidation } = require('../controllers/busController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// GET /api/buses — public
router.get('/', getAllBuses);

// GET /api/buses/:id — public
router.get('/:id', getBusById);

// POST /api/buses — admin only
router.post('/', authenticateToken, requireAdmin, busValidation, createBus);

// PUT /api/buses/:id — admin only
router.put('/:id', authenticateToken, requireAdmin, busValidation, updateBus);

// DELETE /api/buses/:id — admin only
router.delete('/:id', authenticateToken, requireAdmin, deleteBus);

module.exports = router;
