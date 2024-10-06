// controllers/casoController.js
const { HttpStatus, MESSAGE_SUCCESS, MESSAGE_ERROR, TABLE_FIELDS, FIELDS } = require('../constants/constants');
const { CustomError, sendResponse } = require('../handlers/responseHandler');
const { AsignacionDeCaso, Estudiante, Caso, Persona, Direccion, Contraparte, Cliente, Sequelize, Subsidiario, sequelize } = require('../models');
const { validateIfExists, validateInput, validateUniqueCedulas } = require('../utils/helpers');


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
        validateUniqueCedulas(cliente.cedula, contraparte.cedula, subsidiario?.cedula);

        // Verificar si ya existe un expediente
        await validateIfExists({
            model: Caso,
            field: TABLE_FIELDS.EXPEDIENTE,
            value: casoData.expediente,
            table_name: `The case file ${casoData.expediente} is already registered.`
        });

        // Validar los campos de entrada
        validateInput(cliente.primer_nombre, FIELDS.TEXT);
        validateInput(cliente.segundo_nombre, FIELDS.TEXT);
        validateInput(cliente.primer_apellido, FIELDS.TEXT);
        validateInput(cliente.segundo_apellido, FIELDS.TEXT);
        validateInput(contraparte.primer_nombre, FIELDS.TEXT);
        validateInput(contraparte.segundo_nombre, FIELDS.TEXT);
        validateInput(contraparte.primer_apellido, FIELDS.TEXT);
        validateInput(contraparte.segundo_apellido, FIELDS.TEXT);
        validateInput(cliente.cedula, FIELDS.ID);
        validateInput(contraparte.cedula, FIELDS.ID);
        validateInput(cliente.telefono, FIELDS.PHONE_NUMBER);
        validateInput(contraparte.telefono, FIELDS.PHONE_NUMBER);
        validateInput(casoData.cuantia_proceso, FIELDS.NUMERIC);
        validateInput(casoData.aporte_comunidad, FIELDS.NUMERIC);
        validateInput(cliente.ingreso_economico, FIELDS.NUMERIC);
        validateInput(casoData.expediente, FIELDS.EXPEDIENTE);

        // Validar si la cédula del cliente ya está registrada
        await validateIfExists({
            model: Persona,
            field: TABLE_FIELDS.CEDULA,
            value: cliente.cedula,
            errorMessage: `(Client) Person with ID ${cliente.cedula} is already registered.`
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
            errorMessage: `(Contraparte) Person with ID ${contraparte.cedula} is already registered.`
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
                errorMessage: `(Subsidiario) Person with ID ${subsidiario.cedula} is already registered.`
            });

            // Validar los campos del subsidiario
            validateInput(subsidiario.primer_nombre, FIELDS.TEXT);
            validateInput(subsidiario.segundo_nombre, FIELDS.TEXT);
            validateInput(subsidiario.primer_apellido, FIELDS.TEXT);
            validateInput(subsidiario.segundo_apellido, FIELDS.TEXT);
            validateInput(subsidiario.cedula, FIELDS.ID);
            validateInput(subsidiario.telefono, FIELDS.PHONE_NUMBER);

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
            message: MESSAGE_SUCCESS.CASE_CREATED,
            data: nuevoCaso
        });

    } catch (error) {
        console.error(MESSAGE_ERROR.CREATING_CASE, error);
        // Deshacer la transacción en caso de error
        await transaction.rollback();

        return sendResponse({
            res,
            statusCode: error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
            message: error?.message || {
                message: MESSAGE_ERROR.CREATING_CASE,
                error: error.message,
                stack: error.stack
            }
        });
    }
};

exports.asignarCasoAEstudiante = async (req, res) => {
    const { idEstudiante, idCaso } = req.body;

    try {
        // Verificar si el estudiante y el caso existen
        const estudiante = await Estudiante.findByPk(idEstudiante);
        const caso = await Caso.findByPk(idCaso);

        if (!estudiante) {

            throw new CustomError(HttpStatus.NOT_FOUND, MESSAGE_ERROR.STUDENT_NOT_FOUND);
        }
        if (!caso) {

            throw new CustomError(HttpStatus.NOT_FOUND, MESSAGE_ERROR.CASE_NOT_FOUND);
        }

        // Verificar si el caso ya está asignado a algún estudiante
        const asignacionExistente = await AsignacionDeCaso.findOne({
            where: { id_caso: idCaso }
        });

        if (asignacionExistente) {

            throw new CustomError(HttpStatus.BAD_REQUEST, MESSAGE_ERROR.CASE_ALREADY_ASSIGNED);
        }

        // Crear la asignación
        const nuevaAsignacion = await AsignacionDeCaso.create({
            id_caso: idCaso,
            id_estudiante: idEstudiante,
        });


        sendResponse({
            res,
            statusCode: HttpStatus.CREATED,
            message: MESSAGE_SUCCESS.CASE_ASSIGNED,
            data: nuevaAsignacion
        });
    } catch (error) {
        console.error(MESSAGE_ERROR.ASSIGN_CASE, error);

        sendResponse({
            res,
            statusCode: error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
            message: error?.message || {
                message: MESSAGE_ERROR.ASSIGN_CASE,
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
                    attributes: [], // No necesitamos los atributos de AsignacionDeCaso
                },
                {
                    model: Cliente, // Incluir la información del cliente
                    include: [
                        {
                            model: Persona, // Incluir la información de la persona relacionada al cliente
                            attributes: { exclude: ['id_persona'] }
                        }
                    ]
                }
            ],
            where: {
                '$Asignaciones.id_asignacion$': null // Filtrar los casos que no tienen asignación
            }
        });

        if (!casosNoAsignados || casosNoAsignados.length === 0) {
            return sendResponse({
                res,
                statusCode: HttpStatus.OK,
                message: MESSAGE_SUCCESS.NO_UNASSIGNED_CASES,
                data: []
            });
        }
        // Mapear los casos no asignados
        const resultado = casosNoAsignados.map(caso => ({
            ...caso.get({ plain: true }),
        }));

        // Retornar la respuesta con los casos no asignados
       return sendResponse({
            res,
            statusCode: HttpStatus.OK,
            message: MESSAGE_SUCCESS.UNASSIGNED_CASES,
            data: resultado
        });

    } catch (error) {
        console.error("Error al obtener casos no asignados:", error);
        return sendResponse({
            res,
            statusCode: error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
            message: error?.message || {
                message: MESSAGE_ERROR.UNASSIGNED_CASES,
                error: error.message,
                stack: error.stack
            }
        });
    }
};
