exports.checkSession = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({
            status: false,
            message: "You are not logged in."
        });
    }
    next();
};
