const { Estudiante, Persona, AsignacionDeCaso, Caso, Cliente, Contraparte, Subsidiario, Direccion, Usuario, sequelize, SolicitudConfirmacion, Profesor } = require('../../models');
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
                                TABLE_FIELDS.PROVINCIA,
                                TABLE_FIELDS.CREATED_AT,
                                TABLE_FIELDS.UPDATED_AT
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
            throw new CustomError(HttpStatus.NOT_FOUND, req.t('warning.STUDENT_NOT_FOUND'));
        }

        const estudiantesInfo = estudiantes.map(estudiante => ({
            id_estudiante: estudiante.id_estudiante,
            nombre_completo: getFullName(estudiante.Persona),
            primer_nombre: estudiante.Persona.primer_nombre,
            segundo_nombre: estudiante.Persona.segundo_nombre || '',
            primer_apellido: estudiante.Persona.primer_apellido,
            segundo_apellido: estudiante.Persona.segundo_apellido,
            carnet: estudiante.carnet,
            cedula: estudiante.Persona.cedula,
            telefono: estudiante.Persona.telefono,
            createdAt: estudiante.createdAt,
            updatedAt: estudiante.updatedAt,
            direccion: estudiante.Persona.Direccion && {
                ...estudiante.Persona.Direccion.toJSON()
            },
            casosAsignados: estudiante.AsignacionDeCasos.length || 0
        }));

        return sendResponse({
            res,
            statusCode: HttpStatus.OK,
            message: req.t('success.RECOVERED_STUDENTS'),
            data: estudiantesInfo
        });
    } catch (error) {

        return sendResponse({
            res,
            statusCode: error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
            message: error?.message || {
                message: req.t('error.RECOVERED_STUDENTS'),
                error: error.message,
                stack: error.stack
            }
        });
    }
};

// exports.mostrarInformacionEstudianteConCasos = async (req, res) => {
//     const { idEstudiante } = req.body;

//     try {
//         const estudiante = await Estudiante.findByPk(idEstudiante, {
//             include: [
//                 {
//                     model: Persona,
//                     attributes: [
//                         TABLE_FIELDS.PRIMER_NOMBRE,
//                         TABLE_FIELDS.SEGUNDO_NOMBRE,
//                         TABLE_FIELDS.PRIMER_APELLIDO,
//                         TABLE_FIELDS.SEGUNDO_APELLIDO,
//                         TABLE_FIELDS.CEDULA,
//                         TABLE_FIELDS.TELEFONO,
//                         TABLE_FIELDS.CREATED_AT,
//                         TABLE_FIELDS.UPDATED_AT
//                     ]
//                 },
//                 {
//                     model: AsignacionDeCaso,
//                     include: {
//                         model: Caso,
//                         include: [
//                             {
//                                 model: Cliente,
//                                 include: {
//                                     model: Persona,
//                                     attributes: [
//                                         TABLE_FIELDS.PRIMER_NOMBRE,
//                                         TABLE_FIELDS.SEGUNDO_NOMBRE,
//                                         TABLE_FIELDS.PRIMER_APELLIDO,
//                                         TABLE_FIELDS.SEGUNDO_APELLIDO,
//                                         TABLE_FIELDS.CEDULA,
//                                         TABLE_FIELDS.TELEFONO
//                                     ],
//                                     include: [{
//                                         model: Direccion,
//                                     }]
//                                 }
//                             },
//                             {
//                                 model: Contraparte,
//                                 include: [
//                                     {
//                                         model: Persona,
//                                         attributes: { exclude: [TABLE_FIELDS.UID_PERSONA] },
//                                         include: [{
//                                             model: Direccion,

