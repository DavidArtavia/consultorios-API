//auth.js
const { HttpStatus } = require("../constants/constants");
const { sendResponse } = require("../handlers/responseHandler");

// middlewares/auth.js
function verifySession(req, res, next) {
    if (!req.session) {
        console.error('Session object not found');
        return sendResponse({
            res,
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Session configuration error'
        });
    }

    const user = req.session.user;
    console.log('Session232:', req.session);
    console.log('User from session:', user);

    if (!user) {
        return sendResponse({
            res,
            statusCode: HttpStatus.UNAUTHORIZED,
            message: req.t('warning.NOT_AUTHENTICATED')
        });
    }

    next();
}

module.exports = verifySession;
