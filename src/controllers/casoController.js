// controllers/casoController.js
const { t } = require('i18next');
const { HttpStatus, MESSAGE_SUCCESS, MESSAGE_ERROR, TABLE_FIELDS, FIELDS, STATES } = require('../constants/constants');
const { CustomError, sendResponse } = require('../handlers/responseHandler');
const { AsignacionDeCaso, Estudiante, Caso, Persona, Direccion, Contraparte, Cliente, Sequelize, Subsidiario, sequelize } = require('../../models');
const { validateIfExists, validateInput, validateUniqueCedulas, getFullName } = require('../utils/helpers');
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
        await validateIfExists({
            model: Caso,
            field: TABLE_FIELDS.EXPEDIENTE,
            value: casoData.expediente,
            errorMessage: req.t('warning.CASE_ALREADY_REGISTERED', { data: casoData.expediente }),
        });

        // Validar los campos de entrada
        validateInput(cliente.primer_nombre, FIELDS.TEXT, req);
        cliente.segundo_nombre && validateInput(cliente.segundo_nombre, FIELDS.TEXT, req);
        validateInput(cliente.primer_apellido, FIELDS.TEXT, req);
        validateInput(cliente.segundo_apellido, FIELDS.TEXT, req);
        validateInput(contraparte.primer_nombre, FIELDS.TEXT, req);
        contraparte.segundo_nombre && validateInput(contraparte.segundo_nombre, FIELDS.TEXT, req);
        validateInput(contraparte.primer_apellido, FIELDS.TEXT, req);
        validateInput(contraparte.segundo_apellido, FIELDS.TEXT, req);
        validateInput(cliente.cedula, FIELDS.ID, req);
        validateInput(contraparte.cedula, FIELDS.ID, req);
        validateInput(cliente.telefono, FIELDS.PHONE_NUMBER, req);
        validateInput(contraparte.telefono, FIELDS.PHONE_NUMBER, req);
        validateInput(casoData.cuantia_proceso, FIELDS.NUMERIC, req);
        validateInput(casoData.aporte_comunidad, FIELDS.NUMERIC, req);
        validateInput(cliente.ingreso_economico, FIELDS.NUMERIC, req);
        validateInput(casoData.expediente, FIELDS.EXPEDIENTE, req);

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
        });

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
        });

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
            });

            // Validar los campos del subsidiario
            validateInput(subsidiario.primer_nombre, FIELDS.TEXT, req);
            subsidiario.segundo_nombre && validateInput(subsidiario.segundo_nombre, FIELDS.TEXT, req);
            validateInput(subsidiario.segundo_nombre, FIELDS.TEXT, req);
            validateInput(subsidiario.primer_apellido, FIELDS.TEXT, req);
            validateInput(subsidiario.segundo_apellido, FIELDS.TEXT, req);
            validateInput(subsidiario.cedula, FIELDS.ID, req);
            validateInput(subsidiario.telefono, FIELDS.PHONE_NUMBER, req);

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
    const { idEstudiante, idCaso } = req.body;
    const transaction = await sequelize.transaction(); // Inicia la transacción

    try {
        // Verificar si el estudiante y el caso existen
        const estudiante = await Estudiante.findByPk(idEstudiante);
        const caso = await Caso.findByPk(idCaso);

        if (!estudiante) {

            throw new CustomError(HttpStatus.NOT_FOUND, req.t('warning.STUDENT_NOT_FOUND'));
        }
        if (!caso) {

            throw new CustomError(HttpStatus.NOT_FOUND, req.t('warning.CASE_NOT_FOUND'));
        }

        // Verificar si el caso ya está asignado a algún estudiante
        const asignacionExistente = await AsignacionDeCaso.findOne({
            where: { id_caso: idCaso }
        });

        if (asignacionExistente) {

            throw new CustomError(HttpStatus.BAD_REQUEST, req.t('warning.CASE_ALREADY_ASSIGNED'));
        }

        // Crear la asignación
        const nuevaAsignacion = await AsignacionDeCaso.create({
            id_caso: idCaso,
            id_estudiante: idEstudiante,
        }, { transaction });

        await Caso.update({
            estado: STATES.ASSIGNED
        }, {
            where: { id_caso: idCaso }
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
                sexo: caso.Cliente.sexo,
                ingreso_economico: caso.Cliente.ingreso_economico,
                cedula: caso.Cliente.Persona.cedula,
                telefono: caso.Cliente.Persona.telefono,
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
                sexo: caso.Contraparte.sexo,
                detalles: caso.Contraparte.detalles,
                cedula: caso.Contraparte.Persona.cedula,
                telefono: caso.Contraparte.Persona.telefono,
                createdAt: caso.Contraparte.Persona.createdAt,
                updatedAt: caso.Contraparte.Persona.updatedAt,
                dirreccion_exacta: caso.Contraparte.Persona.Direccion.direccion_exacta,
                canton: caso.Contraparte.Persona.Direccion.canton,
                distrito: caso.Contraparte.Persona.Direccion.distrito,
                localidad: caso.Contraparte.Persona.Direccion.localidad,
                provincia: caso.Contraparte.Persona.Direccion.provincia

            };

            const subsidiarios = caso.Subsidiarios.map(subsidiario => ({
                id_subsidiario: subsidiario.id_subsidiario,
                nombre_completo: getFullName(subsidiario.Persona),
                sexo: subsidiario.sexo,
                detalles: subsidiario.detalles,
                cedula: subsidiario.Persona.cedula,
                telefono: subsidiario.Persona.telefono,
                createdAt: subsidiario.Persona.createdAt,
                updatedAt: subsidiario.Persona.updatedAt,
                dirreccion_exacta: subsidiario.Persona.Direccion.direccion_exacta,
                canton: subsidiario.Persona.Direccion.canton,
                distrito: subsidiario.Persona.Direccion.distrito,
                localidad: subsidiario.Persona.Direccion.localidad,
                provincia: subsidiario.Persona.Direccion.provincia

            }));

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
                Subsidiarios: subsidiarios,
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
                cedula: caso.Cliente.Persona.cedula,
                sexo: caso.Cliente.sexo,
                ingreso_economico: caso.Cliente.ingreso_economico,
                telefono: caso.Cliente.Persona.telefono,
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
                cedula: caso.Contraparte.Persona.cedula,
                sexo: caso.Contraparte.sexo,
                detalles: caso.Contraparte.detalles,
                telefono: caso.Contraparte.Persona.telefono,
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
                cedula: caso.Subsidiario.Persona.cedula,
                sexo: caso.Subsidiario.sexo,
                detalles: caso.Subsidiario.detalles,
                telefono: caso.Subsidiario.Persona.telefono,
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
                    createdAt: asignacion.Estudiante.Persona.createdAt,
                    updatedAt: asignacion.Estudiante.Persona.updatedAt
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
                Asignacion: asignaciones,
                Cliente: cliente,
                Contraparte: contraparte,
                Subsidiario: subsidiario,
                createdAt: caso.createdAt,
                updatedAt: caso.updatedAt
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
