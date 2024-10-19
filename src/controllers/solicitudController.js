const { MESSAGE_ERROR, HttpStatus, ACTION, DECISION, STATES } = require("../constants/constants");
const { sendResponse, CustomError } = require("../handlers/responseHandler");
const { sequelize, Persona, Estudiante, Caso, SolicitudConfirmacion, AsignacionDeCaso, Avance } = require("../models");
const { checkStudentAssignmentsAndProgress } = require("../utils/helpers");

exports.mostrarSolicitudes = async (req, res) => {
    try {
        
        // Obtener todas las solicitudes de confirmación
        const solicitudes = await SolicitudConfirmacion.findAll({
            include: [
                {
                    model: Estudiante,
                    include: [Persona] 
                },
                {
                    model: Caso 
                }
            ],
            order: [['createdAt', 'DESC']] // Ordenar por fecha de creación, más recientes primero
        });

        if (!solicitudes || solicitudes.length === 0) {
            throw new CustomError(HttpStatus.NOT_FOUND, 'No confirmation requests found.');
        }

        // Responder con las solicitudes
        return sendResponse({
            res,
            statusCode: HttpStatus.OK,
            message: 'Confirmation requests found.',
            data: solicitudes
        });
    } catch (error) {
        console.error('Error retrieving confirmation requests:', error);
        return sendResponse({
            res,
            statusCode: error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
            message: error?.message || {
                message: 'Error retrieving confirmation requests.',
                error: error.message,
                stack: error.stack
            }
        });
    }
};


exports.procesarSolicitudConfirmacion = async (req, res) => {
    const { id_solicitud, decision } = req.body; // decision puede ser 'aceptado' o 'denegado'
    const adminId = req.session.user.userId; // Asumimos que el administrador está autenticado y tiene este ID
    const transaction = await sequelize.transaction();

    try {
        // Buscar la solicitud de confirmación
        const solicitud = await findConfirmationRequestById(id_solicitud);

        const state = solicitud.estado;

        if (state !== STATES.PENDING) {
            throw new CustomError(HttpStatus.BAD_REQUEST, MESSAGE_ERROR.REQUEST_PROCESSED);
        }

        // Procesar la solicitud
        if (decision === DECISION.ACCEPTED) {
            const id_estudiante = solicitud.id_estudiante;
            // Si es una solicitud para eliminar un estudiante
            if (solicitud.accion === ACTION.DELETE && id_estudiante) {

                const estudiante = await findStudentByPk(id_estudiante);
                // Verificar si el estudiante tiene asociados
                await checkStudentAssignmentsAndProgress(id_estudiante, transaction);

                // Eliminar al estudiante y su persona asociada
                await estudiante.Persona.destroy({ transaction });

                // Actualizar el estado de la solicitud a 'aceptado'
                await solicitud.update({ estado: DECISION.ACCEPTED }, { transaction });
            }
        } else if (decision === DECISION.DENIED) {
            // Marcar la solicitud como denegada
            await solicitud.update({ estado: DECISION.DENIED }, { transaction });
        } else {
            throw new CustomError(HttpStatus.BAD_REQUEST, MESSAGE_ERROR.INVALID_DECISION);
        }

        await transaction.commit();

        return sendResponse({
            res,
            statusCode: HttpStatus.OK,
            message: `Solicitud ${solicitud.estado}`,
            data: solicitud
        });
    } catch (error) {
        console.error('Error al procesar la solicitud de confirmación:', error);
        await transaction.rollback();
        return sendResponse({
            res,
            statusCode: error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
            message: error?.message || {
                message: MESSAGE_ERROR.PROCESS_REQUEST,
                error: error.message,
                stack: error.stack
            }
        });
    }
};
