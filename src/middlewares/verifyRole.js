const { HttpStatus, MESSAGE_ERROR } = require("../constants/constants");
const { sendResponse } = require("../handlers/responseHandler");

// Middleware para verificar el rol del usuario
exports.verifyRole = (roles) => {
    return (req, res, next) => {
        const userRole = req.session.userRole;  // Obtener el rol del usuario desde la sesión
        
        if (!userRole || !roles.includes(userRole)) {

            if (userRole == null) {
                sendResponse({
                    res,
                    statusCode: HttpStatus.UNAUTHORIZED,
                    message: MESSAGE_ERROR.MUST_LOGIN
                });
            } else {
                sendResponse({
                    res,
                    statusCode: HttpStatus.FORBIDDEN,
                    message: `Access denied: The ${userRole} does not have the necessary permissions.`
                });
            }
            return;
        }

        next();  
    };
};
