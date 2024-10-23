const { MESSAGE_ERROR, HttpStatus, TABLE_FIELDS, MESSAGE_SUCCESS } = require("../constants/constants");
const { sendResponse, CustomError } = require("../handlers/responseHandler");
const { Profesor, Persona, Direccion } = require("../models");
const { getFullName } = require("../utils/helpers");


exports.mostrarProfesor = async (req, res) => {
    try {
        const profesor = await Profesor.findAll({
            include: [
                {
                    model: Persona,
                    attributes: [
                        TABLE_FIELDS.PRIMER_NOMBRE,
                        TABLE_FIELDS.SEGUNDO_NOMBRE,
                        TABLE_FIELDS.PRIMER_APELLIDO,
                        TABLE_FIELDS.SEGUNDO_APELLIDO,
                        TABLE_FIELDS.CEDULA,
                        TABLE_FIELDS.TELEFONO
                    ],
                    include: [
                        {
                            model: Direccion,
                            attributes: [
                                TABLE_FIELDS.DIRECCION_EXACTA,
                                TABLE_FIELDS.CANTON,
                                TABLE_FIELDS.DISTRITO,
                                TABLE_FIELDS.LOCALIDAD,
                                TABLE_FIELDS.PROVINCIA
                            ]
                        }
                    ]
                },
            ]
        });

        if (profesor.length == 0) {
 
            throw new CustomError(HttpStatus.NOT_FOUND, req.t('warning.NOT_PROFESORS_FOUND'));
        }

        const profesoresInfo = profesor.map(profesor => ({
            id: profesor.id_profesor,
            primer_nombre: profesor.Persona.primer_nombre,
            segundo_nombre: profesor.Persona.segundo_nombre,
            primer_apellido: profesor.Persona.primer_apellido,
            segundo_apellido: profesor.Persona.segundo_apellido,
            nombreCompleto: getFullName(profesor.Persona),
            especialidad: profesor.especialidad,
            fecha_inscripcion: profesor.fecha_inscripcion,
            cedula: profesor.Persona.cedula,
            telefono: profesor.Persona.telefono,
            direccion: profesor.Persona.Direccion ? {
                ...profesor.Persona.Direccion.toJSON()
            } : null,
        }));

        return sendResponse({
            res,
            statusCode: HttpStatus.OK,
            message: req.t('success.RECOVERED_PROFESORS'),
            data: profesoresInfo
        });
    } catch (error) {

        return sendResponse({
            res,
            statusCode: error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
            message: error?.message || {
                message: req.t('error.RECOVERED_PROFESORS'),
                error: error.message,
                stack: error.stack
            }
        });
    }
};