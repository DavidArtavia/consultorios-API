const { Usuario } = require('../models');
const bcrypt = require('bcryptjs');
const { HttpStatus, MESSAGE_ERROR, MESSAGE_SUCCESS, FIELDS, TABLE_FIELDS } = require('../constants/constants');
const { sendResponse, CustomError } = require('../handlers/responseHandler');
const { validateInput, validateIfUserExists, validatePasswordHash } = require('../utils/helpers');


// Login a user and create a session
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        validateInput(email, FIELDS.EMAIL);

        // Buscar al usuario por email
       const user = await validateIfUserExists({
            model: Usuario,
            field: TABLE_FIELDS.EMAIL,
            value: email,
            errorMessage: MESSAGE_ERROR.INVALID_EMAIL
        });

        // Validar la contraseña
        await validatePasswordHash(password, user.password_hash);

        // Crear la sesión del usuario
        req.session.userId = user.id_usuario;
        req.session.userRole = user.rol;
        req.session.userName = user.username;

        // Serializar los datos en un JSON y almacenarlos en una cookie
        const userData = JSON.stringify({
            userId: user.id_usuario,
            userName: user.username,
            userRole: user.rol
        });

        // Enviar la cookie con los datos del usuario
        res.cookie('userData', userData, { maxAge: 900000, httpOnly: false });

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

        return res.json(req.session);

    } catch (error) {
        console.error(error);
        
        return sendResponse({
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
            res.clearCookie('userData', { maxAge: 0});


            // Respond to the client
            sendResponse({ res, statusCode: HttpStatus.OK, message: MESSAGE_SUCCESS.LOGOUT });
        });

    } catch (error) {
        return sendResponse({
            res,
            statusCode: error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
            message: error?.message || MESSAGE_ERROR.FATAL_ERROR_LOGOUT,
        });
    }
};