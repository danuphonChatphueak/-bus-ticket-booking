// backend/src/controllers/routeController.js
const { getPool, sql } = require('../config/database');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');

// ─── Validation Rules ─────────────────────────────────────────────────────────

const routeValidation = [
    body('origin').trim().notEmpty().withMessage('Origin is required'),
    body('destination').trim().notEmpty().withMessage('Destination is required'),
    validate,
];

// ─── GET all routes ───────────────────────────────────────────────────────────

async function getAllRoutes(req, res) {
    try {
        const pool = await getPool();
        const result = await pool.request().query(`
            SELECT id, origin, destination, distance_km, created_at
            FROM dbo.routes
            ORDER BY origin, destination
        `);
        return res.json(result.recordset);
    } catch (err) {
        console.error('Get routes error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
}

// ─── GET single route ─────────────────────────────────────────────────────────

async function getRouteById(req, res) {
    try {
        const pool = await getPool();
        const result = await pool
            .request()
            .input('id', sql.Int, req.params.id)
            .query('SELECT * FROM dbo.routes WHERE id = @id');

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Route not found' });
        }
        return res.json(result.recordset[0]);
    } catch (err) {
        console.error('Get route error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
}

// ─── POST create route ───────────────────────────────────────────────────────

async function createRoute(req, res) {
    const { origin, destination, distance_km } = req.body;

    try {
        const pool = await getPool();
        const result = await pool
            .request()
            .input('origin', sql.NVarChar, origin)
            .input('destination', sql.NVarChar, destination)
            .input('distance_km', sql.Decimal(8, 2), distance_km || null)
            .query(`
                INSERT INTO dbo.routes (origin, destination, distance_km)
                OUTPUT INSERTED.*
                VALUES (@origin, @destination, @distance_km)
            `);

        return res.status(201).json({ message: 'Route created successfully', route: result.recordset[0] });
    } catch (err) {
        if (err.number === 2627 || err.number === 2601) {
            return res.status(409).json({ message: 'This route already exists' });
        }
        console.error('Create route error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
}

// ─── PUT update route ─────────────────────────────────────────────────────────

async function updateRoute(req, res) {
    const { origin, destination, distance_km } = req.body;

    try {
        const pool = await getPool();
        const result = await pool
            .request()
            .input('id', sql.Int, req.params.id)
            .input('origin', sql.NVarChar, origin)
            .input('destination', sql.NVarChar, destination)
            .input('distance_km', sql.Decimal(8, 2), distance_km || null)
            .query(`
                UPDATE dbo.routes
                SET origin = @origin,
                    destination = @destination,
                    distance_km = @distance_km,
                    updated_at = GETDATE()
                OUTPUT INSERTED.*
                WHERE id = @id
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Route not found' });
        }
        return res.json({ message: 'Route updated successfully', route: result.recordset[0] });
    } catch (err) {
        console.error('Update route error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
}

// ─── DELETE route ─────────────────────────────────────────────────────────────

async function deleteRoute(req, res) {
    try {
        const pool = await getPool();
        const result = await pool
            .request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM dbo.routes OUTPUT DELETED.id WHERE id = @id');

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Route not found' });
        }
        return res.json({ message: 'Route deleted successfully' });
    } catch (err) {
        console.error('Delete route error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
}

module.exports = {
    getAllRoutes,
    getRouteById,
    createRoute,
    updateRoute,
    deleteRoute,
    routeValidation,
};
