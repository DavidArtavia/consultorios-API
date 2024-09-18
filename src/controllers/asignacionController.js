const AsignacionDeCaso = require("../models/asignacionDeCasos");
const Caso = require("../models/caso");
const Estudiante = require("../models/estudiante");

exports.asignarCasoAEstudiante = async (req, res) => {
    const { idEstudiante, idCaso } = req.body;

    try {
        // Verificar si el estudiante y el caso existen
        const estudiante = await Estudiante.findByPk(idEstudiante);
        const caso = await Caso.findByPk(idCaso);

        if (!estudiante || !caso) {
            return res.status(404).json({ message: 'Estudiante o caso no encontrado' });
        }

        // Verificar si el caso ya está asignado a algún estudiante
        const asignacionExistente = await AsignacionDeCaso.findOne({
            where: { id_caso: idCaso }
        });

        if (asignacionExistente) {
            return res.status(400).json({ message: 'El caso ya está asignado a otro estudiante' });
        }

        // Crear la asignación
        const nuevaAsignacion = await AsignacionDeCaso.create({
            id_caso: idCaso,
            id_estudiante: idEstudiante,
        });



        res.status(201).json({ message: 'Caso asignado al estudiante exitosamente', asignacion: nuevaAsignacion });
    } catch (error) {
        console.error('Error al asignar caso al estudiante:', error);
        res.status(500).json({ message: 'Error al asignar caso al estudiante', error: error.message });
    }
};