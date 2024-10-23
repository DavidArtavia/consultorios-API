//auth.js
const { HttpStatus } = require("../constants/constants");
const { sendResponse } = require("../handlers/responseHandler");

// middlewares/auth.js
function verifySession(req, res, next) {
    user = req.session.user    
    if (user) {
        
        return next();
    }
    sendResponse({
        res,
        statusCode: HttpStatus.UNAUTHORIZED,
        message: req.t('warning.NOT_AUTHENTICATED')
    });
}

module.exports = verifySession;
