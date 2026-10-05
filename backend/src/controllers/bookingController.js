// backend/src/controllers/bookingController.js
const { getPool, sql } = require('../config/database');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { v4: uuidv4 } = require('uuid');

// ─── Validation ───────────────────────────────────────────────────────────────

const bookingValidation = [
    body('trip_id').isInt({ min: 1 }).withMessage('Valid trip_id required'),
    body('seat_ids').isArray({ min: 1 }).withMessage('At least one seat must be selected'),
    body('seat_ids.*').isInt({ min: 1 }).withMessage('Each seat_id must be a positive integer'),
    validate,
];

// ─── Generate booking code ───────────────────────────────────────────────────

function generateBookingCode() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const rand = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    return `BK${y}${m}${d}${rand}`;
}

// ─── POST create booking (with SQL transaction to prevent double-booking) ────

async function createBooking(req, res) {
    const { trip_id, seat_ids } = req.body;
    const userId = req.user.id;

    try {
        const pool = await getPool();
        const transaction = pool.transaction();
        await transaction.begin();

        try {
            // 1) Verify trip exists and is active
            const tripResult = await transaction
                .request()
                .input('trip_id', sql.Int, trip_id)
                .query(`
                    SELECT t.id, t.price, t.travel_date, t.available_seats, t.status,
                           t.bus_id
                    FROM dbo.trips t
                    WHERE t.id = @trip_id
                `);

            if (tripResult.recordset.length === 0) {
                await transaction.rollback();
                return res.status(404).json({ message: 'Trip not found' });
            }

            const trip = tripResult.recordset[0];

            if (trip.status !== 'active') {
                await transaction.rollback();
                return res.status(400).json({ message: 'This trip is no longer active' });
            }

            if (trip.available_seats < seat_ids.length) {
                await transaction.rollback();
                return res.status(400).json({ message: 'Not enough available seats' });
            }

            // 2) Verify all requested seats belong to this bus
            const seatPlaceholders = seat_ids.map((_, i) => `@seat_${i}`).join(',');
            const seatCheckRequest = transaction.request();
            seatCheckRequest.input('bus_id', sql.Int, trip.bus_id);
            seat_ids.forEach((seatId, i) => {
                seatCheckRequest.input(`seat_${i}`, sql.Int, seatId);
            });

            const seatCheck = await seatCheckRequest.query(`
                SELECT id FROM dbo.seats
                WHERE bus_id = @bus_id AND id IN (${seatPlaceholders})
            `);

            if (seatCheck.recordset.length !== seat_ids.length) {
                await transaction.rollback();
                return res.status(400).json({ message: 'One or more seats are invalid for this bus' });
            }

            // 3) Check for double-booking using UNIQUE constraint + explicit check
            const conflictRequest = transaction.request();
            conflictRequest.input('trip_id_check', sql.Int, trip_id);
            seat_ids.forEach((seatId, i) => {
                conflictRequest.input(`cs_${i}`, sql.Int, seatId);
            });

            const conflictPlaceholders = seat_ids.map((_, i) => `@cs_${i}`).join(',');
            const conflictCheck = await conflictRequest.query(`
                SELECT bs.seat_id
                FROM dbo.booking_seats bs
                JOIN dbo.bookings bk ON bk.id = bs.booking_id
                WHERE bs.trip_id = @trip_id_check
                  AND bs.seat_id IN (${conflictPlaceholders})
                  AND bk.status = 'CONFIRMED'
            `);

            if (conflictCheck.recordset.length > 0) {
                await transaction.rollback();
                const taken = conflictCheck.recordset.map(r => r.seat_id);
                return res.status(409).json({
                    message: 'One or more seats are already booked',
                    booked_seats: taken,
                });
            }

            // 4) Create the booking
            const bookingCode = generateBookingCode();
            const totalPrice = trip.price * seat_ids.length;

            const bookingResult = await transaction
                .request()
                .input('booking_code', sql.NVarChar, bookingCode)
                .input('user_id', sql.Int, userId)
                .input('trip_id', sql.Int, trip_id)
                .input('travel_date', sql.Date, trip.travel_date)
                .input('total_price', sql.Decimal(10, 2), totalPrice)
                .query(`
                    INSERT INTO dbo.bookings (booking_code, user_id, trip_id, travel_date, total_price, status)
                    OUTPUT INSERTED.*
                    VALUES (@booking_code, @user_id, @trip_id, @travel_date, @total_price, 'CONFIRMED')
                `);

            const booking = bookingResult.recordset[0];

            // 5) Insert booking_seats
            for (const seatId of seat_ids) {
                await transaction
                    .request()
                    .input('booking_id', sql.Int, booking.id)
                    .input('seat_id', sql.Int, seatId)
                    .input('trip_id', sql.Int, trip_id)
                    .query(`
                        INSERT INTO dbo.booking_seats (booking_id, seat_id, trip_id)
                        VALUES (@booking_id, @seat_id, @trip_id)
                    `);
            }

            // 6) Decrease available_seats on the trip
            await transaction
                .request()
                .input('trip_id', sql.Int, trip_id)
                .input('count', sql.Int, seat_ids.length)
                .query(`
                    UPDATE dbo.trips
                    SET available_seats = available_seats - @count,
                        updated_at = GETDATE()
                    WHERE id = @trip_id
                `);

            await transaction.commit();

            return res.status(201).json({
                message: 'Booking created successfully',
                booking: {
                    ...booking,
                    seat_ids,
                    total_price: totalPrice,
                },
            });
        } catch (innerErr) {
            await transaction.rollback();
            throw innerErr;
        }
    } catch (err) {
        // UNIQUE constraint violation = double-book race condition
        if (err.number === 2627 || err.number === 2601) {
            return res.status(409).json({ message: 'Seat already booked (concurrent booking detected)' });
        }
        console.error('Create booking error:', err);
        return res.status(500).json({ message: 'Server error during booking' });
    }
}

