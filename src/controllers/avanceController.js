const { Estudiante, Persona, AsignacionDeCaso, Caso, Cliente, Contraparte, Direccion, Usuario, Avance, sequelize } = require('../models');
const { HttpStatus, TABLE_FIELDS, MESSAGE_ERROR, MESSAGE_SUCCESS, ROL, FIELDS } = require("../constants/constants");
const { sendResponse, CustomError } = require('../handlers/responseHandler');
const { validateUpdatesInputs, validateInput, getFullName, validateCaseAssignedToStudent } = require('../utils/helpers');

exports.crearAvance = async (req, res) => {
    const {
        id_estudiante,
        id_caso, gestion,
        resultado_concreto,
        evidencia, observaciones
    } = req.body;

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
            message: req.t('success.PROGRESS_CREATED'),
            data: nuevoAvance
        });
    } catch (error) {

        console.error(error);
        return sendResponse({
            res,
            statusCode: error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
            message: error?.message || {
                message: req.t('error.CREATING_PROGRESS'),
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

        if (!avances || avances.length == 0) {
            throw new CustomError(HttpStatus.NOT_FOUND, req.t('info.PROGRESS_NOT_FOUND'));
        }

        return sendResponse({
            res,
            statusCode: HttpStatus.CREATED,
            message: req.t('success.PROGRESS_FOUND'),
            data: avances
        });
    } catch (error) {
        return sendResponse({
            res,
            statusCode: error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
            message: error?.message || {
                message: req.t('error.RETRIEVING_PROGRESS'),
                error: error.message,
                stack: error.stack
            }
        });
    }
};

exports.actualizarAvance = async (req, res) => {
    const {
        id_avance,
        id_estudiante,
        id_caso,
        gestion,
        resultado_concreto,
        evidencia,
        observaciones
    } = req.body;

    const transaction = await sequelize.transaction(); // Inicia la transacción

    try {
        // Verificar que el avance exista
        const avance = await Avance.findByPk(id_avance);

        if (!avance) {
            throw new CustomError(HttpStatus.NOT_FOUND, req.t('info.PROGRESS_NOT_FOUND'));
        }

        // Validar que el caso existe y está asignado al estudiante
        await validateCaseAssignedToStudent(id_caso, id_estudiante);

        validateInput(gestion, FIELDS.TEXTBOX);
        validateInput(resultado_concreto, FIELDS.TEXTBOX);
        validateInput(evidencia, FIELDS.TEXTBOX);
        validateInput(observaciones, FIELDS.TEXTBOX);

        // Actualizar los campos del avance
        await avance.update(
            {
                gestion,
                resultado_concreto,
                evidencia,
                observaciones
            },
            { transaction }
        );

        await transaction.commit();

        return sendResponse({
            res,
            statusCode: HttpStatus.OK,
            message: req.t('success.PROGRESS_UPDATED'),
            data: avance
        });
    } catch (error) {
        console.error(error);

        await transaction.rollback();

        return sendResponse({
            res,
            statusCode: error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
            message: error?.message || {
                message: req.t('error.UPDATING_PROGRESS'),
                error: error.message,
                stack: error.stack
            }
        });
    }
};
