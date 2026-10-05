// backend/src/controllers/tripController.js
const { getPool, sql } = require('../config/database');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');

// ─── Validation Rules ─────────────────────────────────────────────────────────

const tripValidation = [
    body('bus_id').isInt({ min: 1 }).withMessage('Valid bus_id required'),
    body('route_id').isInt({ min: 1 }).withMessage('Valid route_id required'),
    body('travel_date').isISO8601().withMessage('Valid travel date required (YYYY-MM-DD)'),
    body('departure_time').notEmpty().withMessage('Departure time is required'),
    body('arrival_time').notEmpty().withMessage('Arrival time is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    validate,
];

// ─── GET all trips (with optional search filters) ─────────────────────────────

async function getAllTrips(req, res) {
    try {
        const pool = await getPool();
        const { origin, destination, travel_date } = req.query;

        let query = `
            SELECT t.id, t.bus_id, t.route_id, t.travel_date, t.departure_time,
                   t.arrival_time, t.price, t.available_seats, t.status,
                   b.bus_number, b.bus_type, b.company_name, b.amenities,
                   r.origin, r.destination, r.distance_km
            FROM dbo.trips t
            JOIN dbo.buses b ON b.id = t.bus_id
            JOIN dbo.routes r ON r.id = t.route_id
            WHERE 1=1
        `;

        const request = pool.request();

        if (origin) {
            query += ' AND r.origin = @origin';
            request.input('origin', sql.NVarChar, origin);
        }
        if (destination) {
            query += ' AND r.destination = @destination';
            request.input('destination', sql.NVarChar, destination);
        }
        if (travel_date) {
            query += ' AND t.travel_date = @travel_date';
            request.input('travel_date', sql.Date, travel_date);
        }

        query += ' ORDER BY t.travel_date, t.departure_time';

        const result = await request.query(query);
        return res.json(result.recordset);
    } catch (err) {
        console.error('Get trips error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
}

// ─── GET single trip with seat info ───────────────────────────────────────────

async function getTripById(req, res) {
    try {
        const pool = await getPool();
        const result = await pool
            .request()
            .input('id', sql.Int, req.params.id)
            .query(`
                SELECT t.id, t.bus_id, t.route_id, t.travel_date, t.departure_time,
                       t.arrival_time, t.price, t.available_seats, t.status,
                       b.bus_number, b.bus_type, b.company_name, b.total_seats, b.amenities,
                       r.origin, r.destination, r.distance_km
                FROM dbo.trips t
                JOIN dbo.buses b ON b.id = t.bus_id
                JOIN dbo.routes r ON r.id = t.route_id
                WHERE t.id = @id
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Trip not found' });
        }
        return res.json(result.recordset[0]);
    } catch (err) {
        console.error('Get trip error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
}

// ─── POST create trip ─────────────────────────────────────────────────────────

async function createTrip(req, res) {
    const { bus_id, route_id, travel_date, departure_time, arrival_time, price } = req.body;

    try {
        const pool = await getPool();

        // Get total seats for this bus
        const busResult = await pool
            .request()
            .input('bus_id', sql.Int, bus_id)
            .query('SELECT total_seats FROM dbo.buses WHERE id = @bus_id');

        if (busResult.recordset.length === 0) {
            return res.status(404).json({ message: 'Bus not found' });
        }

        const totalSeats = busResult.recordset[0].total_seats;

        const result = await pool
            .request()
            .input('bus_id', sql.Int, bus_id)
            .input('route_id', sql.Int, route_id)
            .input('travel_date', sql.Date, travel_date)
            .input('departure_time', sql.NVarChar, departure_time)
            .input('arrival_time', sql.NVarChar, arrival_time)
            .input('price', sql.Decimal(10, 2), price)
            .input('available_seats', sql.Int, totalSeats)
            .query(`
                INSERT INTO dbo.trips (bus_id, route_id, travel_date, departure_time, arrival_time, price, available_seats)
                OUTPUT INSERTED.*
                VALUES (@bus_id, @route_id, @travel_date, @departure_time, @arrival_time, @price, @available_seats)
            `);

        return res.status(201).json({ message: 'Trip created successfully', trip: result.recordset[0] });
    } catch (err) {
        console.error('Create trip error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
}

// ─── PUT update trip ──────────────────────────────────────────────────────────

async function updateTrip(req, res) {
    const { bus_id, route_id, travel_date, departure_time, arrival_time, price, status } = req.body;

    try {
        const pool = await getPool();
        const result = await pool
            .request()
            .input('id', sql.Int, req.params.id)
            .input('bus_id', sql.Int, bus_id)
            .input('route_id', sql.Int, route_id)
            .input('travel_date', sql.Date, travel_date)
            .input('departure_time', sql.NVarChar, departure_time)
            .input('arrival_time', sql.NVarChar, arrival_time)
            .input('price', sql.Decimal(10, 2), price)
            .input('status', sql.NVarChar, status || 'active')
            .query(`
                UPDATE dbo.trips
                SET bus_id = @bus_id,
                    route_id = @route_id,
                    travel_date = @travel_date,
                    departure_time = @departure_time,
                    arrival_time = @arrival_time,
                    price = @price,
                    status = @status,
                    updated_at = GETDATE()
                OUTPUT INSERTED.*
                WHERE id = @id
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Trip not found' });
        }
        return res.json({ message: 'Trip updated successfully', trip: result.recordset[0] });
    } catch (err) {
        console.error('Update trip error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
}

// ─── DELETE trip ──────────────────────────────────────────────────────────────

async function deleteTrip(req, res) {
    try {
        const pool = await getPool();
        const result = await pool
            .request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM dbo.trips OUTPUT DELETED.id WHERE id = @id');

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Trip not found' });
        }
        return res.json({ message: 'Trip deleted successfully' });
    } catch (err) {
        console.error('Delete trip error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
}

module.exports = {
    getAllTrips,
    getTripById,
    createTrip,
    updateTrip,
    deleteTrip,
    tripValidation,
};
