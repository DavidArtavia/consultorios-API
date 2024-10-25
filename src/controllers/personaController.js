const { MESSAGE_ERROR, MESSAGE_SUCCESS, HttpStatus, TABLE_FIELDS } = require("../constants/constants");
const { sendResponse, CustomError } = require("../handlers/responseHandler");
const { Persona, Usuario } = require("../../models");



exports.mostrarPersonasConUsuarios = async (req, res) => {
    try {
        // Consultar todas las personas y traer los usuarios asociados si existen
        const personas = await Persona.findAll({
            include: [
                {
                    model: Usuario,
                    required: false, // Permite incluir personas sin usuario asociado
                    attributes: [
                        TABLE_FIELDS.UID_USUARIO,
                        TABLE_FIELDS.USERNAME,
                        TABLE_FIELDS.EMAIL,
                        TABLE_FIELDS.ROL
                    ],
                }
            ]
        });

        // Verifica si se encontraron personas
        if (!personas || personas.length === 0) {

            throw new CustomError(HttpStatus.NOT_FOUND, req.t('warning.NOT_USERS_FOUND'));
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
            ...(persona.Usuario && {
                usuario: {
                    id_usuario: persona.Usuario.id_usuario,
                    username: persona.Usuario.username,
                    email: persona.Usuario.email,
                    rol: persona.Usuario.rol
                }
            })
        }));

        // Retorna la respuesta

        return sendResponse({
            res,
            statusCode: HttpStatus.OK,
            message: req.t('success.USERS_FOUND'),
            data: resultado
        });


    } catch (error) {
        return sendResponse({
            res,
            statusCode: error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
            message: error?.message || {
                message: req.t('error.RETRIEVING_USERS'),
                error: error.message,
                stack: error.stack
            }
        });
    }
};