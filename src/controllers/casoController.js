// controllers/casoController.js
const { t } = require('i18next');
const { HttpStatus, MESSAGE_SUCCESS, MESSAGE_ERROR, TABLE_FIELDS, FIELDS, STATES } = require('../constants/constants');
const { CustomError, sendResponse } = require('../handlers/responseHandler');
const { AsignacionDeCaso, Estudiante, Caso, Persona, Direccion, Contraparte, AuditLog, Cliente, Subsidiario, sequelize } = require('../../models');
const { validateIfExists, validateInput, validateUniqueCedulas, getFullName, updateRelatedEntity, updatePersonAndAddress } = require('../utils/helpers');
const { Op } = require('sequelize');


exports.crearCaso = async (req, res) => {
    const {
        subsidiario,
        cliente,
        contraparte,
        casoData
    } = req.body;
    const transaction = await sequelize.transaction(); // Inicia la transacción

    try {
        // Validar que las cédulas no se repitan
        validateUniqueCedulas(
            cliente.cedula,
            contraparte.cedula,
            subsidiario?.cedula,
            req
        );

        // Verificar si ya existe un expediente
        casoData.expediente && await validateIfExists({
            model: Caso,
            field: TABLE_FIELDS.EXPEDIENTE,
            value: casoData.expediente,
            errorMessage: req.t('warning.CASE_ALREADY_REGISTERED', { data: casoData.expediente }),
        });

        // Validar los campos de entrada
        validateInput(cliente.primer_nombre, FIELDS.TEXT, req);
        validateInput(cliente.primer_apellido, FIELDS.TEXT, req);
        validateInput(cliente.segundo_apellido, FIELDS.TEXT, req);
        validateInput(cliente.cedula, FIELDS.ID, req);
        validateInput(cliente.telefono, FIELDS.PHONE_NUMBER, req);
        validateInput(cliente.ingreso_economico, FIELDS.NUMERIC, req);
        validateInput(cliente.sexo, FIELDS.CHAR, req);
        cliente.segundo_nombre && validateInput(cliente.segundo_nombre, FIELDS.TEXTBOX, req);
        cliente.telefono_adicional && validateInput(cliente.telefono_adicional, FIELDS.PHONE_NUMBER, req);

        validateInput(contraparte.primer_nombre, FIELDS.TEXT, req);
        validateInput(contraparte.primer_apellido, FIELDS.TEXT, req);
        validateInput(contraparte.segundo_apellido, FIELDS.TEXT, req);
        validateInput(contraparte.cedula, FIELDS.ID, req);
        validateInput(contraparte.telefono, FIELDS.PHONE_NUMBER, req);
        validateInput(contraparte.sexo, FIELDS.CHAR, req);
        contraparte.detalles && validateInput(contraparte.detalles, FIELDS.TEXTBOX, req);
        contraparte.segundo_nombre && validateInput(contraparte.segundo_nombre, FIELDS.TEXTBOX, req);
        contraparte.telefono_adicional && validateInput(contraparte.telefono_adicional, FIELDS.PHONE_NUMBER, req);

        validateInput(casoData.cuantia_proceso, FIELDS.NUMERIC, req);
        validateInput(casoData.aporte_comunidad, FIELDS.NUMERIC, req);
        casoData.expediente && validateInput(casoData.expediente, FIELDS.EXPEDIENTE, req);
        validateInput(casoData.tipo_proceso, FIELDS.TEXT, req);
        validateInput(casoData.etapa_proceso, FIELDS.TEXT, req);
        validateInput(casoData.sintesis_hechos, FIELDS.TEXTBOX, req);
        casoData.expediente && validateInput(casoData.expediente, FIELDS.EXPEDIENTE, req);


        // Validar si la cédula del cliente ya está registrada
        await validateIfExists({
            model: Persona,
            field: TABLE_FIELDS.CEDULA,
            value: cliente.cedula,
            errorMessage: req.t(
                'warning.PERSON_ALREADY_REGISTERED',
                { person: req.t('person.CLIENT') },
                { data: cliente.cedula }
            )
        }, { transaction });

        // Crear el cliente
        const clientePersona = await Persona.create({
            primer_nombre: cliente.primer_nombre,
            segundo_nombre: cliente.segundo_nombre,
            primer_apellido: cliente.primer_apellido,
            segundo_apellido: cliente.segundo_apellido,
            cedula: cliente.cedula,
            telefono: cliente.telefono,
        }, { transaction });

        await Direccion.create({
            id_persona: clientePersona.id_persona,
            direccion_exacta: cliente.direccion.direccion_exacta,
            canton: cliente.direccion.canton,
            distrito: cliente.direccion.distrito,
            localidad: cliente.direccion.localidad,
            provincia: cliente.direccion.provincia,
        }, { transaction });

        const nuevoCliente = await Cliente.create({
            id_cliente: clientePersona.id_persona,
            sexo: cliente.sexo,
            ingreso_economico: cliente.ingreso_economico,
        }, { transaction });

        // Validar si la cédula de la contraparte ya está registrada
        await validateIfExists({
            model: Persona,
            field: TABLE_FIELDS.CEDULA,
            value: contraparte.cedula,
            errorMessage: req.t(
                'warning.PERSON_ALREADY_REGISTERED',
                { person: req.t('person.COUNTERPART') },
                { data: contraparte.cedula }
            )
        }, { transaction });

        // Crear la contraparte
        const contrapartePersona = await Persona.create({
            primer_nombre: contraparte.primer_nombre,
            segundo_nombre: contraparte.segundo_nombre,
            primer_apellido: contraparte.primer_apellido,
            segundo_apellido: contraparte.segundo_apellido,
            cedula: contraparte.cedula,
            telefono: contraparte.telefono,
        }, { transaction });

        await Direccion.create({
            id_persona: contrapartePersona.id_persona,
            direccion_exacta: contraparte.direccion.direccionExacta,
            canton: contraparte.direccion.canton,
            distrito: contraparte.direccion.distrito,
            localidad: contraparte.direccion.localidad,
            provincia: contraparte.direccion.provincia,
        }, { transaction });

        const nuevaContraparte = await Contraparte.create({
            id_contraparte: contrapartePersona.id_persona,
            sexo: contraparte.sexo,
            detalles: contraparte.detalles
        }, { transaction });

        let nuevoSubsidiario = null;
        if (subsidiario) {
            // Validar si la cédula del subsidiario ya está registrada
            await validateIfExists({
                model: Persona,
                field: TABLE_FIELDS.CEDULA,
                value: subsidiario.cedula,
                errorMessage: req.t(
                    'warning.PERSON_ALREADY_REGISTERED',
                    { person: req.t('person.SUBSIDIARY') },
                    { data: subsidiario.cedula }
                )
            }, { transaction });

            // Validar los campos del subsidiario
            validateInput(subsidiario.primer_nombre, FIELDS.TEXT, req);
            validateInput(subsidiario.segundo_nombre, FIELDS.TEXT, req);
            validateInput(subsidiario.primer_apellido, FIELDS.TEXT, req);
            validateInput(subsidiario.segundo_apellido, FIELDS.TEXT, req);
            validateInput(subsidiario.cedula, FIELDS.ID, req);
            validateInput(subsidiario.telefono, FIELDS.PHONE_NUMBER, req);
            validateInput(subsidiario.sexo, FIELDS.CHAR, req);
            subsidiario.detalles && validateInput(subsidiario.detalles, FIELDS.TEXTBOX, req);
            subsidiario.segundo_nombre && validateInput(subsidiario.segundo_nombre, FIELDS.TEXTBOX, req);
            subsidiario.telefono_adicional && validateInput(subsidiario.telefono_adicional, FIELDS.PHONE_NUMBER, req);

            // Crear el subsidiario si está presente
            const subsidiarioPersona = await Persona.create({
                primer_nombre: subsidiario.primer_nombre,
                segundo_nombre: subsidiario.segundo_nombre,
                primer_apellido: subsidiario.primer_apellido,
                segundo_apellido: subsidiario.segundo_apellido,
                cedula: subsidiario.cedula,
                telefono: subsidiario.telefono,
            }, { transaction });

            await Direccion.create({
                id_persona: subsidiarioPersona.id_persona,
                direccion_exacta: subsidiario.direccion.direccionExacta,
                canton: subsidiario.direccion.canton,
                distrito: subsidiario.direccion.distrito,
                localidad: subsidiario.direccion.localidad,
                provincia: subsidiario.direccion.provincia,
            }, { transaction });

            nuevoSubsidiario = await Subsidiario.create({
                id_subsidiario: subsidiarioPersona.id_persona,
                sexo: subsidiario.sexo,
                detalles: subsidiario.detalles
            }, { transaction });
        }

        // Crear el caso
        const nuevoCaso = await Caso.create({
            ...casoData,
            id_cliente: nuevoCliente.id_cliente,
            cliente: {
                id_cliente: nuevoCliente.id_cliente,
                nombre_completo: getFullName(clientePersona),
                cedula: clientePersona.cedula,
            },
            id_contraparte: nuevaContraparte.id_contraparte,
            id_subsidiario: nuevoSubsidiario ? nuevoSubsidiario.id_subsidiario : null,
        }, { transaction });

        // Confirmar la transacción
        await transaction.commit();

        return sendResponse({
            res,
            statusCode: HttpStatus.OK,
            message: req.t('success.CASE_CREATED'),
            data: nuevoCaso
        });

    } catch (error) {
        // Deshacer la transacción en caso de error
        await transaction.rollback();

        return sendResponse({
            res,
            statusCode: error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
            message: error?.message || {
                message: req.t('error.CREATING_CASE'),
                error: error.message,
                stack: error.stack
            }
        });
    }
};

