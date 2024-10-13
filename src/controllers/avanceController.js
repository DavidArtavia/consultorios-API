const { Estudiante, Persona, AsignacionDeCaso, Caso, Cliente, Contraparte, Direccion, Usuario, Avance } = require('../models');
const { HttpStatus, TABLE_FIELDS, MESSAGE_ERROR, MESSAGE_SUCCESS, ROL, FIELDS } = require("../constants/constants");
const { sendResponse, CustomError } = require('../handlers/responseHandler');
const { validateUpdatesInputs, validateInput, getFullName, validateCaseAssignedToStudent } = require('../utils/helpers');

exports.crearAvance = async (req, res) => {
    const { id_estudiante, id_caso, gestion, resultado_concreto, evidencia, observaciones } = req.body;

    try {
        
        // Validar que el caso existe y está asignado al estudiante
        await validateCaseAssignedToStudent(id_caso, id_estudiante);
        // Crear el avance
        const nuevoAvance = await Avance.create({
            id_caso,
            id_estudiante,
            gestion,
            resultado_concreto,
            evidencia,
            observaciones,
        });

        return sendResponse({
            res,
            statusCode: HttpStatus.CREATED,
            message: MESSAGE_SUCCESS.PROGRESS_CREATED,
            data: nuevoAvance
        });
    } catch (error) {

        console.error(error);
        return sendResponse({
            res,
            statusCode: error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
            message: error?.message || {
                message: MESSAGE_ERROR.CREATING_PROGRESS,
                error: error.message,
                stack: error.stack
            }
        });
    }
};

exports.mostrarAvancesPorCaso = async (req, res) => {
    const { id_caso } = req.body;

    try {
        // Obtener los avances del caso
        const avances = await Avance.findAll({
            where: { id_caso },
            order: [[TABLE_FIELDS.FECHA_AVANCE, 'ASC']],
        });

        if (!avances || avances.length === 0) {
            throw new CustomError(HttpStatus.NOT_FOUND, MESSAGE_ERROR.NO_PROGRESS_FOUND);
        }

        return sendResponse({
            res,
            statusCode: HttpStatus.CREATED,
            message: MESSAGE_SUCCESS.PROGRESS_FOUND,
            data: avances
        });
    } catch (error) {
        return sendResponse({
            res,
            statusCode: error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
            message: error?.message || {
                message: MESSAGE_ERROR.RETRIEVING_PROGRESS,
                error: error.message,
                stack: error.stack
            }
        });
    }
};