//                                         }]
//                                     }
//                                 ]
//                             },
//                             {
//                                 model: Subsidiario,
//                                 include: {
//                                     model: Persona,
//                                     attributes: [
//                                         TABLE_FIELDS.PRIMER_NOMBRE,
//                                         TABLE_FIELDS.SEGUNDO_NOMBRE,
//                                         TABLE_FIELDS.PRIMER_APELLIDO,
//                                         TABLE_FIELDS.SEGUNDO_APELLIDO,
//                                         TABLE_FIELDS.CEDULA,
//                                         TABLE_FIELDS.TELEFONO
//                                     ],
//                                     include: [{
//                                         model: Direccion,
//                                     }]
//                                 }
//                             }
//                         ],
//                         attributes: [
//                             TABLE_FIELDS.UID_CASO,
//                             TABLE_FIELDS.EXPEDIENTE,
//                             TABLE_FIELDS.LEY_7600,
//                             TABLE_FIELDS.TIPO_PROCESO,
//                             TABLE_FIELDS.CUANTIA_PROCESO,
//                             TABLE_FIELDS.APORTE_CUMUNIDAD,
//                             TABLE_FIELDS.SINTESIS_HECHOS,
//                             TABLE_FIELDS.ETAPA_PROCESO,
//                             TABLE_FIELDS.EVIDENCIA,
//                             TABLE_FIELDS.ESTADO,
//                             TABLE_FIELDS.CREATED_AT,
//                             TABLE_FIELDS.UPDATED_AT
//                         ]
//                     }
//                 }
//             ],
//             // logging: console.log
//         });

//         if (!estudiante) {
//             throw new CustomError(HttpStatus.NOT_FOUND, req.t('warning.STUDENT_NOT_FOUND'));
//         }

//         const estudianteInfo = {
//             id: estudiante.id_estudiante,
//             nombre_completo: getFullName(estudiante.Persona),
//             carnet: estudiante.carnet,
//             cedula: estudiante.Persona.cedula,
//             telefono: estudiante.Persona.telefono,
//             createdAt: estudiante.createdAt,
//             updatedAt: estudiante.updatedAt,
//             casosAsignados: estudiante.AsignacionDeCasos.map(asignacion => {

//                 const caso = asignacion.Caso.toJSON();

//                 console.log("cliente: ", caso.Cliente.Persona.Direccion);

//                 // Construir el objeto `Cliente` con el campo `nombreCompleto`
//                 const cliente = caso.Cliente && {
//                     id_cliente: caso.Cliente.id_cliente,
//                     nombre_completo: getFullName(caso.Cliente.Persona),
//                     cedula: caso.Cliente.Persona.cedula,
//                     telefono: caso.Cliente.Persona.telefono,
//                     sexo: caso.Cliente.sexo,
//                     ingreso_economico: caso.Cliente.ingreso_economico,
//                     createdAt: caso.Cliente.createdAt,
//                     updatedAt: caso.Cliente.updatedAt,
//                     direccion_exacta: caso.Cliente.Persona.Direccion.direccion_exac,
//                     canton: caso.Cliente.Persona.Direccion.canton,
//                     distrito: caso.Cliente.Persona.Direccion.distrito,
//                     localidad: caso.Cliente.Persona.Direccion.localidad,
//                     provincia: caso.Cliente.Persona.Direccion.provincia,

//                 };
//                 console.log("contraparte ",caso.Contraparte.Persona.Direccion);


//                 // Construir el objeto `Contraparte` con el campo `nombreCompleto`
//                 const contraparte = caso.Contraparte && {
//                     id_contraparte: caso.Contraparte.id_contraparte,
//                     nombre_completo: getFullName(caso.Contraparte.Persona),
//                     cedula: caso.Contraparte.Persona.cedula,
//                     telefono: caso.Contraparte.Persona.telefono,
//                     sexo: caso.Contraparte.sexo,
//                     detalles: caso.Contraparte.detalles,
//                     createdAt: caso.Contraparte.createdAt,
//                     updatedAt: caso.Contraparte.updatedAt,
//                     direccion_exacta: caso.Contraparte.Persona.Direccion.direccion_exac,
//                     canton: caso.Contraparte.Persona.Direccion.canton,
//                     distrito: caso.Contraparte.Persona.Direccion.distrito,
//                     localidad: caso.Contraparte.Persona.Direccion.localidad,
//                     provincia: caso.Contraparte.Persona.Direccion.provincia

