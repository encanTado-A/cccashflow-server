function checkAuthenticated(req, res, next) {
    if ( req.isAuthenticated() ) {
        return next();
    }
    return res.redirect('/test/login');
};

function checkNotAuthenticated(req, res, next) {
    if ( req.isAuthenticated() ) {
        return res.redirect('/test/');
    }
    return next();
};

module.exports = { checkAuthenticated, checkNotAuthenticated};