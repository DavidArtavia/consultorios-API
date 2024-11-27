const { Usuario, Profesor, Estudiante, Persona, sequelize } = require('../../models');
const bcrypt = require('bcryptjs');
const { HttpStatus, FIELDS, TABLE_FIELDS, ENV, KEYS, TIME, ROL, STATES, BCRYPT_CONFIG } = require('../constants/constants');
const { sendResponse, CustomError } = require('../handlers/responseHandler');
const { validateInput, validateIfUserExists, validatePasswordHash, checkUserStatus, generateTempPassword, getFullName } = require('../utils/helpers');
const emailService = require('../services/emailService');




exports.login = async (req, res, next) => {
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

        // Verificar si el usuario es un profesor o estudiante y está inactivo
        await checkUserStatus(user, req, next);

        // Verificar si la contraseña es temporal
        if (user.is_temp_password) {
            return sendResponse({
                res,
                statusCode: HttpStatus.OK,
                message: req.t('warning.TEMP_PASSWORD_MUST_CHANGE'),
                data: {
                    requirePasswordChange: true,
                    id_usuario: user.id_usuario,
                }
            });
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
                secure: process.env.APP_ENV == ENV.PROD,
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

exports.solicitarRecuperacionContrasena = async (req, res) => {
    const { cedula } = req.body;
    const transaction = await sequelize.transaction();

    try {
        // Validar la cédula
        validateInput(cedula, FIELDS.ID, req);

        // Buscar persona usuario por cédula
        const usuario = await Usuario.findOne({
            include: [
                {
                    model: Persona,
                    where: { cedula },
                    include: [
                        { model: Estudiante, required: false },
                        { model: Profesor, required: false }
                    ]
                }
            ],

        }, { transaction });

        if (!usuario) {
            throw new CustomError(
                HttpStatus.NOT_FOUND,
                req.t('warning.USER_NOT_FOUND')
            );
        }

        const tipoUsuario = usuario?.Persona?.Profesor ? ROL.PROFESSOR :
            usuario?.Persona?.Estudiante ? ROL.STUDENT : ROL.SUPERADMIN;

        if (tipoUsuario !== ROL.SUPERADMIN) {

            const datosEspecificos = usuario?.Persona?.Profesor || usuario?.Persona?.Estudiante;
            if (datosEspecificos.estado == STATES.INACTIVE) {
                switch (tipoUsuario) {
                    case ROL.PROFESSOR:
                        throw new CustomError(
                            HttpStatus.FORBIDDEN,
                            req.t('warning.INACTIVE_PROFESSOR')
                        );
                    case ROL.STUDENT:
                        throw new CustomError(
                            HttpStatus.FORBIDDEN,
                            req.t('warning.INACTIVE_STUDENT')
                        );
                }
            }
        }
        // Generar contraseña temporal
        const tempPassword = generateTempPassword();
        const password_hash = await bcrypt.hash(tempPassword, BCRYPT_CONFIG.SALT_ROUNDS);
        // Actualizar usuario con contraseña temporal
        await usuario.update({
            password_hash: password_hash,
            is_temp_password: true
        }, { transaction });

        // Enviar email
        await emailService.sendRecoveryEmail(
            usuario.email,
            {
                nombre_completo: getFullName(usuario.Persona),
                tempPassword
            }
        );

        await transaction.commit();

        return sendResponse({
            res,
            statusCode: HttpStatus.OK,
            message: req.t('success.PASSWORD_RESET_REQUESTED'),
            data: {}
        });

    } catch (error) {
        await transaction.rollback();
        return sendResponse({
            res,
            statusCode: error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
            message: error?.message || {
                message: req.t('error.PASSWORD_RESET_REQUEST'),
                error: error.message,
                stack: error.stack
            }
        });
    }
};

exports.cambiarContrasenaInicial = async (req, res) => {
    const { id_usuario, current_password, new_password } = req.body;
    const transaction = await sequelize.transaction();

    try {

        validateInput(new_password, FIELDS.PASSWORD, req);

        const user = await validateIfUserExists({
            model: Usuario,
            field: TABLE_FIELDS.UID_USUARIO,
            value: id_usuario,
            errorMessage: req.t('warning.USER_NOT_FOUND')
        });

        // Verificar si la contraseña actual es temporal
        if (!user.is_temp_password) {
            throw new CustomError(
                HttpStatus.BAD_REQUEST,
                req.t('warning.NOT_TEMP_PASSWORD')
            );
        }

        // Verificar contraseña actual
        const isValidPassword = await bcrypt.compare(current_password, user.password_hash);
        if (!isValidPassword) {
            throw new CustomError(
                HttpStatus.BAD_REQUEST,
                req.t('warning.INVALID_PASSWORD')
            );
        }

        // Verificar que la nueva contraseña sea diferente de la actual
        if (current_password === new_password) {
            throw new CustomError(
                HttpStatus.BAD_REQUEST,
                req.t('warning.SAME_PASSWORD')
            );
        }

        const userData = {
            userId: user.id_usuario,
            personaId: user.id_persona,
            userEmail: user.email,
            userName: user.username,
            userRole: user.rol
        };

        req.session.user = userData;

        // Actualizar a nueva contraseña
        const hashedPassword = await bcrypt.hash(new_password, BCRYPT_CONFIG.SALT_ROUNDS);
        await user.update({
            password_hash: hashedPassword,
            is_temp_password: false
        }, { transaction });

        await transaction.commit();

        return sendResponse({
            res,
            statusCode: HttpStatus.OK,
            message: req.t('success.PASSWORD_CHANGED'),
            data: { userData }
        });

    } catch (error) {
        await transaction.rollback();
        return sendResponse({
            res,
            statusCode: error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
            message: error?.message || {
                message: req.t('error.PASSWORD_CHANGE'),
                error: error.message,
                stack: error.stack
            }
        });
    }
};

