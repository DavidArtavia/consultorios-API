
const { HttpStatus } = require('../constants/constants');
const { CustomError, sendResponse } = require('../handlers/responseHandler');
const { AsignacionDeCaso, Caso,  Estudiante, Sequelize } = require('../models');


exports.asignarCasoAEstudiante = async (req, res) => {
    const { idEstudiante, idCaso } = req.body;

    try {
        // Verificar si el estudiante y el caso existen
        const estudiante = await Estudiante.findByPk(idEstudiante);
        const caso = await Caso.findByPk(idCaso);

        if (!estudiante) {

            throw new CustomError(HttpStatus.NOT_FOUND, 'Student not found');
        }
        if (!caso) {

            throw new CustomError(HttpStatus.NOT_FOUND, 'Case not found');
        }

        // Verificar si el caso ya está asignado a algún estudiante
        const asignacionExistente = await AsignacionDeCaso.findOne({
            where: { id_caso: idCaso }
        });

        if (asignacionExistente) {
            
            throw new CustomError(HttpStatus.BAD_REQUEST, 'The case is already assigned to another student');
        }

        // Crear la asignación
        const nuevaAsignacion = await AsignacionDeCaso.create({
            id_caso: idCaso,
            id_estudiante: idEstudiante,
        });


        sendResponse({
            res,
            statusCode: HttpStatus.CREATED,
            message: 'Case assigned to student successfully',
            data: nuevaAsignacion
        });
    } catch (error) {
        console.error('Error al asignar caso al estudiante:', error);

        sendResponse({
            res,
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Error assigning case to student',
            error: error.message
        });
    }
};