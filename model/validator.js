// validationMiddleware.js
const validator = require("validator");

exports.validateLead = (...fields) => (req, res, next) => {
    const missingFields = fields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
        return res.json({
            status: 1,
            message: `${missingFields.join(', ')} are required values`
        });
    }
    next();
};

