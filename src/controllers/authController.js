const { Usuario, Profesor } = require('../../models');
const bcrypt = require('bcryptjs');
const { HttpStatus, MESSAGE_ERROR, MESSAGE_SUCCESS, FIELDS, TABLE_FIELDS, ENV, KEYS, TIME, ROL, STATES } = require('../constants/constants');
const { sendResponse, CustomError } = require('../handlers/responseHandler');
const { validateInput, validateIfUserExists, validatePasswordHash } = require('../utils/helpers');
const { t } = require('i18next');


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        validateInput(email, FIELDS.EMAIL, req);

        // Buscar al usuario por email
        const user = await validateIfUserExists({
            model: Usuario,
            field: TABLE_FIELDS.EMAIL,
            value: email,
            errorMessage: req.t('warning.USER_NOT_FOUND')
        });

        // Validar la contraseña
        await validatePasswordHash(password, user.password_hash, req);

        // Verificar si el usuario es un profesor y está inactivo
        if (user.rol == ROL.PROFESSOR) {
            const profesor = await Profesor.findOne({ where: { id_profesor: user.id_persona } });

            if (!profesor) {
                throw new CustomError(HttpStatus.NOT_FOUND, req.t('warning.PROFESSOR_NOT_FOUND'));
            }

            // Verificar si el profesor está inactivo
            if (profesor.estado !== STATES.ACTIVE) {
                throw new CustomError(HttpStatus.FORBIDDEN, req.t('warning.INACTIVE_PROFESSOR'));
            }
        }

        // Crear la sesión del usuario
        const userData = {
            userId: user.id_usuario,
            personaId: user.id_persona,
            userEmail: user.email,
            userName: user.username,
            userRole: user.rol
        };

        req.session.user = userData;

        // Enviar la cookie con los datos del usuario
        res.cookie(KEYS.USER_DATA, JSON.stringify(userData), {
            httpOnly: false,
            secure: process.env.APP_ENV == ENV.PROD,
            maxAge: TIME.DAY
        });

        // Responder al cliente
        return sendResponse({
            res,
            statusCode: HttpStatus.OK,
            message: req.t('success.LOGIN'),
            data: [{ user: userData }]
        });

    } catch (error) {
        console.log('error -->>>', error, error.message, error.stack, error.statusCode);
        return sendResponse({
            res,
            statusCode: error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
            message: error?.message || {
                message: req.t('error.FATAL_ERROR_LOGIN'),
                error: error.message,
                stack: error.stack
            }
        });
    }
};


// Logout
exports.logout = (req, res) => {


    try {
        if (!req.session) {
            throw new CustomError(HttpStatus.FORBIDDEN, req.t('warning.NO_ACTIVATE'));

        }

        req.session.destroy((err) => {
            if (err) {
                throw new CustomError(HttpStatus.BAD_REQUEST, req.t('error.DESTROY_SESSION'));
            }

            // Clear the cookies
            const cookieOptions = {
                path: '/',
                httpOnly: false,
                secure: process.env.APP_ENV === 'PROD',
                // sameSite: 'strict'
            };

            res.clearCookie('connect.sid', cookieOptions);
            res.clearCookie('userData', cookieOptions);

            // Respond to the client
            return sendResponse({
                res,
                statusCode: HttpStatus.OK,
                message: req.t('success.LOGOUT')
            });
        });

    } catch (error) {

        return sendResponse({
            res,
            statusCode: error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
            message: error?.message || {
                message: req.t('error.FATAL_ERROR_LOGOUT'), 
                error: error.message,
                stack: error.stack
            }
        });
    }
};