// ─── GET bookings for logged-in user (My Bookings) ────────────────────────────

async function getMyBookings(req, res) {
    try {
        const pool = await getPool();
        const result = await pool
            .request()
            .input('user_id', sql.Int, req.user.id)
            .query(`
                SELECT bk.id, bk.booking_code, bk.travel_date, bk.total_price,
                       bk.status, bk.created_at,
                       t.departure_time, t.arrival_time, t.price AS unit_price,
                       b.bus_number, b.bus_type, b.company_name,
                       r.origin, r.destination,
                       (
                           SELECT STRING_AGG(s.seat_number, ', ')
                           FROM dbo.booking_seats bs2
                           JOIN dbo.seats s ON s.id = bs2.seat_id
                           WHERE bs2.booking_id = bk.id
                       ) AS seat_numbers
                FROM dbo.bookings bk
                JOIN dbo.trips t ON t.id = bk.trip_id
                JOIN dbo.buses b ON b.id = t.bus_id
                JOIN dbo.routes r ON r.id = t.route_id
                WHERE bk.user_id = @user_id
                ORDER BY bk.created_at DESC
            `);

        return res.json(result.recordset);
    } catch (err) {
        console.error('Get my bookings error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
}

// ─── GET single booking ──────────────────────────────────────────────────────

async function getBookingById(req, res) {
    try {
        const pool = await getPool();
        const request = pool.request();
        request.input('id', sql.Int, req.params.id);

        // Admin can view any booking; passenger only their own
        let whereClause = 'WHERE bk.id = @id';
        if (req.user.role !== 'admin') {
            whereClause += ' AND bk.user_id = @user_id';
            request.input('user_id', sql.Int, req.user.id);
        }

        const result = await request.query(`
            SELECT bk.id, bk.booking_code, bk.user_id, bk.trip_id,
                   bk.travel_date, bk.total_price, bk.status, bk.created_at,
                   t.departure_time, t.arrival_time, t.price AS unit_price,
                   b.bus_number, b.bus_type, b.company_name,
                   r.origin, r.destination,
                   u.name AS passenger_name, u.email AS passenger_email,
                   (
                       SELECT STRING_AGG(s.seat_number, ', ')
                       FROM dbo.booking_seats bs2
                       JOIN dbo.seats s ON s.id = bs2.seat_id
                       WHERE bs2.booking_id = bk.id
                   ) AS seat_numbers
            FROM dbo.bookings bk
            JOIN dbo.trips t ON t.id = bk.trip_id
            JOIN dbo.buses b ON b.id = t.bus_id
            JOIN dbo.routes r ON r.id = t.route_id
            JOIN dbo.users u ON u.id = bk.user_id
            ${whereClause}
        `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        return res.json(result.recordset[0]);
    } catch (err) {
        console.error('Get booking error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
}

// ─── GET all bookings (admin) ─────────────────────────────────────────────────

async function getAllBookings(req, res) {
    try {
        const pool = await getPool();
        const result = await pool.request().query(`
            SELECT bk.id, bk.booking_code, bk.user_id, bk.trip_id,
                   bk.travel_date, bk.total_price, bk.status, bk.created_at,
                   t.departure_time, t.arrival_time,
                   b.bus_number, b.bus_type, b.company_name,
                   r.origin, r.destination,
                   u.name AS passenger_name, u.email AS passenger_email,
                   (
                       SELECT STRING_AGG(s.seat_number, ', ')
                       FROM dbo.booking_seats bs2
                       JOIN dbo.seats s ON s.id = bs2.seat_id
                       WHERE bs2.booking_id = bk.id
                   ) AS seat_numbers
            FROM dbo.bookings bk
            JOIN dbo.trips t ON t.id = bk.trip_id
            JOIN dbo.buses b ON b.id = t.bus_id
            JOIN dbo.routes r ON r.id = t.route_id
            JOIN dbo.users u ON u.id = bk.user_id
            ORDER BY bk.created_at DESC
        `);

        return res.json(result.recordset);
    } catch (err) {
        console.error('Get all bookings error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
}

// ─── DELETE (cancel) booking ──────────────────────────────────────────────────

async function cancelBooking(req, res) {
    try {
        const pool = await getPool();
        const transaction = pool.transaction();
        await transaction.begin();

        try {
            const request = transaction.request();
            request.input('id', sql.Int, req.params.id);

            let whereClause = 'WHERE id = @id AND status = \'CONFIRMED\'';
            if (req.user.role !== 'admin') {
                whereClause += ' AND user_id = @user_id';
                request.input('user_id', sql.Int, req.user.id);
            }

            // 1) Update booking status to CANCELLED
            const result = await request.query(`
                UPDATE dbo.bookings
                SET status = 'CANCELLED', updated_at = GETDATE()
                OUTPUT INSERTED.id, INSERTED.trip_id
                ${whereClause}
            `);

            if (result.recordset.length === 0) {
                await transaction.rollback();
                return res.status(404).json({ message: 'Booking not found or already cancelled' });
            }

            const booking = result.recordset[0];

            // 2) Count how many seats were in this booking
            const seatCountResult = await transaction
                .request()
                .input('booking_id', sql.Int, booking.id)
                .query('SELECT COUNT(*) AS cnt FROM dbo.booking_seats WHERE booking_id = @booking_id');

            const seatCount = seatCountResult.recordset[0].cnt;

            // 3) Restore available_seats on the trip
            await transaction
                .request()
                .input('trip_id', sql.Int, booking.trip_id)
                .input('count', sql.Int, seatCount)
                .query(`
                    UPDATE dbo.trips
                    SET available_seats = available_seats + @count,
                        updated_at = GETDATE()
                    WHERE id = @trip_id
                `);

            await transaction.commit();
            return res.json({ message: 'Booking cancelled successfully' });
        } catch (innerErr) {
            await transaction.rollback();
            throw innerErr;
        }
    } catch (err) {
        console.error('Cancel booking error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
}

// ─── PUT update booking status (admin) ────────────────────────────────────────

async function updateBookingStatus(req, res) {
    const { status } = req.body;
    if (!['CONFIRMED', 'CANCELLED'].includes(status)) {
        return res.status(400).json({ message: 'Status must be CONFIRMED or CANCELLED' });
    }

    try {
        const pool = await getPool();

        // Get current booking status first
        const currentResult = await pool
            .request()
            .input('id', sql.Int, req.params.id)
            .query('SELECT id, trip_id, status FROM dbo.bookings WHERE id = @id');

        if (currentResult.recordset.length === 0) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        const current = currentResult.recordset[0];

        // If status is not changing, do nothing
        if (current.status === status) {
            return res.json({ message: `Booking is already ${status}` });
        }

        const transaction = pool.transaction();
        await transaction.begin();

        try {
            // Update status
            await transaction
                .request()
                .input('id', sql.Int, req.params.id)
                .input('status', sql.NVarChar, status)
                .query(`
                    UPDATE dbo.bookings
                    SET status = @status, updated_at = GETDATE()
                    WHERE id = @id
                `);

            // Count seats
            const seatCountResult = await transaction
                .request()
                .input('booking_id', sql.Int, req.params.id)
                .query('SELECT COUNT(*) AS cnt FROM dbo.booking_seats WHERE booking_id = @booking_id');

            const seatCount = seatCountResult.recordset[0].cnt;

            // Adjust available_seats
            if (current.status === 'CONFIRMED' && status === 'CANCELLED') {
                // Cancelling: restore seats
                await transaction
                    .request()
                    .input('trip_id', sql.Int, current.trip_id)
                    .input('count', sql.Int, seatCount)
                    .query(`
                        UPDATE dbo.trips SET available_seats = available_seats + @count,
                        updated_at = GETDATE() WHERE id = @trip_id
                    `);
            } else if (current.status === 'CANCELLED' && status === 'CONFIRMED') {
                // Re-confirming: reduce seats
                await transaction
                    .request()
                    .input('trip_id', sql.Int, current.trip_id)
                    .input('count', sql.Int, seatCount)
                    .query(`
                        UPDATE dbo.trips SET available_seats = available_seats - @count,
                        updated_at = GETDATE() WHERE id = @trip_id
                    `);
            }

            await transaction.commit();
            return res.json({ message: `Booking status updated to ${status}` });
        } catch (innerErr) {
            await transaction.rollback();
            throw innerErr;
        }
    } catch (err) {
        console.error('Update booking status error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
}

module.exports = {
    createBooking,
    bookingValidation,
    getMyBookings,
    getBookingById,
    getAllBookings,
    cancelBooking,
    updateBookingStatus,
};
