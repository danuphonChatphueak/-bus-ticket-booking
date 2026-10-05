// backend/src/controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getPool, sql } = require('../config/database');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');

// ─── Validation Rules ────────────────────────────────────────────────────────

const registerValidation = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
    validate,
];

const loginValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password is required'),
    validate,
];

// ─── Handlers ─────────────────────────────────────────────────────────────────

async function register(req, res) {
    const { name, email, password } = req.body;

    try {
        const pool = await getPool();

        // Check duplicate email
        const existing = await pool
            .request()
            .input('email', sql.NVarChar, email)
            .query('SELECT id FROM dbo.users WHERE email = @email');

        if (existing.recordset.length > 0) {
            return res.status(409).json({ message: 'Email already registered' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Insert user
        const result = await pool
            .request()
            .input('name', sql.NVarChar, name)
            .input('email', sql.NVarChar, email)
            .input('password_hash', sql.NVarChar, passwordHash)
            .query(`
                INSERT INTO dbo.users (name, email, password_hash, role)
                OUTPUT INSERTED.id, INSERTED.name, INSERTED.email, INSERTED.role
                VALUES (@name, @email, @password_hash, 'passenger')
            `);

        const user = result.recordset[0];
        const token = generateToken(user);

        return res.status(201).json({
            message: 'Registration successful',
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
        });
    } catch (err) {
        console.error('Register error:', err);
        return res.status(500).json({ message: 'Server error during registration' });
    }
}

async function login(req, res) {
    const { email, password } = req.body;

    try {
        const pool = await getPool();

        const result = await pool
            .request()
            .input('email', sql.NVarChar, email)
            .query('SELECT id, name, email, password_hash, role FROM dbo.users WHERE email = @email');

        if (result.recordset.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const user = result.recordset[0];
        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = generateToken(user);

        return res.status(200).json({
            message: 'Login successful',
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
        });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ message: 'Server error during login' });
    }
}

async function getProfile(req, res) {
    try {
        const pool = await getPool();
        const result = await pool
            .request()
            .input('id', sql.Int, req.user.id)
            .query('SELECT id, name, email, role, created_at FROM dbo.users WHERE id = @id');

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.json(result.recordset[0]);
    } catch (err) {
        console.error('Get profile error:', err);
        return res.status(500).json({ message: 'Server error' });
    }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
}

module.exports = {
    register,
    registerValidation,
    login,
    loginValidation,
    getProfile,
};
