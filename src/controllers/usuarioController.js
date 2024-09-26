
const { Usuario, Persona, Direccion, Estudiante, Profesor, Sequelize } = require('../models');
const { HttpStatus, ROL, MESSAGE_ERROR, MESSAGE_SUCCESS } = require('../constants/constants');
const { sendResponse, CustomError } = require('../handlers/responseHandler');


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

    try {


        const userRole = req.session.userRole;
        // Verificar que el usuario no tenga el mismo rol
        if (userRole === rol) {
            throw new CustomError(
                HttpStatus.FORBIDDEN,
                MESSAGE_ERROR.WHIOUT_PERMISSION
            );
        }

        // Validar datos y verificar que el usuario o correo no existan
        const existingUser = await Usuario.findOne({
            where: {
                [Sequelize.Op.or]: [{ email }, { username }]
            }
        });
        const existingPerson = await Persona.findOne({
            where: {
                cedula
            }
        });

        const existingCarnet = await Estudiante.findOne({
            where: {
                carnet
            }
        });


        // Verificar si ya existe el usuario
        if (existingUser) {
            if (existingUser.email === email) {
                throw new CustomError(HttpStatus.BAD_REQUEST, MESSAGE_ERROR.EMAIL_ALREADY_USED);
            }
            if (existingUser.username === username) {
                throw new CustomError(HttpStatus.BAD_REQUEST, MESSAGE_ERROR.USERNAME_ALREADY_USED);
            }
        }

        // Verificar si ya existe la cédula registrada
        if (existingPerson && existingPerson.cedula === cedula) {
            throw new CustomError(HttpStatus.BAD_REQUEST, MESSAGE_ERROR.ID_ALREADY_USED);
        }

        // Verificar si ya existe el carnet registrado (solo para estudiantes)
        if (existingCarnet && existingCarnet.carnet === carnet) {
            throw new CustomError(HttpStatus.BAD_REQUEST, MESSAGE_ERROR.CARNE_ALREADY_USED);
        }


        // // Crear un nuevo registro en la tabla Persona
        const persona = await Persona.create({
            primer_nombre,
            segundo_nombre,
            primer_apellido,
            segundo_apellido,
            cedula,
            telefono,
        });

        // Crear la dirección si se proporciona
        if (direccion) {
            await Direccion.create({
                id_persona: persona.id_persona,
                direccion_exacta: direccion.direccion_exacta,
                canton: direccion.canton,
                distrito: direccion.distrito,
                localidad: direccion.localidad,
                provincia: direccion.provincia,
            });
        }

        // Crear un nuevo usuario
        const usuario = await Usuario.create({
            id_persona: persona.id_persona,
            username,
            email,
            password_hash: password, // Se encripta en el hook beforeCreate
            rol
        });

        // Registrar en la tabla correspondiente según el rol
        if (rol === ROL.STUDENT) {
            try {
                await Estudiante.create({
                    id_estudiante: persona.id_persona,
                    carnet: carnet
                });
            } catch (error) {
                console.error(MESSAGE_ERROR.CREATE_STUDENT, error); // Agregar log para ver si falla aquí
                throw new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, MESSAGE_ERROR.CREATE_STUDENT);
            }
        } else if (rol === ROL.PROFESSOR) {
            try {
                await Profesor.create({
                    id_profesor: persona.id_persona,
                    especialidad
                });
            } catch (error) {
                console.error(MESSAGE_ERROR.CREATE_PROFESSOR, error); // Agregar log para ver si falla aquí
                throw new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, MESSAGE_ERROR.CREATE_PROFESSOR);
            }
        }


        sendResponse({
            res,
            statusCode: HttpStatus.CREATED,
            message: MESSAGE_SUCCESS.USER_REGISTERED,
            data: { user: usuario }
        });

    } catch (error) {
        if (error.name === 'SequelizeValidationError') {
            const validationErrors = error.errors.map(err => err.message);

            sendResponse({
                res,
                statusCode: HttpStatus.BAD_REQUEST,
                message: {
                    'Validation error': validationErrors,
                    error: error.stack,
                }
            });
            return;
        }

        sendResponse({
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











