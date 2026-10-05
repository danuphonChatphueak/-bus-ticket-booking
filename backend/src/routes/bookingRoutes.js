// backend/src/routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const {
    createBooking,
    bookingValidation,
    getMyBookings,
    getBookingById,
    getAllBookings,
    cancelBooking,
    updateBookingStatus,
} = require('../controllers/bookingController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// All booking routes require authentication
router.use(authenticateToken);

// GET /api/bookings — admin gets all, passenger gets own
router.get('/', (req, res) => {
    if (req.user.role === 'admin') {
        return getAllBookings(req, res);
    }
    return getMyBookings(req, res);
});

// GET /api/bookings/:id — get single booking
router.get('/:id', getBookingById);

// POST /api/bookings — create booking (passenger)
router.post('/', bookingValidation, createBooking);

// PUT /api/bookings/:id/status — update status (admin only)
router.put('/:id/status', requireAdmin, updateBookingStatus);

// DELETE /api/bookings/:id — cancel booking
router.delete('/:id', cancelBooking);

module.exports = router;