//                 };

//                 console?.log("subsidiario",caso.Subsidiario ?  caso.Subsidiario.Persona.Direccion : null);


//                 const subsidiario = caso.Subsidiario ? {
//                     id_contraparte: caso.Subsidiario.id_contraparte,
//                     nombre_completo: getFullName(caso.Subsidiario.Persona),
//                     cedula: caso.Subsidiario.Persona.cedula,
//                     telefono: caso.Subsidiario.Persona.telefono,
//                     sexo: caso.Subsidiario.sexo,
//                     detalles: caso.Subsidiario.detalles,
//                     createdAt: caso.Subsidiario.createdAt,
//                     updatedAt: caso.Subsidiario.updatedAt,
//                     direccion_exacta: caso.Subsidiario.Persona.Direccion.direccion_exac,
//                     canton: caso.Subsidiario.Persona.Direccion.canton,
//                     distrito: caso.Subsidiario.Persona.Direccion.distrito,
//                     localidad: caso.Subsidiario.Persona.Direccion.localidad,
//                     provincia: caso.Subsidiario.Persona.Direccion.provincia
//                 } : null;

//                 // Retornar el caso con Cliente y Contraparte estructurados
//                 return {
//                     ...caso,
//                     Cliente: cliente,
//                     Contraparte: contraparte,
//                     Subsidiario: subsidiario
//                 };
//             })
//         };

//         return sendResponse({
//             res,
//             statusCode: HttpStatus.OK,
//             message: req.t('success.STUDENT_INFO'),
//             data: estudianteInfo
//         });
//     } catch (error) {
//         console.error(MESSAGE_ERROR.RETRIEVING_STUDENT_INFO, error, error.stack);
//         return sendResponse({
//             res,
//             statusCode: error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
//             message: error?.message || {
//                 message: req.t('error.RETRIEVING', { data: req.t('person.STUDENTS') }),
//                 error: error.message,
//                 stack: error.stack
//             }
//         });
//     }
// };

