
const { AuditLog, Usuario, Persona, Direccion, Estudiante, Profesor, Sequelize, sequelize } = require('../../models');
const { HttpStatus, ROL, MESSAGE_ERROR, MESSAGE_SUCCESS, TABLE_FIELDS, FIELDS, TABLE_NAME, ACTION, STATES } = require('../constants/constants');
const { sendResponse, CustomError } = require('../handlers/responseHandler');
const emailService = require('../services/emailService');
const { validateIfExists, validateExistingUser, validateRoleChange, validateInput, generateTempPassword, validateIfUserExists, getFullName } = require('../utils/helpers');
const bcrypt = require('bcryptjs');


// Register a new user
exports.register = async (req, res) => {
    const {
        primer_nombre,
        segundo_nombre,
        primer_apellido,
        segundo_apellido,
        cedula,
        telefono,
        telefono_adicional,
        username,
        email,
        rol,
        especialidad,
        carnet,
        direccion
    } = req.body;

    const transaction = await sequelize.transaction();

    try {

        const userRole = req.session.user.userRole;

        validateRoleChange(userRole, rol, req);
        await validateExistingUser(username, email, req);

        await validateIfExists({
            model: Persona,
            field: TABLE_FIELDS.CEDULA,
            value: cedula,
            errorMessage: req.t('warning.IS_ALREADY_REGISTERED', { data: cedula })
        });


        validateInput(primer_nombre, FIELDS.TEXT, req);
        segundo_nombre && validateInput(segundo_nombre, FIELDS.TEXT, req);
        validateInput(primer_apellido, FIELDS.TEXT, req);
        validateInput(segundo_apellido, FIELDS.TEXT, req);
        validateInput(rol, FIELDS.TEXT, req);
        validateInput(cedula, FIELDS.ID, req);
        validateInput(telefono, FIELDS.PHONE_NUMBER, req);
        telefono_adicional && validateInput(telefono_adicional, FIELDS.PHONE_NUMBER, req);
        validateInput(email, FIELDS.EMAIL, req);

        if (rol == ROL.STUDENT) {
            validateInput(carnet, FIELDS.CARNET, req);
            await validateIfExists({
                model: Estudiante,
                field: TABLE_FIELDS.CARNET,
                value: carnet,
                errorMessage: req.t('warning.CARNET_ALREADY_REGISTERED', { data: carnet })
            }, req);

        } else if (rol == ROL.PROFESSOR) {
            validateInput(especialidad, FIELDS.TEXT, req);
        }


        const persona = await Persona.create({
            primer_nombre,
            segundo_nombre,
            primer_apellido,
            segundo_apellido,
            cedula,
            telefono,
            telefono_adicional
        }, { transaction });

        // Crear la dirección si se proporciona
        if (direccion) {
            await Direccion.create({
                id_persona: persona.id_persona,
                direccion_exacta: direccion.direccion_exacta,
                canton: direccion.canton,
                distrito: direccion.distrito,
                localidad: direccion.localidad,
                provincia: direccion.provincia,
            }, { transaction });
        }

        const tempPassword = generateTempPassword();

        const usuario = await Usuario.create({
            id_persona: persona.id_persona,
            username,
            email,
            password_hash: tempPassword, // Se encripta en el hook beforeCreate
            is_temp_password: true,
            rol
        }, { transaction });

        if (rol === ROL.STUDENT) {
            try {
                await Estudiante.create({
                    id_estudiante: persona.id_persona,
                    carnet: carnet
                }, { transaction });
            } catch (error) {
                throw new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, req.t('error.CREATE_STUDENT'));
            }
        } else if (rol === ROL.PROFESSOR) {
            try {
                await Profesor.create({
                    id_profesor: persona.id_persona,
                    especialidad
                }, { transaction });
            } catch (error) {
                throw new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, req.t('error.CREATE_PROFESSOR'));
            }
        }

        await emailService.sendWelcomeEmail(email, {
            nombre_completo: getFullName(persona),
            email,
            tempPassword
        });

        await transaction.commit();

        return sendResponse({
            res,
            statusCode: HttpStatus.CREATED,
            message: req.t('success.USER_REGISTERED'),
            data: { user: usuario }
        });

    } catch (error) {

        await transaction.rollback();

        if (error.name === 'SequelizeValidationError') {
            const validationErrors = error.errors.map(err => err.message);

            return sendResponse({
                res,
                statusCode: HttpStatus.BAD_REQUEST,
                message: {
                    "Validation error": validationErrors,
                    error: error.stack,
                }
            });

        }

        return sendResponse({
            res,
            statusCode: error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
            message: error?.message || {
                message: req.t('error.CREATE_USER'),
                error: error.message,
                stack: error.stack
            }
        });
    }
};



