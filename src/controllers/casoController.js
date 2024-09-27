// controllers/casoController.js
const { HttpStatus, MESSAGE_SUCCESS, MESSAGE_ERROR } = require('../constants/constants');
const { CustomError, sendResponse } = require('../handlers/responseHandler');
const { AsignacionDeCaso, Estudiante, Caso, Persona, Direccion, Contraparte, Cliente, Sequelize } = require('../models');


exports.crearCaso = async (req, res) => {
    const {
        descripcion,
        cliente,
        contraparte,
        casoData
    } = req.body;

    try {
        // Validar si la cédula del cliente ya está registrada
        const clienteExistente = await Persona.findOne({
            where: { cedula: cliente.cedula }
        });

        if (clienteExistente) {
            throw new CustomError(HttpStatus.BAD_REQUEST, `Client with ID ${cliente.cedula} is already registered.`);
        }

        // Validar si la cédula de la contraparte ya está registrada
        const contraparteExistente = await Persona.findOne({
            where: { cedula: contraparte.cedula }
        });

        if (contraparteExistente) {
            throw new CustomError(HttpStatus.BAD_REQUEST, `Contraparte with ID ${contraparte.cedula} is already registered.`);
        }

        // Validar si el expediente ya está registrado
        const expedienteExistente = await Caso.findOne({
            where: { expediente: casoData.expediente }
        });

        if (expedienteExistente) {
            throw new CustomError(HttpStatus.BAD_REQUEST, `The case file ${casoData.expediente} is already registered.`);
        }

        // Crear el cliente
        const clientePersona = await Persona.create({
            primer_nombre: cliente.primer_nombre,
            segundo_nombre: cliente.segundo_nombre,
            primer_apellido: cliente.primer_apellido,
            segundo_apellido: cliente.segundo_apellido,
            cedula: cliente.cedula,
            telefono: cliente.telefono,
        });

        await Direccion.create({
            id_persona: clientePersona.id_persona,
            direccion_exacta: cliente.direccion.direccion_exacta,
            canton: cliente.direccion.canton,
            distrito: cliente.direccion.distrito,
            localidad: cliente.direccion.localidad,
            provincia: cliente.direccion.provincia,
        });

        const nuevoCliente = await Cliente.create({
            id_cliente: clientePersona.id_persona,
            sexo: cliente.sexo,
            ingreso_economico: cliente.ingreso_economico,
        });

        // Crear la contraparte
        const contrapartePersona = await Persona.create({
            primer_nombre: contraparte.primer_nombre,
            segundo_nombre: contraparte.segundo_nombre,
            primer_apellido: contraparte.primer_apellido,
            segundo_apellido: contraparte.segundo_apellido,
            cedula: contraparte.cedula,
            telefono: contraparte.telefono,
        });

        await Direccion.create({
            id_persona: contrapartePersona.id_persona,
            direccion_exacta: contraparte.direccion.direccionExacta,
            canton: contraparte.direccion.canton,
            distrito: contraparte.direccion.distrito,
            localidad: contraparte.direccion.localidad,
            provincia: contraparte.direccion.provincia,
        });

        const nuevaContraparte = await Contraparte.create({
            id_contraparte: contrapartePersona.id_persona,
            detalles: contraparte.detalles
        });

        // Crear el caso y asociar cliente y contraparte
        const nuevoCaso = await Caso.create({
            ...casoData,
            id_cliente: nuevoCliente.id_cliente,
            id_contraparte: nuevaContraparte.id_contraparte,
        });

        sendResponse({
            res,
            statusCode: HttpStatus.OK,
            message: MESSAGE_SUCCESS.CASE_CREATED,
            data: nuevoCaso
        });

    } catch (error) {
        sendResponse({
            res,
            statusCode: error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
            message: error.message || MESSAGE_ERROR.CREATING_CASE,
            error: error.stack
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
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: MESSAGE_ERROR.ASSIGN_CASE,
            error: error.message
        });
    }
};