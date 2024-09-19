// controllers/estudianteController.js
const { Estudiante, Persona, AsignacionDeCaso, Caso, Cliente, Contraparte } = require('../models');

exports.mostrarInformacionEstudiante = async (req, res) => {
    const { idEstudiante } = req.params;

    try {        
        // Buscar el estudiante e incluir la información de Persona y los casos asignados
        const estudiante = await Estudiante.findByPk(idEstudiante, {
            include: [
                {
                    model: Persona, // Incluir la relación con Persona
                    attributes: ['primerNombre', 'segundoNombre', 'primerApellido', 'segundoApellido', 'cedula', 'telefono']
                },
                {
                    model: AsignacionDeCaso,
                    include: {
                        model: Caso,
                        include: [
                            {
                                model: Cliente,
                                include: {
                                    model: Persona, // Detalles del Cliente
                                    attributes: ['primerNombre', 'segundoNombre', 'primerApellido', 'segundoApellido']
                                }
                            },
                            {
                                model: Contraparte,
                                include: {
                                    model: Persona, // Detalles de la Contraparte
                                    attributes: ['primerNombre', 'segundoNombre', 'primerApellido', 'segundoApellido']
                                }
                            }
                        ],
                        attributes: ['id_caso', 'expediente', 'estado', 'tipo_proceso', 'cuantia_proceso'] // Detalles del caso
                    }
                }
            ]
        });
        
        if (!estudiante) {
            return res.status(404).json({ message: 'Estudiante no encontrado' });
        }

        // Formatear la respuesta con la información del estudiante, casos y clientes
        const estudianteInfo = {
            id: estudiante.id_estudiante,
            nombreCompleto: `${estudiante.Persona.primerNombre} ${estudiante.Persona.segundoNombre || ''} ${estudiante.Persona.primerApellido} ${estudiante.Persona.segundoApellido}`,
            carnet: estudiante.carnet,
            cedula: estudiante.Persona.cedula,
            telefono: estudiante.Persona.telefono,
            casosAsignados: estudiante.AsignacionDeCasos.map(asignacion => ({
                idCaso: asignacion.Caso.id_caso,
                expediente: asignacion.Caso.expediente,
                estado: asignacion.Caso.estado,
                tipoProceso: asignacion.Caso.tipo_proceso,
                cuantiaProceso: asignacion.Caso.cuantia_proceso,
                cliente: asignacion.Caso.Cliente ? {
                    nombreCompleto: `${asignacion.Caso.Cliente.Persona.primerNombre} ${asignacion.Caso.Cliente.Persona.segundoNombre || ''} ${asignacion.Caso.Cliente.Persona.primerApellido} ${asignacion.Caso.Cliente.Persona.segundoApellido}`
                } : null,
                contraparte: asignacion.Caso.Contraparte ? {
                    nombreCompleto: `${asignacion.Caso.Contraparte.Persona.primerNombre} ${asignacion.Caso.Contraparte.Persona.segundoNombre || ''} ${asignacion.Caso.Contraparte.Persona.primerApellido} ${asignacion.Caso.Contraparte.Persona.segundoApellido}`
                } : null
            }))
        };

        res.status(200).json({ estudiante: estudianteInfo });
    } catch (error) {
        console.error('Error al obtener la información del estudiante:', error);
        res.status(500).json({ message: 'Error al obtener la información del estudiante', error: error.message });
    }
};
