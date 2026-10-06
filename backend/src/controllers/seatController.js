// backend/src/controllers/seatController.js
const { getPool, sql } = require('../config/database');

/**
 * GET /api/trips/:id/seats
 * Returns all seats for the bus used by this trip,
 * with each seat's booking status for this specific trip.
 */
async function getSeatsByTrip(req, res) {
    try {
        const pool = await getPool();
        const tripId = parseInt(req.params.id, 10);

        // 1) Verify trip exists and get bus_id
        const tripResult = await pool
            .request()
            .input('trip_id', sql.Int, tripId)
            .query(`
                SELECT t.id, t.bus_id, t.travel_date,
                       b.total_seats, b.bus_type
                FROM dbo.trips t
                JOIN dbo.buses b ON b.id = t.bus_id
                WHERE t.id = @trip_id
            `);

        if (tripResult.recordset.length === 0) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        const trip = tripResult.recordset[0];

        // 2) Get all seats for this bus with booking status
        const seatsResult = await pool
            .request()
            .input('bus_id', sql.Int, trip.bus_id)
            .input('trip_id', sql.Int, tripId)
            .query(`
                SELECT s.id, s.seat_number, s.seat_row, s.seat_column,
                       CASE WHEN bk.id IS NOT NULL THEN 'booked' ELSE 'available' END AS status
                FROM dbo.seats s
                LEFT JOIN dbo.booking_seats bs ON bs.seat_id = s.id AND bs.trip_id = @trip_id
                LEFT JOIN dbo.bookings bk ON bk.id = bs.booking_id AND bk.status = 'CONFIRMED'
                WHERE s.bus_id = @bus_id
                ORDER BY s.seat_row, s.seat_column
            `);

        return res.json({
            trip_id: tripId,
            bus_type: trip.bus_type,
            total_seats: trip.total_seats,
            seats: seatsResult.recordset,
        });
    } catch (err) {
        console.error('Get seats error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
}

module.exports = { getSeatsByTrip };
