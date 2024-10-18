
const { Usuario, Persona, Direccion, Estudiante, Profesor, Sequelize, sequelize } = require('../models');
const { HttpStatus, ROL, MESSAGE_ERROR, MESSAGE_SUCCESS, TABLE_FIELDS, FIELDS } = require('../constants/constants');
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
        direccion,
        username,
        email,
        password,
        rol,
        especialidad,
        carnet
    } = req.body;

    const transaction = await sequelize.transaction();

    try {

        const userRole = req.session.user.userRole;
        
        validateRoleChange(userRole, rol);

        await validateExistingUser(username, email);

        await validateIfExists({
            model: Persona,
            field: TABLE_FIELDS.CEDULA,
            value: cedula,
            errorMessage: `Person with ID ${cedula} is already registered.`
        });

        await validateIfExists({
            model: Estudiante,
            field: TABLE_FIELDS.CARNET,
            value: carnet,
            errorMessage: `Student with Carnet ${carnet} is already registered.`
        });
        validateInput(primer_nombre, FIELDS.TEXT);
        segundo_nombre ? validateInput(segundo_nombre, FIELDS.TEXT) : null;
        validateInput(primer_apellido, FIELDS.TEXT);
        validateInput(segundo_apellido, FIELDS.TEXT);
        validateInput(rol, FIELDS.TEXT);
        validateInput(cedula, FIELDS.ID);
        validateInput(telefono, FIELDS.PHONE_NUMBER);
        validateInput(email, FIELDS.EMAIL);

        if (rol === ROL.STUDENT) {
            validateInput(carnet, FIELDS.CARNET);

        } else if (rol === ROL.PROFESSOR) {
            validateInput(especialidad, FIELDS.TEXT);
        }


        const persona = await Persona.create({
            primer_nombre,
            segundo_nombre,
            primer_apellido,
            segundo_apellido,
            cedula,
            telefono,
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
                throw new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, MESSAGE_ERROR.CREATE_STUDENT);
            }
        } else if (rol === ROL.PROFESSOR) {
            try {
                await Profesor.create({
                    id_profesor: persona.id_persona,
                    especialidad
                }, { transaction });
            } catch (error) {
                console.error(MESSAGE_ERROR.CREATE_PROFESSOR, error);
                throw new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, MESSAGE_ERROR.CREATE_PROFESSOR);
            }
        }

        await transaction.commit();

        return sendResponse({
            res,
            statusCode: HttpStatus.CREATED,
            message: MESSAGE_SUCCESS.USER_REGISTERED,
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
                    'Validation error': validationErrors,
                    error: error.stack,
                }
            });
           
        }

        return sendResponse({
            res,
            statusCode: error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
            message: error?.message || {
                message: MESSAGE_ERROR.CREATE_USER,
                error: error.message,
                stack: error.stack
            }
        });
    }
};














