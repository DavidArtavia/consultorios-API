const { Usuario } = require('../models');
const bcrypt = require('bcryptjs');
const { HttpStatus, MESSAGE_ERROR, MESSAGE_SUCCESS } = require('../constants/constants');
const { sendResponse, CustomError } = require('../handlers/responseHandler');
const { validateLoginInput } = require('../utils/helpers');

// Login a user and create a session
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // verifica que los campos no esten vacios
        const validationErrors = validateLoginInput(email, password);
        if (validationErrors.length > 0) {

            throw new CustomError(HttpStatus.BAD_REQUEST, validationErrors.join(', '));
            return;
        }

        // Buscar al usuario por email
        const user = await Usuario.findOne({ where: { email } });
        if (!user) {
            throw new CustomError(HttpStatus.BAD_REQUEST, MESSAGE_ERROR.INVALID_EMAIL);
            return;
        }

        // Verificar la contraseña
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            throw new CustomError(HttpStatus.BAD_REQUEST, MESSAGE_ERROR.INVALID_PASSWORD);
            return;
        }

        // Crear la sesión del usuario
        req.session.userId = user.id_usuario;
        req.session.userRole = user.rol;

        // Responder al cliente

        return sendResponse({
            res,
            statusCode: HttpStatus.OK,
            message: MESSAGE_SUCCESS.LOGIN,
            data: [
                {
                    user: {
                        id_usuario: user.id_usuario,
                        id_persona: user.id_persona,
                        username: user.username,
                        email: user.email,
                        rol: user.rol
                    }
                }
            ]
        });

    } catch (error) {
        sendResponse({
            res,
            statusCode: error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
            message: error?.message || MESSAGE_ERROR.FATAL_ERROR_LOGIN,
        });
    }
};

// Logout
exports.logout = (req, res) => {


    try {
        if (!req.session) {
            throw new CustomError(HttpStatus.FORBIDDEN, MESSAGE_ERROR.NO_ACTIVATE);

        }

        req.session.destroy((err) => {
            if (err) {
                throw new CustomError(HttpStatus.BAD_REQUEST, MESSAGE_ERROR.DESTROY_SESSION);
            }

            // Clear the cookie
            res.clearCookie('connect.sid', { path: '/' });

            // Respond to the client
            sendResponse({ res, statusCode: HttpStatus.OK, message: MESSAGE_SUCCESS.LOGOUT });
        });

    } catch (error) {
        sendResponse({
            res,
            statusCode: error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
            message: error?.message || MESSAGE_ERROR.FATAL_ERROR_LOGOUT,
        });
    }
};