exports.editarUsuario = async (req, res) => {
    const {
        primer_nombre,
        segundo_nombre,
        primer_apellido,
        segundo_apellido,
        telefono,
        telefono_adicional,
    } = req.body;
    const id_usuario = req.session.user.userId;

    const transaction = await sequelize.transaction(); // Iniciar transacción

    try {
        // Buscar al usuario
        const usuario = await Usuario.findByPk(id_usuario, {
            include: [{ model: Persona }]
        });

        if (!usuario) {
            throw new CustomError(HttpStatus.NOT_FOUND, req.t('warning.USER_NOT_FOUND'));
        }

        // Actualizar campos de Persona
        if (usuario.Persona) {

            validateInput(primer_nombre, FIELDS.TEXT, req);
            validateInput(primer_apellido, FIELDS.TEXT, req);
            validateInput(segundo_apellido, FIELDS.TEXT, req);
            validateInput(telefono, FIELDS.PHONE_NUMBER, req);
            segundo_nombre && validateInput(segundo_nombre, FIELDS.TEXT, req);
            telefono_adicional && validateInput(telefono_adicional, FIELDS.PHONE_NUMBER, req);

            await usuario.Persona.update({
                primer_nombre,
                segundo_nombre,
                primer_apellido,
                segundo_apellido,
                telefono,
                telefono_adicional
            }, { transaction });
        }

        await AuditLog.create({
            user_id: id_usuario,
            action: req.t('action.UPDATE_USER'),
            description: req.t('description.UPDATE_USER', { data: id_usuario })
        }, { transaction });

        await transaction.commit(); // Confirmar la transacción

        return sendResponse({
            res,
            statusCode: HttpStatus.OK,
            message: req.t('success.USER_UPDATED'),
            data: { usuario }
        });
    } catch (error) {
        await transaction.rollback(); // Revertir la transacción en caso de error

        return sendResponse({
            res,
            statusCode: error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
            message: error?.message || req.t('error.UPDATE_USER'),
            error: error.stack
        });
    }
};

exports.cambiarContrasena = async (req, res) => {
    const { current_password, new_password } = req.body;
    const transaction = await sequelize.transaction();
    const id_usuario = req.session.user.userId;

    try {

        validateInput(new_password, FIELDS.PASSWORD, req);

        const user = await validateIfUserExists({
            model: Usuario,
            field: TABLE_FIELDS.UID_USUARIO,
            value: id_usuario,
            errorMessage: req.t('warning.USER_NOT_FOUND')
        });

        // Verificar contraseña actual
        const isValidPassword = await bcrypt.compare(current_password, user.password_hash);
        if (!isValidPassword) {
            throw new CustomError(
                HttpStatus.UNAUTHORIZED,
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

        // Actualizar a nueva contraseña
        const hashedPassword = await bcrypt.hash(new_password, 10);
        await user.update({
            password_hash: hashedPassword,
            is_temp_password: false
        }, { transaction });

        await transaction.commit();

        return sendResponse({
            res,
            statusCode: HttpStatus.OK,
            message: req.t('success.PASSWORD_CHANGED'),
            data: {}
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

exports.editarDatosUsuarioAdmin = async (req, res) => {
    const { id_usuario, email, cedula, carnet } = req.body;
    const transaction = await sequelize.transaction();
    try {

        const adminId = req.session.user.userId;
        const adminRole = req.session.user.userRole;

        // Verificar que sea administrador
        if (adminRole !== ROL.SUPERADMIN) {
            throw new CustomError(
                HttpStatus.FORBIDDEN,
                req.t('warning.ADMIN_REQUIRED')
            );
        }

        validateInput(email, FIELDS.EMAIL, req);
        validateInput(cedula, FIELDS.ID, req);

        const usuario = await Usuario.findByPk(id_usuario, {
            include: [
                {
                    model: Persona,
                    include: [
                        { model: Estudiante, required: false },
                        { model: Profesor, required: false }
                    ]
                }
            ]
        });

        if (!usuario) {
            throw new CustomError(
                HttpStatus.NOT_FOUND,
                req.t('warning.USER_NOT_FOUND')
            );
        }
        // Verificar si el email ya existe en otro usuario
        await validateExistingUser(null, email, req);

        // Verificar si la cédula ya existe en otra persona
        await validateIfExists({
            model: Persona,
            field: TABLE_FIELDS.CEDULA,
            value: cedula,
            errorMessage: req.t('warning.IS_ALREADY_REGISTERED', { data: cedula })
        });

        // Actualizar email del usuario
        await usuario.update({ email }, { transaction });

        // Actualizar cédula de la persona
        await usuario.Persona.update({ cedula }, { transaction });

        // Si es estudiante y se proporcionó carnet
        if (usuario.rol === ROL.STUDENT) {
            if (!carnet) {
                throw new CustomError(
                    HttpStatus.BAD_REQUEST,
                    req.t('warning.CARNET_REQUIRED')
                );
            }

            validateInput(carnet, FIELDS.CARNET, req);

            // Verificar si el carnet ya existe
            await validateIfExists({
                model: Estudiante,
                field: TABLE_FIELDS.CARNET,
                value: carnet,
                errorMessage: req.t('warning.CARNET_ALREADY_REGISTERED', { data: carnet })
            }, req);

            // Actualizar carnet
            usuario.Persona.Estudiante && await usuario.Persona.Estudiante.update({ carnet }, { transaction });
        }

        // Registrar en auditoría
        await AuditLog.create({
            user_id: adminId,
            action: req.t('action.ADMIN_UPDATE_USER'),
            description: req.t('description.ADMIN_UPDATE_USER', {
                admin: adminId,
                user: id_usuario
            })
        }, { transaction });

        await transaction.commit();
        return sendResponse({
            res,
            statusCode: HttpStatus.OK,
            message: req.t('success.USER_UPDATED'),
            data: { usuario }
        });

    } catch (error) {
        if (transaction && !transaction.finished) {
            await transaction.rollback();
        }
        return sendResponse({
            res,
            statusCode: error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
            message: error?.message || {
                message: req.t('error.UPDATE_USER'),
                error: error.message,
                stack: error.stack
            }
        });
    }
};