// controllers/usuarioController.js
const Usuario = require('../models/usuario');
const Persona = require('../models/persona');
const Direccion = require('../models/direccion');
const Estudiante = require('../models/estudiante'); // Asegúrate de definir este modelo
const Profesor = require('../models/profesor'); // Asegúrate de definir este modelo
const bcrypt = require('bcryptjs');
const { validateLoginInput, validateRegisterInput, validateIfExists } = require('./validations/validations');
const { Sequelize } = require('sequelize');

// Login a user and create a session
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // verifica que los campos no esten vacios
        const validationErrors = validateLoginInput(email, password);
        if (validationErrors.length > 0) {
            return res.status(400).json({ ok: false, message: validationErrors.join(', '), data: [] });
        }

        // Buscar al usuario por email
        const user = await Usuario.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ ok: false, message: 'Email does not exist', data: [] })
        }

        // Verificar la contraseña
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            return res.status(400).json({ ok: false, message: 'Invalid password', data: [] });
        }

        // Crear la sesión del usuario
        req.session.userId = user.id_usuario;
        req.session.userRole = user.rol;

        // Responder al cliente
        return res.status(200).json({
            ok: true,
            message: 'Successful login',
            data: [
                {
                    user: {
                        id_usuario: user.id_usuario,
                        id_persona: user.id_persona,
                        username: user.username,
                        password_hash: user.password_hash,//eliminar luego 
                        email: user.email,
                        rol: user.rol
                    }
                }
            ]
        });


    } catch (error) {
        res.status(500).json({ ok: false, message: 'Error logging in.', error });
    }
};

// Logout
exports.logout = (req, res) => {
    // Destroy the user's session
    console.log('Sesión destruida:', req.session);
    
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Error logging out' });
        }
        res.clearCookie('connect.sid');
        res.status(200).json({ message: 'Logout successful' });
    });
};


// Register a new user
exports.register = async (req, res) => {
    const {
        primerNombre,
        segundoNombre,
        primerApellido,
        segundoApellido,
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

    console.log('Datos recibidos:', req.body);

    try {
        // Validar datos y verificar que el usuario o correo no existan
        const existingUser = await Usuario.findOne({
            where: {
                [Sequelize.Op.or]: [{ email }, { username }]
            }
        });
        validateIfExists(existingUser);

        // Crear un nuevo registro en la tabla Persona
        const persona = await Persona.create({
            primerNombre,
            segundoNombre,
            primerApellido,
            segundoApellido,
            cedula,
            telefono,
        });

        // Crear la dirección si se proporciona
        if (direccion) {
            await Direccion.create({
                id_persona: persona.id_persona,
                direccionExacta: direccion.direccionExacta,
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
        if (rol === 'estudiante') {
            await Estudiante.create({
                id_estudiante: persona.id_persona,
                carnet: carnet
            });
        } else if (rol === 'profesor') {
            await Profesor.create({
                id_profesor: persona.id_persona,
                especialidad: especialidad // Asigna especialidad u otros campos según el caso
            });
        }

        res.status(201).json({ message: 'User registered successfully', user: usuario });
    } catch (error) {
        console.error('Error al registrar usuario:', error); // Registrar el error en la consola
        if (error.name === 'SequelizeValidationError') {
            // Obtener los mensajes de error de validación
            const validationErrors = error.errors.map(err => err.message);
            return res.status(400).json({ message: 'Validation error', errors: validationErrors });
        }
        res.status(500).json({ message: 'Error registering user', error: error.message, stack: error.stack });
    }
};











