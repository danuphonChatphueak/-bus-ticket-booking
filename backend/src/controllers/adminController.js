// backend/src/controllers/adminController.js
const { getPool } = require('../config/database');

/**
 * GET /api/admin/dashboard
 * Returns aggregated statistics for the admin dashboard.
 */
async function getDashboard(req, res) {
    try {
        const pool = await getPool();

        const result = await pool.request().query(`
            SELECT
                (SELECT COUNT(*) FROM dbo.buses)   AS total_buses,
                (SELECT COUNT(*) FROM dbo.trips)   AS total_trips,
                (SELECT COUNT(*) FROM dbo.bookings WHERE status = 'CONFIRMED') AS total_bookings,
                (SELECT COUNT(DISTINCT user_id) FROM dbo.bookings WHERE status = 'CONFIRMED') AS total_passengers,
                (SELECT ISNULL(SUM(total_price), 0) FROM dbo.bookings WHERE status = 'CONFIRMED') AS total_revenue
        `);

        return res.json(result.recordset[0]);
    } catch (err) {
        console.error('Dashboard error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
}

/**
 * GET /api/admin/users
 * Returns all users (for admin user management).
 */
async function getAllUsers(req, res) {
    try {
        const pool = await getPool();
        const result = await pool.request().query(`
            SELECT id, name, email, role, created_at
            FROM dbo.users
            ORDER BY created_at DESC
        `);
        return res.json(result.recordset);
    } catch (err) {
        console.error('Get users error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
}

module.exports = { getDashboard, getAllUsers };