exports.asignarCasoAEstudiante = async (req, res) => {
    const { id_estudiante, id_caso } = req.body;
    const transaction = await sequelize.transaction(); // Inicia la transacción
    const userId = req.session.user?.userId;
    try {
        // Verificar si el estudiante y el caso existen
        const estudiante = await Estudiante.findByPk(id_estudiante);
        const caso = await Caso.findByPk(id_caso);

        if (!estudiante) {

            throw new CustomError(HttpStatus.NOT_FOUND, req.t('warning.STUDENT_NOT_FOUND'));
        }
        if (!caso) {

            throw new CustomError(HttpStatus.NOT_FOUND, req.t('warning.CASE_NOT_FOUND'));
        }
        if (estudiante.estado !== STATES.ACTIVE) {

            throw new CustomError(HttpStatus.BAD_REQUEST, req.t('warning.INACTIVE_STUDENT'));

        }

        // Verificar si el caso ya está asignado a algún estudiante
        const asignacionExistente = await AsignacionDeCaso.findOne({
            where: { id_caso }
        });

        if (asignacionExistente) {

            throw new CustomError(HttpStatus.BAD_REQUEST, req.t('warning.CASE_ALREADY_ASSIGNED'));
        }

        // Crear la asignación
        const nuevaAsignacion = await AsignacionDeCaso.create({
            id_caso,
            id_estudiante,
        }, { transaction });

        await Caso.update({
            estado: STATES.ASSIGNED
        }, {
            where: { id_caso }
        }, { transaction });

        await AuditLog.create({
            user_id: userId,
            action: req.t('action.ASSIGN_CASE'),
            description: req.t('description.ASSIGN_CASE', { data: id_caso, data: id_estudiante }),
        }, { transaction });

        await transaction.commit();

        return sendResponse({
            res,
            statusCode: HttpStatus.CREATED,
            message: req.t('success.CASE_ASSIGNED'),
            data: nuevaAsignacion
        });
    } catch (error) {

        await transaction.rollback();
        return sendResponse({
            res,
            statusCode: error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
            message: error?.message || {
                message: req.t('error.ASSIGNING_CASE'),
                error: error.message,
                stack: error.stack
            }
        });

    }
};

