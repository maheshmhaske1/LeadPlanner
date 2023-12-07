const jwt = require('jsonwebtoken');
const dotenv = require("dotenv").config();

const { JWT_TOKEN } = process.env;

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

exports.verifyBmpAdmin = (req, res, next) => {
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

        if (req.decoded.role_name !== "admin" && req.decoded.type_id !== 2) {
            return res.json({
                status: 0,
                message: 'unauthorized user.'
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

exports.verifyBmpAdminOrBmpAcademyManager = (req, res, next) => {
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

        if (req.decoded.type_id !== 0 && req.decoded.type_id !== 2) {
            return res.json({
                status: 0,
                message: 'Unauthorized user.'
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

exports.verifyBlogger = (req, res, next) => {
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

        if (req.decoded.role_name !== "blogger" && req.decoded.role_name !== "admin") {
            return res.json({
                status: 0,
                message: 'unauthorized user.'
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

