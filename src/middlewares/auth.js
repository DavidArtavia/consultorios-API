//auth.js
const { HttpStatus } = require("../constants/constants");
const { sendResponse } = require("../handlers/responseHandler");

// middlewares/auth.js
function verifySession(req, res, next) {
    userId = req.session.userId
    if (userId) {
        return next();
    }
    sendResponse({
        res,
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Not authenticated'
    });
}

module.exports = verifySession;
