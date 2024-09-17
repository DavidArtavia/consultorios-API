// controllers/casoController.js
const Cliente = require('../models/cliente');
const Contraparte = require('../models/contraparte');
const Caso = require('../models/caso');
const Persona = require('../models/persona');
const Direccion = require('../models/direccion');

exports.createCaso = async (req, res) => {
    const {
        descripcion,
        cliente,
        contraparte,
        casoData
    } = req.body;

    try {
        // Crear el cliente
        const clientePersona = await Persona.create({
            primerNombre: cliente.primerNombre,
            segundoNombre: cliente.segundoNombre,
            primerApellido: cliente.primerApellido,
            segundoApellido: cliente.segundoApellido,
            cedula: cliente.cedula,
            telefono: cliente.telefono,
        });

        await Direccion.create({
            id_persona: clientePersona.id_persona,
            direccionExacta: cliente.direccion.direccionExacta,
            canton: cliente.direccion.canton,
            distrito: cliente.direccion.distrito,
            localidad: cliente.direccion.localidad,
            provincia: cliente.direccion.provincia,
        });

        const nuevoCliente = await Cliente.create({
            id_cliente: clientePersona.id_persona,
            sexo: cliente.sexo,
            ingresoEconomico: cliente.ingresoEconomico,
        });

        // Crear la contraparte
        const contrapartePersona = await Persona.create({
            primerNombre: contraparte.primerNombre,
            segundoNombre: contraparte.segundoNombre,
            primerApellido: contraparte.primerApellido,
            segundoApellido: contraparte.segundoApellido,
            cedula: contraparte.cedula,
            telefono: contraparte.telefono,
        });

        await Direccion.create({
            id_persona: contrapartePersona.id_persona,
            direccionExacta: contraparte.direccion.direccionExacta,
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

        res.status(201).json({ message: 'Caso creado exitosamente', caso: nuevoCaso });
    } catch (error) {
        console.error('Error al crear caso:', error);
        res.status(500).json({ message: 'Error al crear caso', error: error.message });
    }
};
