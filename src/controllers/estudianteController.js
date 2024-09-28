const { Estudiante, Persona, AsignacionDeCaso, Caso, Cliente, Contraparte, Direccion, Usuario } = require('../models');
const { HttpStatus, TABLE_FIELDS, MESSAGE_ERROR, MESSAGE_SUCCESS, ROL } = require("../constants/constants");
const { sendResponse, CustomError } = require('../handlers/responseHandler');
const getFullName = require('../utils/helpers');
const { validateUpdatesInputs } = require('./validations/validations');

exports.mostrarEstudiantes = async (req, res) => {
    try {
        const estudiantes = await Estudiante.findAll({
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
                {
                    model: AsignacionDeCaso
                }
            ]
        });

        if (estudiantes.length === 0) {
            throw new CustomError(HttpStatus.NOT_FOUND, MESSAGE_ERROR.STUDENT_NOT_FOUND);
          
        }

        const estudiantesInfo = estudiantes.map(estudiante => ({
            id: estudiante.id_estudiante,
            primer_nombre: estudiante.Persona.primer_nombre,
            segundo_nombre: estudiante.Persona.segundo_nombre,
            primer_apellido: estudiante.Persona.primer_apellido,
            segundo_apellido: estudiante.Persona.segundo_apellido,
            nombreCompleto: getFullName(estudiante.Persona),
            carnet: estudiante.carnet,
            cedula: estudiante.Persona.cedula,
            telefono: estudiante.Persona.telefono,
            direccion: estudiante.Persona.Direccion ? {
                ...estudiante.Persona.Direccion.toJSON()
            } : null,
            casosAsignados: estudiante.AsignacionDeCasos.length || 0
        }));

        sendResponse({
            res,
            statusCode: HttpStatus.OK,
            message: MESSAGE_SUCCESS.RECOVERED_STUDENTS,
            data: estudiantesInfo
        });
    } catch (error) {
        console.error(MESSAGE_ERROR.RE, error);

        sendResponse({
            res,
            statusCode: error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
            message: error?.message || {
                message: MESSAGE_ERROR.RECOVERED_STUDENTS,
                error: error.message,
                stack: error.stack
            }
        });
    }
};

exports.mostrarInformacionEstudianteConCasos = async (req, res) => {
    const { idEstudiante } = req.body;

    try {
        const estudiante = await Estudiante.findByPk(idEstudiante, {
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
                                    model: Persona,
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
                                    model: Persona,
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
                        ]
                    }
                }
            ]
        });

        if (!estudiante) {
            throw new CustomError(HttpStatus.NOT_FOUND, MESSAGE_ERROR.STUDENT_NOT_FOUND);
        }

        const estudianteInfo = {
            id: estudiante.id_estudiante,
            nombreCompleto: getFullName(estudiante.Persona),
            carnet: estudiante.carnet,
            cedula: estudiante.Persona.cedula,
            telefono: estudiante.Persona.telefono,
            casosAsignados: estudiante.AsignacionDeCasos.map(asignacion => ({
                ...asignacion.Caso.toJSON(),
            }))
        };
        sendResponse({ res, statusCode: HttpStatus.OK, message: MESSAGE_SUCCESS.STUDENT_INFO, data: estudianteInfo });
    } catch (error) {
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

exports.actualizarEstudiante = async (req, res) => {
    const {
        id_estudiante,
        primer_nombre,
        segundo_nombre,
        primer_apellido,
        segundo_apellido,
        cedula,
        telefono,
        carnet,
        direccion
    } = req.body;

    try {
        const estudiante = await Estudiante.findByPk(id_estudiante, {
            include: Persona
        });

        if (!estudiante) {
            throw new CustomError(HttpStatus.NOT_FOUND, MESSAGE_ERROR.STUDENT_NOT_FOUND);
        }

        // Verificar si la cédula ha cambiado
        const currentCedula = estudiante.Persona.cedula;
        await validateUpdatesInputs({
            currentValue: currentCedula,
            newValue: cedula,
            model: Persona,
            field: TABLE_FIELDS.CEDULA,
            message: MESSAGE_ERROR.ID_ALREADY_USED
        });

        // Verificar si el carnet ha cambiado
        const currentCarnet = estudiante.carnet;
        await validateUpdatesInputs({
            currentValue: currentCarnet,
            newValue: carnet,
            model: Estudiante,
            field: TABLE_FIELDS.CARNET,
            message: MESSAGE_ERROR.CARNE_ALREADY_USED
        });

        await estudiante.Persona.update({
            primer_nombre,
            segundo_nombre,
            primer_apellido,
            segundo_apellido,
            cedula,
            telefono
        });

        await estudiante.update({
            carnet
        });

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

        const estudianteInfo = {
            ...estudiante.toJSON(),
            direccion: direccion ? {
                ...direccion
            } : {}
        };

        sendResponse({
            res,
            statusCode: HttpStatus.OK,
            message: MESSAGE_SUCCESS.STUDENT_UPDATED,
            data: { estudianteInfo }
        });
    } catch (error) {
        sendResponse({
            res,
            statusCode: error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
            message: error?.message || MESSAGE_ERROR.UPDATE_STUDENT,
            error: error.stack
        });
    }
};

exports.eliminarEstudiante = async (req, res) => {
    const { id_estudiante } = req.body;

    try {
        // Buscar el estudiante y la persona asociada
        const estudiante = await Estudiante.findByPk(id_estudiante, {
            include: [
                {
                    model: Persona,
                    include: [Direccion, Usuario]
                },
                {
                    model: AsignacionDeCaso
                }
            ]
        });

        if (!estudiante) {
            throw new CustomError(HttpStatus.NOT_FOUND, MESSAGE_ERROR.STUDENT_NOT_FOUND);
        }
        // Buscar la persona asociada al estudiante
        const persona = estudiante.Persona;

        // Eliminar la persona (esto eliminará en cascada el estudiante, dirección, usuario, etc.)
        await persona.destroy();

        sendResponse({
            res,
            statusCode: HttpStatus.OK,
            message: MESSAGE_SUCCESS.STUDENT_DELETED,
            data: { estudiante }
        });
    } catch (error) {
        console.error(MESSAGE_ERROR.DELETE_STUDENT, error);
        sendResponse({
            res,
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: MESSAGE_ERROR.DELETE_STUDENT,
            error: error.message
        });
    }
};