exports.desasignarCasoDeEstudiante = async (req, res) => {
    const { id_estudiante, id_caso } = req.body;
    const transaction = await sequelize.transaction();
    const userId = req.session.user?.userId;
    try {
        // Verificar si el estudiante y el caso existen
        const estudiante = await Estudiante.findByPk(id_estudiante);
        const caso = await Caso.findByPk(id_caso);

        if (!estudiante) {
            throw new CustomError(HttpStatus.NOT_FOUND, req.t('warning.STUDENT_NOT_FOUND'));
        }
        if (!caso) {
            throw new CustomError(HttpStatus.NOT_FOUND, req.t('warning.CASE_NOT_FOUND'));
        }

        // Verificar si existe la asignación del caso al estudiante
        const asignacionExistente = await AsignacionDeCaso.findOne({
            where: {
                id_caso,
                id_estudiante
            }
        });

        if (!asignacionExistente) {
            throw new CustomError(HttpStatus.BAD_REQUEST, req.t('warning.NO_CASE_ASSIGNED'));
        }

        // Eliminar la asignación del caso al estudiante
        await asignacionExistente.destroy({ transaction });

        // Actualizar el estado del caso a activo nuevamente
        await caso.update({
            estado: STATES.ACTIVE
        }, { transaction });

        await AuditLog.create({
            user_id: userId,
            action: req.t('action.UNASSIGN_CASE'),
            description: req.t('description.UNASSIGN_CASE', { data: id_caso, data: id_estudiante }),
        }, { transaction });

        await transaction.commit();

        return sendResponse({
            res,
            statusCode: HttpStatus.CREATED,
            message: req.t('success.CASE_UNASSIGNED'),
            data: { id_caso: id_caso, id_estudiante: id_estudiante }
        });
    } catch (error) {
        await transaction.rollback();
        return sendResponse({
            res,
            statusCode: error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
            message: error?.message || {
                message: req.t('error.UNASSIGNING_CASE'),
                error: error.message,
                stack: error.stack
            }
        });
    }
};


