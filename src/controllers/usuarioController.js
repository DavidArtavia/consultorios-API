
const { Usuario, Persona, Direccion, Estudiante, Profesor, Sequelize } = require('../models');
const bcrypt = require('bcryptjs');
const { validateLoginInput} = require('./validations/validations');
const { HttpStatus, ROL } = require('../constants/constants');
const { sendResponse, CustomError } = require('../handlers/responseHandler');

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
            throw new CustomError(HttpStatus.BAD_REQUEST, 'Email does not exist');
            return;
        }

        // Verificar la contraseña
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            throw new CustomError(HttpStatus.BAD_REQUEST, 'Invalid password');
            return;
        }

        // Crear la sesión del usuario
        req.session.userId = user.id_usuario;
        req.session.userRole = user.rol;

        // Responder al cliente

        return sendResponse({
            res,
            statusCode: HttpStatus.OK,
            message: 'Successful login',
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
            message: error?.message || 'Fatal error during login',
        });
    }
};

// Logout
exports.logout = (req, res) => {


    try {
        if (!req.session) {
            throw new CustomError(HttpStatus.FORBIDDEN, 'No active session')

        }

        req.session.destroy((err) => {
            if (err) {
                throw new CustomError(HttpStatus.BAD_REQUEST, 'Error destroying session')
            }

            // Clear the cookie
            res.clearCookie('connect.sid', { path: '/' });

            // Respond to the client
            sendResponse({ res, statusCode: HttpStatus.OK, message: "Logout successful" });
        });

    } catch (error) {
        sendResponse({
            res,
            statusCode: error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
            message: error?.message || "Fatal error during logout"
        });
    }
};


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
                'You do not have the necessary permissions to create a user with the same role as yours'
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
                throw new CustomError(HttpStatus.BAD_REQUEST, 'The email is already in use.');
            }
            if (existingUser.username === username) {
                throw new CustomError(HttpStatus.BAD_REQUEST, 'The username is already in use.');
            }
        }

        // Verificar si ya existe la cédula registrada
        if (existingPerson && existingPerson.cedula === cedula) {
            throw new CustomError(HttpStatus.BAD_REQUEST, 'The cedula is already in use.');
        }

        // Verificar si ya existe el carnet registrado (solo para estudiantes)
        if (existingCarnet && existingCarnet.carnet === carnet) {
            throw new CustomError(HttpStatus.BAD_REQUEST, 'The carnet is already in use.');
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
                console.error('Error creating student record:', error); // Agregar log para ver si falla aquí
                throw new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, 'Error creating student record');
            }
        } else if (rol === ROL.PROFESSOR) {
            try {
                await Profesor.create({
                    id_profesor: persona.id_persona,
                    especialidad
                });
            } catch (error) {
                console.error('Error creating professor record:', error); // Agregar log para ver si falla aquí
                throw new CustomError(HttpStatus.INTERNAL_SERVER_ERROR, 'Error creating professor record');
            }
        }


        sendResponse({
            res,
            statusCode: HttpStatus.CREATED,
            message: 'User registered successfully',
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
                message: 'Error registering user',
                error: error.message,
                stack: error.stack
            }
        });
    }
};











