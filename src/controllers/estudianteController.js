// controllers/estudianteController.js
const { Estudiante, Persona, AsignacionDeCaso, Caso, Cliente, Contraparte } = require('../models');
const { HttpStatus, TABLE_FIELDS } = require("../constants/constants");
const { sendResponse } = require('../handlers/responseHandler');
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
            sendResponse({ res, statusCode: HttpStatus.NOT_FOUND, message: 'Student not found' });
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
                idCaso: asignacion.Caso.id_caso,
                expediente: asignacion.Caso.expediente,
                tipo_proceso: asignacion.Caso.tipo_proceso,
                ley_7600: asignacion.Caso.ley_7600,
                cuantia_proceso: asignacion.Caso.cuantia_proceso,
                aporte_comunidad: asignacion.Caso.aporte_comunidad,
                sintesis_hechos: asignacion.Caso.sintesis_hechos,
                fecha_creacion: asignacion.Caso.fecha_creacion,
                etapa_proceso: asignacion.Caso.etapa_proceso,
                evidencia: asignacion.Caso.evidencia,
                estado: asignacion.Caso.estado,
                cuantia_proceso: asignacion.Caso.cuantia_proceso,
                cliente: asignacion.Caso.Cliente ? {
                    nombreCompleto: obtenerNombreCompleto(asignacion.Caso.Cliente.Persona)
                } : null,
                contraparte: asignacion.Caso.Contraparte ? {
                    nombreCompleto: obtenerNombreCompleto(asignacion.Caso.Contraparte.Persona)
                } : null
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