exports.mostrarCasosNoAsignados = async (req, res) => {
    try {
        // Consultar todos los casos que no estén asignados a ningún estudiante
        const casosNoAsignados = await Caso.findAll({
            include: [
                {
                    model: AsignacionDeCaso,
                    as: 'Asignaciones',
                    required: false, // Esto incluye los casos sin asignación
                },
                {
                    model: Cliente,
                    include: [
                        {
                            model: Persona,
                            attributes: { exclude: [TABLE_FIELDS.UID_PERSONA] },
                            include: [{
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
                            }]

                        }
                    ]
                },
                {
                    model: Subsidiario,
                    include: [
                        {
                            model: Persona,
                            attributes: { exclude: [TABLE_FIELDS.UID_PERSONA] },
                            include: [{
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
                            }]
                        }
                    ]
                },
                {
                    model: Contraparte,
                    include: [
                        {
                            model: Persona,
                            attributes: { exclude: [TABLE_FIELDS.UID_PERSONA] },
                            include: [{
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
                            }]
                        }
                    ]
                }
            ],
            where: {
                '$Asignaciones.id_asignacion$': null
            }
        });

        if (!casosNoAsignados || casosNoAsignados.length === 0) {
            return sendResponse({
                res,
                statusCode: HttpStatus.OK,
                message: req.t('warning.NO_UNASSIGNED_CASES'),
                data: []
            });
        }

        const resultado = casosNoAsignados.map(caso => {

            const cliente = caso.Cliente && {
                id_cliente: caso.Cliente.id_cliente,
                nombre_completo: getFullName(caso.Cliente.Persona),
                primer_nombre: caso.Cliente.Persona.primer_nombre,
                segundo_nombre: caso.Cliente.Persona.segundo_nombre || '',
                primer_apellido: caso.Cliente.Persona.primer_apellido,
                segundo_apellido: caso.Cliente.Persona.segundo_apellido,
                sexo: caso.Cliente.sexo,
                ingreso_economico: caso.Cliente.ingreso_economico,
                cedula: caso.Cliente.Persona.cedula,
                telefono: caso.Cliente.Persona.telefono,
                telefono_adicional: caso.Cliente.Persona.telefono_adicional,
                createdAt: caso.Cliente.Persona.createdAt,
                updatedAt: caso.Cliente.Persona.updatedAt,
                dirreccion_exacta: caso.Cliente.Persona.Direccion.direccion_exacta,
                canton: caso.Cliente.Persona.Direccion.canton,
                distrito: caso.Cliente.Persona.Direccion.distrito,
                localidad: caso.Cliente.Persona.Direccion.localidad,
                provincia: caso.Cliente.Persona.Direccion.provincia

            };

            const contraparte = caso.Contraparte && {
                id_contraparte: caso.Contraparte.id_contraparte,
                nombre_completo: getFullName(caso.Contraparte.Persona),
                primer_nombre: caso.Contraparte.Persona.primer_nombre,
                segundo_nombre: caso.Contraparte.Persona.segundo_nombre || '',
                primer_apellido: caso.Contraparte.Persona.primer_apellido,
                segundo_apellido: caso.Contraparte.Persona.segundo_apellido,
                sexo: caso.Contraparte.sexo,
                detalles: caso.Contraparte.detalles,
                cedula: caso.Contraparte.Persona.cedula,
                telefono: caso.Contraparte.Persona.telefono,
                telefono_adicional: caso.Contraparte.Persona.telefono_adicional,
                createdAt: caso.Contraparte.Persona.createdAt,
                updatedAt: caso.Contraparte.Persona.updatedAt,
                dirreccion_exacta: caso.Contraparte.Persona.Direccion.direccion_exacta,
                canton: caso.Contraparte.Persona.Direccion.canton,
                distrito: caso.Contraparte.Persona.Direccion.distrito,
                localidad: caso.Contraparte.Persona.Direccion.localidad,
                provincia: caso.Contraparte.Persona.Direccion.provincia

            };

            const subsidiarios = caso.Subsidiario && {
                id_subsidiario: caso.Subsidiario.id_subsidiario,
                nombre_completo: getFullName(caso.Subsidiario.Persona),
                primer_nombre: caso.Subsidiario.Persona.primer_nombre,
                segundo_nombre: caso.Subsidiario.Persona.segundo_nombre || '',
                primer_apellido: caso.Subsidiario.Persona.primer_apellido,
                segundo_apellido: caso.Subsidiario.Persona.segundo_apellido,
                sexo: caso.Subsidiario.sexo,
                detalles: caso.Subsidiario.detalles,
                cedula: caso.Subsidiario.Persona.cedula,
                telefono: caso.Subsidiario.Persona.telefono,
                telefono_adicional: caso.Subsidiario.Persona.telefono_adicional,
                createdAt: caso.Subsidiario.Persona.createdAt,
                updatedAt: caso.Subsidiario.Persona.updatedAt,
                dirreccion_exacta: caso.Subsidiario.Persona.Direccion.direccion_exacta,
                canton: caso.Subsidiario.Persona.Direccion.canton,
                distrito: caso.Subsidiario.Persona.Direccion.distrito,
                localidad: caso.Subsidiario.Persona.Direccion.localidad,
                provincia: caso.Subsidiario.Persona.Direccion.provincia

            };

            return {
                id_caso: caso.id_caso,
                expediente: caso.expediente,
                ley_7600: caso.ley_7600,
                tipo_proceso: caso.tipo_proceso,
                cuantia_proceso: caso.cuantia_proceso,
                aporte_comunidad: caso.aporte_comunidad,
                sintesis_hechos: caso.sintesis_hechos,
                etapa_proceso: caso.etapa_proceso,
                evidencia: caso.evidencia,
                estado: caso.estado,
                createdAt: caso.createdAt,
                updatedAt: caso.updatedAt,
                Cliente: cliente,
                Contraparte: contraparte,
                Subsidiario: subsidiarios,
                Asignaciones: caso.Asignaciones
            };
        });

        // Retornar la respuesta con los casos no asignados
        return sendResponse({
            res,
            statusCode: HttpStatus.OK,
            message: req.t('success.UNASSIGNED_CASES'),
            data: resultado
        });

    } catch (error) {
        console.error(MESSAGE_ERROR.UNASSIGNED_CASES, error);
        return sendResponse({
            res,
            statusCode: error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
            message: error?.message || {
                message: req.t('error.UNASSIGNED_CASES'),
                error: error.message,
                stack: error.stack
            }
        });
    }
};

