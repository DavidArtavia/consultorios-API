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
        const userData = {
            userId: user.id_usuario,
            PersonaId: user.id_persona,
            userEmail: user.email,
            userName: user.username,
            userRole: user.rol
        };

        req.session.user = userData;

        // Enviar la cookie con los datos del usuario
        res.cookie('userData', JSON.stringify(userData), {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            // sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        // Responder al cliente

        return sendResponse({
            res,
            statusCode: HttpStatus.OK,
            message: MESSAGE_SUCCESS.LOGIN,
            data: [{ user: userData }]
        });

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

            // Clear the cookies
            const cookieOptions = {
                path: '/',
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                // sameSite: 'strict'
            };

            res.clearCookie('connect.sid', cookieOptions);
            res.clearCookie('userData', cookieOptions);

            // Respond to the client
            sendResponse({
                res,
                statusCode: HttpStatus.OK,
                message: MESSAGE_SUCCESS.LOGOUT
            });
        });

    } catch (error) {
        return sendResponse({
            res,
            statusCode: error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
            message: error?.message || MESSAGE_ERROR.FATAL_ERROR_LOGOUT,
        });
    }
};