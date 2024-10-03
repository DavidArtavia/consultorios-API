const { MESSAGE_ERROR, MESSAGE_SUCCESS, HttpStatus } = require("../constants/constants");
const { sendResponse, CustomError } = require("../handlers/responseHandler");
const { Persona, Usuario } = require("../models");



exports.mostrarPersonasConUsuarios = async (req, res) => {
    try {
        // Consultar todas las personas y traer los usuarios asociados si existen
        const personas = await Persona.findAll({
            include: [
                {
                    model: Usuario,
                    required: false, // Permite incluir personas sin usuario asociado
                    attributes: ['id_usuario', 'username', 'email', 'rol'], // Selecciona los atributos que deseas mostrar del usuario
                }
            ]
        });

        // Verifica si se encontraron personas
        if (!personas || personas.length === 0) {

            throw new CustomError(HttpStatus.NOT_FOUND, MESSAGE_ERROR.NOT_PERSONS_FOUND);
        }

        // Estructura la respuesta para incluir las personas con o sin usuario
        const resultado = personas.map(persona => ({
            id_persona: persona.id_persona,
            primer_nombre: persona.primer_nombre,
            segundo_nombre: persona.segundo_nombre,
            primer_apellido: persona.primer_apellido,
            segundo_apellido: persona.segundo_apellido,
            cedula: persona.cedula,
            telefono: persona.telefono,
            usuario: persona.Usuario ? {
                id_usuario: persona.Usuario.id_usuario,
                username: persona.Usuario.username,
                email: persona.Usuario.email,
                rol: persona.Usuario.rol
            } : null // Si no tiene usuario, se muestra como null
        }));

        // Retorna la respuesta

        sendResponse({
            res,
            statusCode: HttpStatus.OK,
            message: MESSAGE_SUCCESS.PERSONS_FOUND,
            data: resultado
        });
       

    } catch (error) {
        console.error("Error al mostrar personas y usuarios:", error);

        sendResponse({
            res,
            statusCode: error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
            message: error?.message || {
                message: MESSAGE_ERROR.RETRIEVING,
                error: error.message,
                stack: error.stack
            }
        });
    }
};