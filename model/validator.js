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

exports.isPresent = (names) => {
    return (req, res, next) => {
        const values = req.body[names]; // Assuming you're looking for the values in 'req.body'

        if (!values || values.length === 0) {
            return res.json({
                status: 0,
                message: `Values ${names} are not present.`,
            });
        }
        next();
    };
};

exports.verifyToken = (req, res, next) => {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
        return res.status(401).json({
            status: 0,
            message: 'No token provided.'
        });
    }

    const token = authorizationHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_TOKEN);
        req.decoded = decoded;

        const currentTimestamp = Math.floor(Date.now() / 1000);
        if (decoded.exp < currentTimestamp) {
            return res.json({
                status: 0,
                message: 'Token has expired.'
            });
        }

        next();
    } catch (error) {
        return res.status(401).json({
            status: 0,
            message: 'Invalid or expired token.'
        });
    }
};
