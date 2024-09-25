
const { HttpStatus, MESSAGE_ERROR, MESSAGE_SUCCESS } = require('../constants/constants');
const { CustomError, sendResponse } = require('../handlers/responseHandler');
const { AsignacionDeCaso, Caso,  Estudiante, Sequelize } = require('../models');


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