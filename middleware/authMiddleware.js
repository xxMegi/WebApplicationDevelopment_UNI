function isAuthenticated(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }

    next();
}

module.exports = {
    isAuthenticated
};