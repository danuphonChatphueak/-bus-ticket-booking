// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');

/**
 * Verifies JWT token from Authorization header.
 * Attaches decoded user payload to req.user.
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
}

/**
 * Requires user to have 'admin' role.
 * Must be used AFTER authenticateToken.
 */
function requireAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
}

module.exports = { authenticateToken, requireAdmin };
