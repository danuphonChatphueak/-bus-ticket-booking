// backend/src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

// ─── Import routes ───────────────────────────────────────────────────────────
const authRoutes = require('./routes/authRoutes');
const busRoutes = require('./routes/busRoutes');
const routeRoutes = require('./routes/routeRoutes');
const tripRoutes = require('./routes/tripRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// ─── Middleware ──────────────────────────────────────────────────────────────

// CORS — allow frontend origin from environment variable
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));

// Parse JSON bodies
app.use(express.json());

// ─── Health Check ────────────────────────────────────────────────────────────

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'bus-ticket-booking-api',
    });
});

// ─── API Routes ─────────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

// ─── 404 handler ─────────────────────────────────────────────────────────────

app.use((req, res) => {
    res.status(404).json({ message: 'Endpoint not found' });
});

// ─── Global error handler ────────────────────────────────────────────────────

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ message: 'Internal server error' });
});

// ─── Start server ────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`🚌 Bus Ticket Booking API running on port ${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/health`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