exports.mostrarCasosAsignados = async (req, res) => {
    try {
        const casosAsignados = await Caso.findAll({
            include: [
                {
                    model: AsignacionDeCaso,
                    as: 'Asignaciones',
                    where: {
                        id_asignacion: {
                            [Op.ne]: null // Esto filtra solo los casos con id_asignacion no nulo
                        }
                    },
                    include: [
                        {
                            model: Estudiante,
                            include: [{
                                model: Persona,
                                include: [{
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
                                }]
                            }]
                        }
                    ]
                },
                {
                    model: Cliente,
                    include: [{
                        model: Persona,
                        include: [{
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
                        }]
                    }]
                },
                {
                    model: Subsidiario,
                    include: [{
                        model: Persona,
                        include: [{
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
                        }]
                    }]
                },
                {
                    model: Contraparte,
                    include: [{
                        model: Persona,
                        include: [{
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
                        }]
                    }]
                }
            ]
        });

        if (!casosAsignados || casosAsignados.length === 0) {
            return sendResponse({
                res,
                statusCode: HttpStatus.OK,
                message: req.t('warning.NO_ASSIGNED_CASES'),
                data: []
            });
        }
        // Mapear los casos asignados
        const resultado = casosAsignados.map(caso => {
            // Construir Cliente, Contraparte y Subsidiario con nombre_completo
            const cliente = caso.Cliente && {
                id_cliente: caso.Cliente.id_cliente,
                nombre_completo: getFullName(caso.Cliente.Persona),
                primer_nombre: caso.Cliente.Persona.primer_nombre,
                segundo_nombre: caso.Cliente.Persona.segundo_nombre || '',
                primer_apellido: caso.Cliente.Persona.primer_apellido,
                segundo_apellido: caso.Cliente.Persona.segundo_apellido,
                cedula: caso.Cliente.Persona.cedula,
                sexo: caso.Cliente.sexo,
                ingreso_economico: caso.Cliente.ingreso_economico,
                telefono: caso.Cliente.Persona.telefono,
                telefono_adicional: caso.Cliente.Persona.telefono_adicional,
                createdAt: caso.Cliente.Persona.createdAt,
                updatedAt: caso.Cliente.Persona.updatedAt,
                direccion_exacta: caso.Cliente.Persona.Direccion.direccion_exacta,
                canton: caso.Cliente.Persona.Direccion.canton,
                distrito: caso.Cliente.Persona.Direccion.distrito,
                localidad: caso.Cliente.Persona.Direccion.localidad,
                provincia: caso.Cliente.Persona.Direccion.provincia

            };

            const contraparte = caso.Contraparte && {
                id_contraparte: caso.Contraparte.id_contraparte,
                nombre_completo: getFullName(caso.Contraparte.Persona),
                primer_nombre: caso.Contraparte.Persona.primer_nombre,
                segundo_nombre: caso.Contraparte.Persona.segundo_nombre || '',
                primer_apellido: caso.Contraparte.Persona.primer_apellido,
                segundo_apellido: caso.Contraparte.Persona.segundo_apellido,
                cedula: caso.Contraparte.Persona.cedula,
                sexo: caso.Contraparte.sexo,
                detalles: caso.Contraparte.detalles,
                telefono: caso.Contraparte.Persona.telefono,
                telefono_adicional: caso.Contraparte.Persona.telefono_adicional,
                createdAt: caso.Contraparte.Persona.createdAt,
                updatedAt: caso.Contraparte.Persona.updatedAt,
                direccion_exacta: caso.Contraparte.Persona.Direccion.direccion_exacta,
                canton: caso.Contraparte.Persona.Direccion.canton,
                distrito: caso.Contraparte.Persona.Direccion.distrito,
                localidad: caso.Contraparte.Persona.Direccion.localidad,
                provincia: caso.Contraparte.Persona.Direccion.provincia
            };

            const subsidiario = caso.Subsidiario && {
                id_subsidiario: caso.Subsidiario.id_subsidiario,
                nombre_completo: getFullName(caso.Subsidiario.Persona),
                primer_nombre: caso.Subsidiario.Persona.primer_nombre,
                segundo_nombre: caso.Subsidiario.Persona.segundo_nombre || '',
                primer_apellido: caso.Subsidiario.Persona.primer_apellido,
                segundo_apellido: caso.Subsidiario.Persona.segundo_apellido,
                cedula: caso.Subsidiario.Persona.cedula,
                sexo: caso.Subsidiario.sexo,
                detalles: caso.Subsidiario.detalles,
                telefono: caso.Subsidiario.Persona.telefono,
                telefono_adicional: caso.Subsidiario.Persona.telefono_adicional,
                createdAt: caso.Subsidiario.Persona.createdAt,
                updatedAt: caso.Subsidiario.Persona.updatedAt,
                direccion_exacta: caso.Subsidiario.Persona.Direccion.direccion_exacta,
                canton: caso.Subsidiario.Persona.Direccion.canton,
                distrito: caso.Subsidiario.Persona.Direccion.distrito,
                localidad: caso.Subsidiario.Persona.Direccion.localidad,
                provincia: caso.Subsidiario.Persona.Direccion.provincia

            };

            // Construir asignaciones con estudiante y nombre_completo
            const asignaciones = caso.Asignaciones.map(asignacion => ({
                id_asignacion: asignacion.id_asignacion,
                Estudiante: asignacion.Estudiante && {
                    id_estudiante: asignacion.Estudiante.id_estudiante,
                    nombre_completo: getFullName(asignacion.Estudiante.Persona),
                    carnet: asignacion.Estudiante.carnet,
                    cedula: asignacion.Estudiante.Persona.cedula,
                    telefono: asignacion.Estudiante.Persona.telefono,
                    telefono_adicional: asignacion.Estudiante.Persona.telefono_adicional,
                    createdAt: asignacion.Estudiante.Persona.createdAt,
                    updatedAt: asignacion.Estudiante.Persona.updatedAt,
                    direccion_exacta: asignacion.Estudiante.Persona.Direccion.direccion_exacta,
                    canton: asignacion.Estudiante.Persona.Direccion.canton,
                    distrito: asignacion.Estudiante.Persona.Direccion.distrito,
                    localidad: asignacion.Estudiante.Persona.Direccion.localidad,
                    provincia: asignacion.Estudiante.Persona.Direccion.provincia

                }
            }));

            // Estructura del caso
            return {
                id_caso: caso.id_caso,
                expediente: caso.expediente,
                ley_7600: caso.ley_7600,
                tipo_proceso: caso.tipo_proceso,
                cuantia_proceso: caso.cuantia_proceso,
                aporte_comunidad: caso.aporte_comunidad,
                sintesis_hechos: caso.sintesis_hechos,
                etapa_proceso: caso.etapa_proceso,
                evidencia: caso.evidencia,
                estado: caso.estado,
                createdAt: caso.createdAt,
                updatedAt: caso.updatedAt,
                Asignaciones: asignaciones,
                Cliente: cliente,
                Contraparte: contraparte,
                Subsidiario: subsidiario,
            };
        });

        // Retornar la respuesta con los casos no asignados
        return sendResponse({
            res,
            statusCode: HttpStatus.OK,
            message: req.t('success.ASSIGNED_CASES'),
            data: resultado
        });

    } catch (error) {
        return sendResponse({
            res,
            statusCode: error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
            message: error?.message || {
                message: req.t('error.ASSIGNED_CASES'),
                error: error.message,
                stack: error.stack
            }
        });
    }
};

