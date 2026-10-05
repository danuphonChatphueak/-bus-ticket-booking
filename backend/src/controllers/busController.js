// backend/src/controllers/busController.js
const { getPool, sql } = require('../config/database');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');

// ─── Validation Rules ─────────────────────────────────────────────────────────

const busValidation = [
    body('bus_number').trim().notEmpty().withMessage('Bus number is required'),
    body('bus_type').trim().notEmpty().withMessage('Bus type is required'),
    body('company_name').trim().notEmpty().withMessage('Company name is required'),
    body('total_seats').isInt({ min: 1 }).withMessage('Total seats must be a positive integer'),
    validate,
];

// ─── GET all buses ─────────────────────────────────────────────────────────────

async function getAllBuses(req, res) {
    try {
        const pool = await getPool();
        const result = await pool.request().query(`
            SELECT b.id, b.bus_number, b.bus_type, b.company_name,
                   b.total_seats, b.amenities, b.created_at,
                   COUNT(s.id) AS seat_count
            FROM dbo.buses b
            LEFT JOIN dbo.seats s ON s.bus_id = b.id
            GROUP BY b.id, b.bus_number, b.bus_type, b.company_name,
                     b.total_seats, b.amenities, b.created_at
            ORDER BY b.id
        `);
        return res.json(result.recordset);
    } catch (err) {
        console.error('Get buses error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
}

// ─── GET single bus ────────────────────────────────────────────────────────────

async function getBusById(req, res) {
    try {
        const pool = await getPool();
        const result = await pool
            .request()
            .input('id', sql.Int, req.params.id)
            .query('SELECT * FROM dbo.buses WHERE id = @id');

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Bus not found' });
        }
        return res.json(result.recordset[0]);
    } catch (err) {
        console.error('Get bus error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
}

// ─── POST create bus ──────────────────────────────────────────────────────────

async function createBus(req, res) {
    const { bus_number, bus_type, company_name, total_seats, amenities } = req.body;

    try {
        const pool = await getPool();
        const transaction = pool.transaction();
        await transaction.begin();

        try {
            // Insert bus
            const busResult = await transaction
                .request()
                .input('bus_number', sql.NVarChar, bus_number)
                .input('bus_type', sql.NVarChar, bus_type)
                .input('company_name', sql.NVarChar, company_name)
                .input('total_seats', sql.Int, total_seats)
                .input('amenities', sql.NVarChar, amenities || null)
                .query(`
                    INSERT INTO dbo.buses (bus_number, bus_type, company_name, total_seats, amenities)
                    OUTPUT INSERTED.*
                    VALUES (@bus_number, @bus_type, @company_name, @total_seats, @amenities)
                `);

            const bus = busResult.recordset[0];

            // Auto-generate seats for this bus
            for (let i = 1; i <= total_seats; i++) {
                const seatNumber = String(i).padStart(2, '0');
                const seatRow = Math.ceil(i / 2);
                const seatColumn = i % 2 === 1 ? 1 : 2;

                await transaction
                    .request()
                    .input('bus_id', sql.Int, bus.id)
                    .input('seat_number', sql.NVarChar, seatNumber)
                    .input('seat_row', sql.Int, seatRow)
                    .input('seat_column', sql.Int, seatColumn)
                    .query(`
                        INSERT INTO dbo.seats (bus_id, seat_number, seat_row, seat_column)
                        VALUES (@bus_id, @seat_number, @seat_row, @seat_column)
                    `);
            }

            await transaction.commit();
            return res.status(201).json({ message: 'Bus created successfully', bus });
        } catch (innerErr) {
            await transaction.rollback();
            throw innerErr;
        }
    } catch (err) {
        if (err.number === 2627 || err.number === 2601) {
            return res.status(409).json({ message: 'Bus number already exists' });
        }
        console.error('Create bus error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
}

// ─── PUT update bus ────────────────────────────────────────────────────────────

async function updateBus(req, res) {
    const { bus_number, bus_type, company_name, total_seats, amenities } = req.body;

    try {
        const pool = await getPool();
        const result = await pool
            .request()
            .input('id', sql.Int, req.params.id)
            .input('bus_number', sql.NVarChar, bus_number)
            .input('bus_type', sql.NVarChar, bus_type)
            .input('company_name', sql.NVarChar, company_name)
            .input('total_seats', sql.Int, total_seats)
            .input('amenities', sql.NVarChar, amenities || null)
            .query(`
                UPDATE dbo.buses
                SET bus_number = @bus_number,
                    bus_type = @bus_type,
                    company_name = @company_name,
                    total_seats = @total_seats,
                    amenities = @amenities,
                    updated_at = GETDATE()
                OUTPUT INSERTED.*
                WHERE id = @id
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Bus not found' });
        }
        return res.json({ message: 'Bus updated successfully', bus: result.recordset[0] });
    } catch (err) {
        console.error('Update bus error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
}

// ─── DELETE bus ────────────────────────────────────────────────────────────────

async function deleteBus(req, res) {
    try {
        const pool = await getPool();
        const result = await pool
            .request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM dbo.buses OUTPUT DELETED.id WHERE id = @id');

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Bus not found' });
        }
        return res.json({ message: 'Bus deleted successfully' });
    } catch (err) {
        console.error('Delete bus error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
}

module.exports = {
    getAllBuses,
    getBusById,
    createBus,
    updateBus,
    deleteBus,
    busValidation,
};
