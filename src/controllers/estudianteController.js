// controllers/estudianteController.js
const { Estudiante, Persona, AsignacionDeCaso, Caso, Cliente, Contraparte, Direccion } = require('../models');
const { HttpStatus, TABLE_FIELDS } = require("../constants/constants");
const { sendResponse, CustomError} = require('../handlers/responseHandler');
const obtenerNombreCompleto = require('../utils/helpers');


exports.mostrarInformacionEstudiante = async (req, res) => {
    const { idEstudiante } = req.body;

    try {
        // Buscar el estudiante e incluir la información de Persona y los casos asignados
        const estudiante = await Estudiante.findByPk(idEstudiante, {
            include: [
                {
                    model: Persona, // Incluir la relación con Persona
                    attributes: [
                        TABLE_FIELDS.PRIMER_NOMBRE,
                        TABLE_FIELDS.SEGUNDO_NOMBRE,
                        TABLE_FIELDS.PRIMER_APELLIDO,
                        TABLE_FIELDS.SEGUNDO_APELLIDO,
                        TABLE_FIELDS.CEDULA,
                        TABLE_FIELDS.TELEFONO
                    ]
                },
                {
                    model: AsignacionDeCaso,
                    include: {
                        model: Caso,
                        include: [
                            {
                                model: Cliente,
                                include: {
                                    model: Persona, // Detalles del Cliente
                                    attributes: [
                                        TABLE_FIELDS.PRIMER_NOMBRE,
                                        TABLE_FIELDS.SEGUNDO_NOMBRE,
                                        TABLE_FIELDS.PRIMER_APELLIDO,
                                        TABLE_FIELDS.SEGUNDO_APELLIDO
                                    ]
                                }
                            },
                            {
                                model: Contraparte,
                                include: {
                                    model: Persona, // Detalles de la Contraparte
                                    attributes: [
                                        TABLE_FIELDS.PRIMER_NOMBRE,
                                        TABLE_FIELDS.SEGUNDO_NOMBRE,
                                        TABLE_FIELDS.PRIMER_APELLIDO,
                                        TABLE_FIELDS.SEGUNDO_APELLIDO
                                    ]

                                }
                            }
                        ],

                        attributes: [
                            TABLE_FIELDS.UID_CASO,
                            TABLE_FIELDS.EXPEDIENTE,
                            TABLE_FIELDS.LEY_7600,
                            TABLE_FIELDS.TIPO_PROCESO,
                            TABLE_FIELDS.CUANTIA_PROCESO,
                            TABLE_FIELDS.APORTE_CUMUNIDAD,
                            TABLE_FIELDS.SINTESIS_HECHOS,
                            TABLE_FIELDS.FECHA_CREACION,
                            TABLE_FIELDS.ETAPA_PROCESO,
                            TABLE_FIELDS.EVIDENCIA,
                            TABLE_FIELDS.ESTADO
                        ] // Detalles del caso

                    }
                }
            ]
        });

        if (!estudiante) {
            throw new CustomError(HttpStatus.NOT_FOUND,'Student not found');
            return
        }

        // Formatear la respuesta con la información del estudiante, casos y clientes
        const estudianteInfo = {
            id: estudiante.id_estudiante,
            nombreCompleto: obtenerNombreCompleto(estudiante.Persona),
            carnet: estudiante.carnet,
            cedula: estudiante.Persona.cedula,
            telefono: estudiante.Persona.telefono,
            casosAsignados: estudiante.AsignacionDeCasos.map(asignacion => ({

                ...asignacion.Caso.toJSON(),
            }))
        };
        sendResponse({ res, statusCode: HttpStatus.OK, message: 'Student information', data: estudianteInfo });
    } catch (error) {
        sendResponse({
            res,
            statusCode: error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
            message: error?.message || {
                message: 'Error retrieving student information',
                error: error.message,
                stack: error.stack
            }
        });

    }
};

exports.actualizarEstudiante = async (req, res) => {

    const { id_estudiante, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, cedula, telefono, carnet, direccion } = req.body;

    try {
        // Verificar si el estudiante existe
        const estudiante = await Estudiante.findByPk(id_estudiante, {
            include: Persona
        });

        if (!estudiante) {
            throw new CustomError(HttpStatus.NOT_FOUND, 'Student not found');
        }
        
        // Actualizar los datos de la persona asociada
        await estudiante.Persona.update({
            primer_nombre,
            segundo_nombre,
            primer_apellido,
            segundo_apellido,
            cedula,
            telefono
        });

        // Actualizar los datos del estudiante (carnet)
        await estudiante.update({
            carnet
        });

        // Actualizar la dirección si se proporciona
        if (direccion) {
            await Direccion.update({
                direccion_exacta: direccion.direccion_exacta,
                canton: direccion.canton,
                distrito: direccion.distrito,
                localidad: direccion.localidad,
                provincia: direccion.provincia,
            }, {
                where: { id_persona: estudiante.Persona.id_persona }
            });
        }
      
        // Obtener la información actualizada del estudiante
        const estudianteInfo = {
            ...estudiante.toJSON(),
            direccion: direccion ? {
             ...direccion
            } : {}
        };

        sendResponse({
            res,
            statusCode: HttpStatus.OK,
            message: 'Student updated successfully',
            data: { estudianteInfo }
        });
    } catch (error) {
        console.error('Error al actualizar el estudiante:', error);

        sendResponse({
            res,
            statusCode: error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
            message: error?.message || 'Error updating student',
            error: error.stack
        });
    }
};

