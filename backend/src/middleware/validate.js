// backend/src/middleware/validate.js
const { validationResult } = require('express-validator');

/**
 * Middleware to return 400 if express-validator found errors.
 */
function validate(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}

module.exports = { validate };
