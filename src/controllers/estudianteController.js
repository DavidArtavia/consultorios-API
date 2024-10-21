const { Estudiante, Persona, AsignacionDeCaso, Caso, Cliente, Contraparte, Direccion, Usuario, sequelize, SolicitudConfirmacion, Profesor } = require('../models');
const { HttpStatus, TABLE_FIELDS, MESSAGE_ERROR, MESSAGE_SUCCESS, ROL, FIELDS, ACTION, STATES } = require("../constants/constants");
const { sendResponse, CustomError } = require('../handlers/responseHandler');
const { validateUpdatesInputs, validateInput, getFullName, validateIfExists, validateIfUserExists, validateIfUserIsTeacher } = require('../utils/helpers');


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

        if (estudiantes.length == 0) {
            throw new CustomError(HttpStatus.NOT_FOUND, MESSAGE_ERROR.STUDENT_NOT_FOUND);
        }

        const estudiantesInfo = estudiantes.map(estudiante => ({
            id_estudiante: estudiante.id_estudiante,
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

        return sendResponse({
            res,
            statusCode: HttpStatus.OK,
            message: MESSAGE_SUCCESS.RECOVERED_STUDENTS,
            data: estudiantesInfo
        });
    } catch (error) {
        console.error(MESSAGE_ERROR.RE, error);

        return sendResponse({
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
        return sendResponse({
            res,
            statusCode: HttpStatus.OK,
            message: MESSAGE_SUCCESS.STUDENT_INFO,
            data: estudianteInfo
        });
    } catch (error) {
        return sendResponse({
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
    const transaction = await sequelize.transaction(); // Inicia la transacción

    try {
        const estudiante = await Estudiante.findByPk(id_estudiante, {
            include: Persona
        });

        if (!estudiante) {
            throw new CustomError(HttpStatus.NOT_FOUND, MESSAGE_ERROR.STUDENT_NOT_FOUND);
        }
        validateInput(primer_nombre, FIELDS.TEXT);
        segundo_nombre && validateInput(segundo_nombre, FIELDS.TEXT);
        validateInput(primer_apellido, FIELDS.TEXT);
        validateInput(segundo_apellido, FIELDS.TEXT);
        validateInput(cedula, FIELDS.ID);
        validateInput(telefono, FIELDS.PHONE_NUMBER);
        validateInput(carnet, FIELDS.CARNET);
        
        await validateUpdatesInputs({
            currentValue: estudiante.Persona.cedula,
            newValue: cedula,
            model: Persona,
            field: TABLE_FIELDS.CEDULA,
            message: MESSAGE_ERROR.ID_ALREADY_USED
        });

        await validateUpdatesInputs({
            currentValue: estudiante.carnet,
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
        }, { transaction });

        await estudiante.update({
            carnet
        }, { transaction });

        if (direccion) {
            await Direccion.update({
                direccion_exacta: direccion.direccion_exacta,
                canton: direccion.canton,
                distrito: direccion.distrito,
                localidad: direccion.localidad,
                provincia: direccion.provincia,
            },
                {
                    where: { id_persona: estudiante.Persona.id_persona }
                },
                { transaction });
        }

        const estudianteInfo = {
            ...estudiante.toJSON(),
            direccion: direccion ? {
                ...direccion
            } : {}
        };

        await transaction.commit();

        return sendResponse({
            res,
            statusCode: HttpStatus.OK,
            message: MESSAGE_SUCCESS.STUDENT_UPDATED,
            data: { estudianteInfo }
        });
    } catch (error) {
        await transaction.rollback();

        return sendResponse({
            res,
            statusCode: error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
            message: error?.message || MESSAGE_ERROR.UPDATE_STUDENT,
            error: error.stack
        });
    }
};

exports.solicitarEliminarEstudiante = async (req, res) => {
    const { id_estudiante } = req.body;
    const personaId = req.session.user.personaId;
    const userRole = req.session.user.userRole;
    const transaction = await sequelize.transaction(); // Inicia la transacción

    try {

        // Verificar que el profesor existe
        validateIfUserIsTeacher(userRole);

        // Buscar el estudiante
        const estudiante = await Estudiante.findByPk(id_estudiante, {
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

        // Verificar si ya existe una solicitud pendiente para eliminar este estudiante
        const solicitudExistente = await SolicitudConfirmacion.findOne({
            where: {
                id_estudiante: id_estudiante,
                accion: ACTION.DELETE,
                estado: STATES.PENDING
            }
        });

        if (solicitudExistente) {
            throw new CustomError(HttpStatus.BAD_REQUEST, MESSAGE_ERROR.REQUEST_PENDING);
        }

        // Crear una solicitud de confirmación
        const solicitud = await SolicitudConfirmacion.create({
            id_estudiante: id_estudiante,
            accion: ACTION.DELETE,
            detalles: `Solicitud para eliminar al estudiante ${getFullName(estudiante.Persona)} con ID: ${estudiante.Persona.cedula}`,
            estado: STATES.PENDING,
            createdBy: personaId, // ID del profesor que hizo la solicitud
        }, { transaction });

        await transaction.commit();

        return sendResponse({
            res,
            statusCode: HttpStatus.OK,
            message: MESSAGE_SUCCESS.REQUEST_CREATED,
            data: solicitud
        });
    } catch (error) {
        console.error(MESSAGE_ERROR.DELETE_STUDENT, error);
        await transaction.rollback();
        return sendResponse({
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

// exports.eliminarEstudiante = async (req, res) => {
//     const { id_estudiante } = req.body;

//     try {
//         // Buscar el estudiante y la persona asociada
//         const estudiante = await Estudiante.findByPk(id_estudiante, {
//             include: [
//                 {
//                     model: Persona,
//                     include: [Direccion, Usuario]
//                 },
//                 {
//                     model: AsignacionDeCaso
//                 }
//             ]
//         });


//         if (!estudiante) {
//             throw new CustomError(HttpStatus.NOT_FOUND, MESSAGE_ERROR.STUDENT_NOT_FOUND);
//         }
//         // Buscar la persona asociada al estudiante
//         const persona = estudiante.Persona;

//         await persona.destroy();

//         return sendResponse({
//             res,
//             statusCode: HttpStatus.OK,
//             message: MESSAGE_SUCCESS.STUDENT_DELETED,
//             data: { estudiante }
//         });
//     } catch (error) {
//         console.error(MESSAGE_ERROR.DELETE_STUDENT, error);
//         return sendResponse({
//             res,
//             statusCode: error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
//             message: error?.message || {
//                 message: MESSAGE_ERROR.RECOVERED_PROFESORS,
//                 error: error.message,
//                 stack: error.stack
//             }
//         });
//     }
// };

