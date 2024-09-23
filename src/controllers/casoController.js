// controllers/casoController.js
const { HttpStatus } = require('../constants/constants');
const { sendResponse } = require('../handlers/responseHandler');
const { Caso, Persona, Direccion, Contraparte, Cliente, Sequelize } = require('../models');


exports.crearCaso = async (req, res) => {
    const {
        descripcion,
        cliente,
        contraparte,
        casoData
    } = req.body;

    try {
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
            message: 'Case created successfully',
            data: nuevoCaso
        });
       
    } catch (error) {

        sendResponse({
            res, statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message:{
                message: 'Error creating case',
                error: error.message
            }
        });
    }
};