exports.mostrarInformacionEstudianteConCasos = async (req, res) => {
    const { idEstudiante } = req.body;

    try {
        const estudiante = await Estudiante.findByPk(idEstudiante, {
            include: [
                {
                    model: Persona,
                    as: 'Persona', // Alias explícito
                    attributes: [
                        TABLE_FIELDS.PRIMER_NOMBRE,
                        TABLE_FIELDS.SEGUNDO_NOMBRE,
                        TABLE_FIELDS.PRIMER_APELLIDO,
                        TABLE_FIELDS.SEGUNDO_APELLIDO,
                        TABLE_FIELDS.CEDULA,
                        TABLE_FIELDS.TELEFONO,
                        TABLE_FIELDS.CREATED_AT,
                        TABLE_FIELDS.UPDATED_AT
                    ]
                },
                {
                    model: AsignacionDeCaso,
                    as: 'AsignacionDeCasos', // Alias explícito
                    include: {
                        model: Caso,
                        as: 'Caso', // Alias explícito
                        include: [
                            {
                                model: Cliente,
                                as: 'Cliente', // Alias explícito
                                include: {
                                    model: Persona,
                                    as: 'Persona', // Alias explícito
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
                                            as: 'Direccion', // Alias explícito
                                           
                                        }
                                    ]
                                }
                            },
                            {
                                model: Contraparte,
                                as: 'Contraparte', // Alias explícito
                                include: [
                                    {
                                        model: Persona,
                                        as: 'Persona', // Alias explícito
                                        attributes: { exclude: [TABLE_FIELDS.UID_PERSONA] },
                                        include: [
                                            {
                                                model: Direccion,
                                                as: 'Direccion', // Alias explícito
                                               
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                model: Subsidiario,
                                as: 'Subsidiario', // Alias explícito
                                include: {
                                    model: Persona,
                                    as: 'Persona', // Alias explícito
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
                                            as: 'Direccion', // Alias explícito
                                            
                                        }
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
                            TABLE_FIELDS.ESTADO,
                            TABLE_FIELDS.CREATED_AT,
                            TABLE_FIELDS.UPDATED_AT
                        ]
                    }
                }
            ],
            // logging: console.log
        });

        if (!estudiante) {
            throw new CustomError(HttpStatus.NOT_FOUND, req.t('warning.STUDENT_NOT_FOUND'));
        }

        const estudianteInfo = {
            id: estudiante.id_estudiante,
            nombre_completo: getFullName(estudiante.Persona),
            carnet: estudiante.carnet,
            cedula: estudiante.Persona.cedula,
            telefono: estudiante.Persona.telefono,
            createdAt: estudiante.createdAt,
            updatedAt: estudiante.updatedAt,
            casosAsignados: estudiante.AsignacionDeCasos.map(asignacion => {
                const caso = asignacion.Caso.toJSON();
                // Construir el objeto `Cliente` con el campo `nombreCompleto`
                const cliente = caso.Cliente && caso.Cliente.Persona && {
                    id_cliente: caso.Cliente.id_cliente,
                    nombre_completo: getFullName(caso.Cliente.Persona),
                    cedula: caso.Cliente.Persona.cedula,
                    telefono: caso.Cliente.Persona.telefono,
                    sexo: caso.Cliente.sexo,
                    ingreso_economico: caso.Cliente.ingreso_economico,
                    createdAt: caso.Cliente.createdAt,
                    updatedAt: caso.Cliente.updatedAt,
                    direccion_exacta: caso.Cliente.Persona.Direccion?.direccion_exac,
                    canton: caso.Cliente.Persona.Direccion?.canton,
                    distrito: caso.Cliente.Persona.Direccion?.distrito,
                    localidad: caso.Cliente.Persona.Direccion?.localidad,
                    provincia: caso.Cliente.Persona.Direccion?.provincia,
                };

                // Construir el objeto `Contraparte` con el campo `nombreCompleto`
                const contraparte = caso.Contraparte && caso.Contraparte.Persona && {
                    id_contraparte: caso.Contraparte.id_contraparte,
                    nombre_completo: getFullName(caso.Contraparte.Persona),
                    cedula: caso.Contraparte.Persona.cedula,
                    telefono: caso.Contraparte.Persona.telefono,
                    sexo: caso.Contraparte.sexo,
                    detalles: caso.Contraparte.detalles,
                    createdAt: caso.Contraparte.createdAt,
                    updatedAt: caso.Contraparte.updatedAt,
                    direccion_exacta: caso.Contraparte.Persona.Direccion?.direccion_,
                    canton: caso.Contraparte.Persona.Direccion?.canton,
                    distrito: caso.Contraparte.Persona.Direccion?.distrito,
                    localidad: caso.Contraparte.Persona.Direccion?.localidad,
                    provincia: caso.Contraparte.Persona.Direccion?.provincia,
                };

                // Construir el objeto `Subsidiario` con el campo `nombreCompleto`
                const subsidiario = caso.Subsidiario && caso.Subsidiario.Persona && {
                    id_subsidiario: caso.Subsidiario.id_subsidiario,
                    nombre_completo: getFullName(caso.Subsidiario.Persona),
                    cedula: caso.Subsidiario.Persona.cedula,
                    telefono: caso.Subsidiario.Persona.telefono,
                    sexo: caso.Subsidiario.sexo,
                    detalles: caso.Subsidiario.detalles,
                    createdAt: caso.Subsidiario.createdAt,
                    updatedAt: caso.Subsidiario.updatedAt,
                    direccion_exacta: caso.Subsidiario.Persona.Direccion?.direccion_,
                    canton: caso.Subsidiario.Persona.Direccion?.canton,
                    distrito: caso.Subsidiario.Persona.Direccion?.distrito,
                    localidad: caso.Subsidiario.Persona.Direccion?.localidad,
                    provincia: caso.Subsidiario.Persona.Direccion?.provincia,
                };

                // Retornar el caso con Cliente, Contraparte y Subsidiario estructurados
                return {
                    ...caso,
                    Cliente: cliente,
                    Contraparte: contraparte,
                    Subsidiario: subsidiario
                };
            })
        };

        return sendResponse({
            res,
            statusCode: HttpStatus.OK,
            message: req.t('success.STUDENT_INFO'),
            data: estudianteInfo
        });
    } catch (error) {
        console.error(MESSAGE_ERROR.RETRIEVING_STUDENT_INFO, error, error.stack);
        return sendResponse({
            res,
            statusCode: error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
            message: error?.message || {
                message: req.t('error.RETRIEVING', { data: req.t('person.STUDENTS') }),
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
            throw new CustomError(HttpStatus.NOT_FOUND, req.t('warning.STUDENT_NOT_FOUND'));
        }
        validateInput(primer_nombre, FIELDS.TEXT, req);
        segundo_nombre && validateInput(segundo_nombre, FIELDS.TEXT, req);
        validateInput(primer_apellido, FIELDS.TEXT, req);
        validateInput(segundo_apellido, FIELDS.TEXT, req);
        validateInput(cedula, FIELDS.ID, req);
        validateInput(telefono, FIELDS.PHONE_NUMBER, req);
        validateInput(carnet, FIELDS.CARNET, req);

        await validateUpdatesInputs({
            currentValue: estudiante.Persona.cedula,
            newValue: cedula,
            model: Persona,
            field: TABLE_FIELDS.CEDULA,
            message: req.t('warning.CEDULA_ALREADY_USED')
        });

        await validateUpdatesInputs({
            currentValue: estudiante.carnet,
            newValue: carnet,
            model: Estudiante,
            field: TABLE_FIELDS.CARNET,
            message: req.t('warning.CARNET_ALREADY_USED')
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

        await registerAuditLog(
            req.user.id_usuario,
            'update',
            'estudiante',
            id_estudiante,
            'Estudiante actualizado'
        );

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
            message: req.t('success.STUDENT_UPDATED'),
            data: { estudianteInfo }
        });
    } catch (error) {
        await transaction.rollback();

        return sendResponse({
            res,
            statusCode: error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
            message: error?.message || req.t('error.UPDATE_STUDENT'),
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
        validateIfUserIsTeacher(userRole, req);

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
            throw new CustomError(HttpStatus.NOT_FOUND, req.t('warning.STUDENT_NOT_FOUND'));
        }

        // Verificar si ya existe una solicitud pendiente para eliminar este estudiante
        const solicitudExistente = await SolicitudConfirmacion.findOne({
            where: {
                id_estudiante,
                accion: ACTION.DELETE,
                estado: STATES.PENDING
            }
        });

        if (solicitudExistente) {
            throw new CustomError(HttpStatus.BAD_REQUEST, req.t('warning.REQUEST_PENDING'));
        }

        // Crear una solicitud de confirmación
        const solicitud = await SolicitudConfirmacion.create({
            id_estudiante: id_estudiante,
            accion: ACTION.DELETE,
            detalles: req.t('request.DELETE_STUDENT',
                {
                    fullName: getFullName(estudiante.Persona),
                    ID: estudiante.Persona.cedula
                }
            ),
            estado: STATES.PENDING,
            createdBy: personaId,
        }, { transaction });

        await transaction.commit();

        return sendResponse({
            res,
            statusCode: HttpStatus.OK,
            message: req.t('success.REQUEST_CREATED'),
            data: solicitud
        });
    } catch (error) {
        await transaction.rollback();
        return sendResponse({
            res,
            statusCode: error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
            message: error?.message || {
                message: req.t('error.RECOVERED_STUDENTS'),
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

