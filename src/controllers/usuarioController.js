
const { Usuario, Persona, Direccion, Estudiante, Profesor, Sequelize, sequelize } = require('../../models');
const { HttpStatus, ROL, MESSAGE_ERROR, MESSAGE_SUCCESS, TABLE_FIELDS, FIELDS, TABLE_NAME, ACTION } = require('../constants/constants');
const { sendResponse, CustomError } = require('../handlers/responseHandler');
const { validateIfExists, validateExistingUser, validateRoleChange, validateInput } = require('../utils/helpers');


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
        password,
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

        const usuario = await Usuario.create({
            id_persona: persona.id_persona,
            username,
            email,
            password_hash: password, // Se encripta en el hook beforeCreate
            rol
        }, { transaction });

        if (rol === ROL.STUDENT) {
            try {
                await Estudiante.create({
                    id_estudiante: persona.id_persona,
                    carnet: carnet
                }, { transaction });
            } catch (error) {
                console.error(MESSAGE_ERROR.CREATE_STUDENT, error);
                throw new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, req.t('error.CREATE_STUDENT'));
            }
        } else if (rol === ROL.PROFESSOR) {
            try {
                await Profesor.create({
                    id_profesor: persona.id_persona,
                    especialidad
                }, { transaction });
            } catch (error) {
                console.error(MESSAGE_ERROR.CREATE_PROFESSOR, error);
                throw new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, req.t('error.CREATE_PROFESSOR'));
            }
        }

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
        id_usuario,
        primer_nombre,
        segundo_nombre,
        primer_apellido,
        segundo_apellido,
        nombre_usuario,
        email,
        cedula,
        telefono,
        telefono_adicional,
        Direccion
    } = req.body;
    const userId = req.session.user.userId;
    
    const transaction = await sequelize.transaction(); // Iniciar transacción

    try {
        // Buscar al usuario
        const usuario = await Usuario.findByPk(id_usuario, {
            include: {
                model: Persona,
                include: {
                    model: Direccion
                }
            }
        });

        if (!usuario) {
            throw new CustomError(HttpStatus.NOT_FOUND, req.t('warning.USER_NOT_FOUND'));
        }

        // Actualizar campos de Persona
        if (usuario.Persona) {

            validateInput(primer_nombre, FIELDS.TEXT, req);
            segundo_nombre && validateInput(segundo_nombre, FIELDS.TEXT, req);
            validateInput(primer_apellido, FIELDS.TEXT, req);
            validateInput(segundo_apellido, FIELDS.TEXT, req);
            validateInput(cedula, FIELDS.ID, req);
            validateInput(telefono, FIELDS.PHONE_NUMBER, req);
            telefono_adicional && validateInput(telefono_adicional, FIELDS.PHONE_NUMBER, req);

            await validateUpdatesInputs({
                currentValue: usuario.Persona.cedula,
                newValue: cedula,
                model: Persona,
                field: TABLE_FIELDS.CEDULA,
                message: req.t('warning.CEDULA_ALREADY_USED')
            });

            await usuario.Persona.update({
                primer_nombre,
                segundo_nombre,
                primer_apellido,
                segundo_apellido,
                cedula,
                telefono,
                telefono_adicional
            }, { transaction });
        }

        // Actualizar campos de Dirección si existen
        if (usuario.Persona && usuario.Persona.Direccion) {
            
            validateInput(Direccion.direccion_exacta, FIELDS.TEXTBOX, req);
            validateInput(Direccion.canton, FIELDS.TEXT, req);
            validateInput(Direccion.distrito, FIELDS.TEXT, req);
            validateInput(Direccion.localidad, FIELDS.TEXT, req);
            validateInput(Direccion.provincia, FIELDS.TEXT, req);

            await usuario.Persona.Direccion.update({
                direccion_exacta: Direccion.direccion_exacta,
                canton: Direccion.canton,
                distrito: Direccion.distrito,
                localidad: Direccion.localidad,
                provincia: Direccion.provincia
            }, { transaction });
        }

        await AuditLog.create({
            user_id: userId,
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











