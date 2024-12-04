const { AuditLog, Estudiante, Persona, AsignacionDeCaso, Caso, Cliente, Contraparte, Subsidiario, Direccion, Usuario, sequelize, SolicitudConfirmacion } = require('../../models');
const { HttpStatus, TABLE_FIELDS, MESSAGE_ERROR, MESSAGE_SUCCESS, ROL, FIELDS, ACTION, STATES, DECISION, VALID_STATES } = require("../constants/constants");
const { sendResponse, CustomError } = require('../handlers/responseHandler');
const { validateUpdatesInputs, validateInput, getFullName, validateIfExists, validateIfUserExists, validateIfUserIsTeacher, checkStudentAssignments, findStudentByPk } = require('../utils/helpers');


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
                        TABLE_FIELDS.TELEFONO,
                        TABLE_FIELDS.TELEFONO_ADICIONAL
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
            estado: estudiante.estado,
            carnet: estudiante.carnet,
            cedula: estudiante.Persona.cedula,
            telefono: estudiante.Persona.telefono,
            telefono_adicional: estudiante.Persona.telefono_adicional,
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

exports.mostrarEstudiantesActivos = async (req, res) => {
    try {
        const estudiantesActivos = await Estudiante.findAll({
            where: { estado: STATES.ACTIVE },
            include: [
                {
                    model: Persona,
                    attributes: [
                        TABLE_FIELDS.PRIMER_NOMBRE,
                        TABLE_FIELDS.SEGUNDO_NOMBRE,
                        TABLE_FIELDS.PRIMER_APELLIDO,
                        TABLE_FIELDS.SEGUNDO_APELLIDO,
                        TABLE_FIELDS.CEDULA,
                        TABLE_FIELDS.TELEFONO,
                        TABLE_FIELDS.TELEFONO_ADICIONAL
                    ],
                    include: [
                        {
                            model: Direccion,
                        },
                        {
                            model: Usuario,
                        }
                    ],
                },
                {
                    model: AsignacionDeCaso
                }
            ]
        });

        if (estudiantesActivos.length == 0) {
            throw new CustomError(HttpStatus.NOT_FOUND, req.t('warning.NO_ACTIVE_STUDENTS_FOUND'));
        }
        console.log('estudiante.Persona.Usuario.email -->>>', estudiantesActivos[0].Persona.Usuario.email);

        const estudiantesActivosInfo = estudiantesActivos.map(estudiante => ({
            id_estudiante: estudiante.id_estudiante,
            nombre_completo: getFullName(estudiante.Persona),
            primer_nombre: estudiante.Persona.primer_nombre,
            segundo_nombre: estudiante.Persona.segundo_nombre || '',
            primer_apellido: estudiante.Persona.primer_apellido,
            segundo_apellido: estudiante.Persona.segundo_apellido,
            estado: estudiante.estado,
            carnet: estudiante.carnet,
            email: estudiante.Persona.Usuario.email,
            cedula: estudiante.Persona.cedula,
            telefono: estudiante.Persona.telefono,
            telefono_adicional: estudiante.Persona.telefono_adicional,
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
            message: req.t('success.RECOVERED_ACTIVE_STUDENTS'),
            data: estudiantesActivosInfo
        });
    } catch (error) {
        return sendResponse({
            res,
            statusCode: error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
            message: error?.message || {
                message: req.t('error.RECOVERED_ACTIVE_STUDENTS'),
                error: error.message,
                stack: error.stack
            }
        });
    }
};

exports.mostrarEstudiantesInactivos = async (req, res) => {
    try {
        const estudiantesInactivos = await Estudiante.findAll({
            where: { estado: STATES.INACTIVE },
            include: [
                {
                    model: Persona,
                    attributes: [
                        TABLE_FIELDS.PRIMER_NOMBRE,
                        TABLE_FIELDS.SEGUNDO_NOMBRE,
                        TABLE_FIELDS.PRIMER_APELLIDO,
                        TABLE_FIELDS.SEGUNDO_APELLIDO,
                        TABLE_FIELDS.CEDULA,
                        TABLE_FIELDS.TELEFONO,
                        TABLE_FIELDS.TELEFONO_ADICIONAL
                    ],
                    include: [
                        {
                            model: Direccion,
                        },
                        {
                            model: Usuario,
                        }
                    ]
                },
                {
                    model: AsignacionDeCaso
                }
            ]
        });

        if (estudiantesInactivos.length == 0) {
            throw new CustomError(HttpStatus.NOT_FOUND, req.t('warning.NO_INACTIVE_STUDENTS_FOUND'));
        }

        const estudiantesInactivosInfo = estudiantesInactivos.map(estudiante => ({
            id_estudiante: estudiante.id_estudiante,
            nombre_completo: getFullName(estudiante.Persona),
            primer_nombre: estudiante.Persona.primer_nombre,
            segundo_nombre: estudiante.Persona.segundo_nombre || '',
            primer_apellido: estudiante.Persona.primer_apellido,
            segundo_apellido: estudiante.Persona.segundo_apellido,
            estado: estudiante.estado,
            carnet: estudiante.carnet,
            email: estudiante.Persona.Usuario.email,
            cedula: estudiante.Persona.cedula,
            telefono: estudiante.Persona.telefono,
            telefono_adicional: estudiante.Persona.telefono_adicional,
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
            message: req.t('success.RECOVERED_INACTIVE_STUDENTS'),
            data: estudiantesInactivosInfo
        });
    } catch (error) {
        return sendResponse({
            res,
            statusCode: error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
            message: error?.message || {
                message: req.t('error.RECOVERED_INACTIVE_STUDENTS'),
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
                    as: 'Persona', // Alias explícito
                    attributes: [
                        TABLE_FIELDS.PRIMER_NOMBRE,
                        TABLE_FIELDS.SEGUNDO_NOMBRE,
                        TABLE_FIELDS.PRIMER_APELLIDO,
                        TABLE_FIELDS.SEGUNDO_APELLIDO,
                        TABLE_FIELDS.CEDULA,
                        TABLE_FIELDS.TELEFONO,
                        TABLE_FIELDS.TELEFONO_ADICIONAL,
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
                                        TABLE_FIELDS.TELEFONO,
                                        TABLE_FIELDS.TELEFONO_ADICIONAL
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
                                        TABLE_FIELDS.TELEFONO,
                                        TABLE_FIELDS.TELEFONO_ADICIONAL
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
            id_estudiante: estudiante.id_estudiante,
            nombre_completo: getFullName(estudiante.Persona),
            carnet: estudiante.carnet,
            cedula: estudiante.Persona.cedula,
            telefono: estudiante.Persona.telefono,
            telefono_adicional: estudiante.Persona.telefono_adicional,
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
                    telefono_adicional: caso.Cliente.Persona.telefono_adicional,
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
                    telefono_adicional: caso.Contraparte.Persona.telefono_adicional,
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
                    telefono_adicional: caso.Subsidiario.Persona.telefono_adicional,
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
        telefono,
        telefono_adicional,
        carnet,
        direccion
    } = req.body;
    const userId = req.session.user?.userId;
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
        validateInput(telefono, FIELDS.PHONE_NUMBER, req);
        validateInput(carnet, FIELDS.CARNET, req);
        telefono_adicional && validateInput(telefono_adicional, FIELDS.PHONE_NUMBER, req);

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
            telefono,
            telefono_adicional
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

        await AuditLog.create({
            user_id: userId,
            action: req.t('action.UPDATE_STUDENT'),
            description: req.t('description.UPDATE_STUDENT', { data: id_estudiante })
        }, { transaction });

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
                        TABLE_FIELDS.TELEFONO,
                        TABLE_FIELDS.TELEFONO_ADICIONAL
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
            id_estudiante,
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

exports.desactivarEstudiante = async (req, res) => {

    const { id_estudiante } = req.body;
    const userId = req.session.user?.userId;
    const transaction = await sequelize.transaction();

    try {
        const estudiante = await findStudentByPk(id_estudiante, req);
        await checkStudentAssignments(id_estudiante, transaction);
        await estudiante.update({ estado: STATES.INACTIVE }, { transaction });

        const estudianteInfo = {
            nombre_completo: getFullName(estudiante.Persona),
            carnet: estudiante.carnet,
            cedula: estudiante.Persona.cedula,
            telefono: estudiante.Persona.telefono,
            telefono_adicional: estudiante.Persona.telefono_adicional,
            estado: estudiante.estado,
        };

        await AuditLog.create({
            user_id: userId,
            action: req.t('action.DEACTIVATE_STUDENT'),
            description: req.t('description.DEACTIVATE_STUDENT', { data: id_estudiante })
        }, { transaction });

        await transaction.commit();

        return sendResponse({
            res,
            statusCode: HttpStatus.OK,
            message: req.t('success.REQUEST_DETAILS', { data: DECISION.ACCEPTED }),
            data: estudianteInfo
        });

    } catch (error) {

        await transaction.rollback();
        return sendResponse({
            res,
            statusCode: error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
            message: error?.message || {
                message: req.t('error.DEACTIVATING_STUDENT'),
                error: error.message,
                stack: error.stack
            }
        });
    }
};

exports.activarEstudiante = async (req, res) => {

    const { id_estudiante } = req.body;
    const userId = req.session.user?.userId;
    const transaction = await sequelize.transaction();

    try {
        const estudiante = await findStudentByPk(id_estudiante, req);
        await estudiante.update({ estado: STATES.ACTIVE }, { transaction });

        const estudianteInfo = {
            nombre_completo: getFullName(estudiante.Persona),
            carnet: estudiante.carnet,
            cedula: estudiante.Persona.cedula,
            telefono: estudiante.Persona.telefono,
            telefono_adicional: estudiante.Persona.telefono_adicional,
            estado: estudiante.estado,
        };

        await AuditLog.create({
            user_id: userId,
            action: req.t('action.ACTIVATE_STUDENT'),
            description: req.t('description.ACTIVATE_STUDENT', { data: id_estudiante })
        }, { transaction });

        await transaction.commit();

        return sendResponse({
            res,
            statusCode: HttpStatus.OK,
            message: req.t('success.STUDENT_ACTIVATED'),
            data: estudianteInfo
        });

    } catch (error) {

        await transaction.rollback();
        return sendResponse({
            res,
            statusCode: error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
            message: error?.message || {
                message: req.t('error.ACTIVATING_STUDENT'),
                error: error.message,
                stack: error.stack
            }
        });
    }
};

exports.actualizarCaso = async (req, res) => {

    const { id_caso, estado } = req.body;
    const transaction = await sequelize.transaction();

    try {
        const normalizarEstado = estado.toLowerCase().trim();

        // Buscar el caso y sus asignaciones
        const caso = await Caso.findByPk(id_caso, {
            include: [{
                model: AsignacionDeCaso,
                as: 'Asignaciones',
                where: {
                    id_estudiante: req.session.user.personaId,
                }
            }]
        }, { transaction });

        if (!caso) {
            throw new CustomError(
                HttpStatus.NOT_FOUND,
                req.t('warning.CASE_NOT_ASSIGNED_TO_STUDENT')
            );
        }

        if (!VALID_STATES.includes(normalizarEstado)) {
            throw new CustomError(
                HttpStatus.BAD_REQUEST,
                req.t('warning.INVALID_STATE')
            );
        }

        await caso.update({ estado }, { transaction });

        await AuditLog.create({
            user_id: req.session.user.userId,
            action: req.t('action.UPDATE_CASE'),
            description: req.t('description.UPDATE_CASE', { data: id_caso })
        }, { transaction });

        await transaction.commit();

        return sendResponse({
            res,
            statusCode: HttpStatus.OK,
            message: req.t('success.CASE_UPDATED'),
            data: {
                id_caso: caso.id_caso,
                estado: caso.estado,
            }
        });

    } catch (error) {

        await transaction.rollback();
        return sendResponse({
            res,
            statusCode: error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
            message: error?.message || {
                message: req.t('error.UPDATING_CASE'),
                error: error.message,
                stack: error.stack
            }
        });
    }



};