exports.actualizarCaso = async (req, res) => {
    const {
        id_caso,
        expediente,
        ley_7600,
        tipo_proceso,
        cuantia_proceso,
        aporte_comunidad,
        sintesis_hechos,
        etapa_proceso,
        estado,
        cliente,
        contraparte,
        subsidiario
    } = req.body;

    const transaction = await sequelize.transaction(); // Crear una transacción para asegurar atomicidad
    const userId = req.session.user.userId; // ID del usuario que realiza la acción

    try {
        // Encontrar y actualizar el caso
        const caso = await Caso.findByPk(id_caso, { transaction });
        if (!caso) {
            throw new CustomError(HttpStatus.NOT_FOUND, req.t('warning.CASE_NOT_FOUND'));
        }
        validateInput(expediente, FIELDS.EXPEDIENTE, req);
        validateInput(tipo_proceso, FIELDS.TEXT, req);
        validateInput(cuantia_proceso, FIELDS.NUMERIC, req);
        validateInput(aporte_comunidad, FIELDS.NUMERIC, req);
        validateInput(sintesis_hechos, FIELDS.TEXTBOX, req);
        validateInput(etapa_proceso, FIELDS.TEXT, req);
        validateInput(estado, FIELDS.TEXT, req);

        await caso.update(
            {
                expediente,
                ley_7600,
                tipo_proceso,
                cuantia_proceso,
                aporte_comunidad,
                sintesis_hechos,
                etapa_proceso,
                estado,
            },
            { transaction }
        );
        const id_cliente = caso?.id_cliente;
        const id_contraparte = caso?.id_contraparte;
        const id_subsidiario = caso?.id_subsidiario;


        if (
            (cliente?.cedula && contraparte?.cedula) ||
            (cliente?.cedula && subsidiario?.cedula) ||
            (contraparte?.cedula && subsidiario?.cedula)
        ) {
            validateUniqueCedulas(
                cliente?.cedula,
                contraparte?.cedula,
                subsidiario?.cedula,
                req
            );
        }
        // Actualizar datos relacionados si se proporcionan
        if (cliente) {

            validateInput(cliente.primer_nombre, FIELDS.TEXT, req);
            validateInput(cliente.primer_apellido, FIELDS.TEXT, req);
            validateInput(cliente.segundo_apellido, FIELDS.TEXT, req);
            validateInput(cliente.cedula, FIELDS.ID, req);
            validateInput(cliente.Persona.telefono, FIELDS.PHONE_NUMBER, req);
            validateInput(cliente.ingreso_economico, FIELDS.NUMERIC, req);
            validateInput(cliente.sexo, FIELDS.CHAR, req);
            cliente.Persona.telefono_adicional && validateInput(cliente.Persona.telefono_adicional, FIELDS.PHONE_NUMBER, req);
            cliente.segundo_nombre && validateInput(cliente.segundo_nombre, FIELDS.TEXTBOX, req);

            await validateIfExists({
                model: Persona,
                field: TABLE_FIELDS.CEDULA,
                value: cliente.Persona.cedula,
                errorMessage: req.t(
                    'warning.PERSON_ALREADY_REGISTERED',
                    { person: req.t('person.CLIENT') },
                    { data: cliente.Persona.cedula }
                )
            }, { transaction });

            await updateRelatedEntity(
                Cliente,
                cliente,
                transaction,
                id_cliente,
                req
            );

            cliente.Persona && await updatePersonAndAddress(
                cliente.Persona,
                transaction,
                id_cliente,
                req
            );
        }

        if (contraparte) {

            validateInput(contraparte.Persona.primer_nombre, FIELDS.TEXT, req);
            validateInput(contraparte.Persona.primer_apellido, FIELDS.TEXT, req);
            validateInput(contraparte.Persona.segundo_apellido, FIELDS.TEXT, req);
            validateInput(contraparte.Persona.cedula, FIELDS.ID, req);
            validateInput(contraparte.Persona.telefono, FIELDS.PHONE_NUMBER, req);
            validateInput(contraparte.sexo, FIELDS.CHAR, req);
            validateInput(contraparte.Persona.detalles, FIELDS.TEXTBOX, req);
            contraparte.Persona.telefono_adicional && validateInput(contraparte.Persona.telefono_adicional, FIELDS.PHONE_NUMBER, req);
            contraparte.Persona.segundo_nombre && validateInput(contraparte.segundo_nombre, FIELDS.TEXTBOX, req);


            await validateIfExists({
                model: Persona,
                field: TABLE_FIELDS.CEDULA,
                value: contraparte.Persona.cedula,
                errorMessage: req.t(
                    'warning.PERSON_ALREADY_REGISTERED',
                    { person: req.t('person.COUNTERPART') },
                    { data: contraparte.Persona.cedula }
                )
            }, { transaction });

            await updateRelatedEntity(
                Contraparte,
                contraparte,
                transaction,
                id_contraparte,
                req
            );
            contraparte.Persona && await updatePersonAndAddress(
                contraparte.Persona,
                transaction,
                id_contraparte,
                req
            );
        }

        if (subsidiario) {

            validateInput(subsidiario.Persona.primer_nombre, FIELDS.TEXT, req);
            validateInput(subsidiario.Persona.primer_apellido, FIELDS.TEXT, req);
            validateInput(subsidiario.Persona.segundo_apellido, FIELDS.TEXT, req);
            validateInput(subsidiario.Persona.cedula, FIELDS.ID, req);
            validateInput(subsidiario.Persona.telefono, FIELDS.PHONE_NUMBER, req);
            validateInput(subsidiario.sexo, FIELDS.CHAR, req);
            validateInput(subsidiario.detalles, FIELDS.TEXTBOX, req);
            subsidiario.Persona.telefono_adicional && validateInput(subsidiario.Persona.telefono_adicional, FIELDS.PHONE_NUMBER, req);
            subsidiario.Persona.segundo_nombre && validateInput(subsidiario.segundo_nombre, FIELDS.TEXTBOX, req);

            await validateIfExists({
                model: Persona,
                field: TABLE_FIELDS.CEDULA,
                value: subsidiario.Persona.cedula,
                errorMessage: req.t(
                    'warning.PERSON_ALREADY_REGISTERED',
                    { person: req.t('person.SUBSIDIARY') },
                    { data: subsidiario.Persona.cedula }
                )
            }, { transaction });

            await updateRelatedEntity(
                Subsidiario,
                subsidiario,
                transaction,
                id_subsidiario,
                req
            );
            subsidiario.Persona && await updatePersonAndAddress(
                subsidiario.Persona,
                transaction,
                id_subsidiario,
                req
            );
        }

        // Registrar la acción de actualización en la tabla de auditoría
        await AuditLog.create({
            user_id: userId,
            action: req.t('action.UPDATE_CASE'),
            description: req.t('description.UPDATE_CASE', { data: id_caso }),
        }, { transaction });

        await transaction.commit(); // Confirmar la transacción

        return sendResponse({
            res,
            statusCode: HttpStatus.OK,
            message: req.t('success.CASE_UPDATED'),
            data: caso
        });
    } catch (error) {
        await transaction.rollback(); // Revertir la transacción en caso de error
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
