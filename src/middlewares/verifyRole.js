const { HttpStatus } = require("../constants/constants");
const { sendResponse } = require("../handlers/responseHandler");

// Middleware para verificar el rol del usuario
exports.verifyRole = (roles) => {
    return (req, res, next) => {
        const userRole = req.session.userRole;  // Obtener el rol del usuario desde la sesión
        
        if (!userRole || !roles.includes(userRole)) {
            console.log('userRole', userRole);

            if (userRole == null) {
                sendResponse({
                    res,
                    statusCode: HttpStatus.UNAUTHORIZED,
                    message: 'You must log in'
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

        next();  // Si tiene el rol permitido, continúa con la siguiente función
    };
};
