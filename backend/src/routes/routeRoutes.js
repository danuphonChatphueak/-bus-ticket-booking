// backend/src/routes/routeRoutes.js
const express = require('express');
const router = express.Router();
const { getAllRoutes, getRouteById, createRoute, updateRoute, deleteRoute, routeValidation } = require('../controllers/routeController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// GET /api/routes — public
router.get('/', getAllRoutes);

// GET /api/routes/:id — public
router.get('/:id', getRouteById);

// POST /api/routes — admin only
router.post('/', authenticateToken, requireAdmin, routeValidation, createRoute);

// PUT /api/routes/:id — admin only
router.put('/:id', authenticateToken, requireAdmin, routeValidation, updateRoute);

// DELETE /api/routes/:id — admin only
router.delete('/:id', authenticateToken, requireAdmin, deleteRoute);

module.exports = router;
