//auth.js
const { HttpStatus } = require("../constants/constants");
const { sendResponse } = require("../handlers/responseHandler");

// middlewares/auth.js
function verificarSesion(req, res, next) {
    // req.session.userId
    if (true) {
        return next();
    }
    sendResponse({
        res,
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Not authenticated'
    });
}

module.exports = verificarSesion;
