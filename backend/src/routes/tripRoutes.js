// backend/src/routes/tripRoutes.js
const express = require('express');
const router = express.Router();
const { getAllTrips, getTripById, createTrip, updateTrip, deleteTrip, tripValidation } = require('../controllers/tripController');
const { getSeatsByTrip } = require('../controllers/seatController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// GET /api/trips — public (supports ?origin=&destination=&travel_date= filters)
router.get('/', getAllTrips);

// GET /api/trips/:id — public
router.get('/:id', getTripById);

// GET /api/trips/:id/seats — public (seat map with booking status)
router.get('/:id/seats', getSeatsByTrip);

// POST /api/trips — admin only
router.post('/', authenticateToken, requireAdmin, tripValidation, createTrip);

// PUT /api/trips/:id — admin only
router.put('/:id', authenticateToken, requireAdmin, tripValidation, updateTrip);

// DELETE /api/trips/:id — admin only
router.delete('/:id', authenticateToken, requireAdmin, deleteTrip);

module.exports = router;
