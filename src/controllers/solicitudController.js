const { MESSAGE_ERROR, HttpStatus } = require("../constants/constants");
const { sendResponse, CustomError } = require("../handlers/responseHandler");
const { sequelize, Persona, Estudiante, Caso, SolicitudConfirmacion, AsignacionDeCaso, Avance } = require("../models");


exports.procesarSolicitudConfirmacion = async (req, res) => {
    const { id_solicitud, decision } = req.body; // decision puede ser 'aceptado' o 'denegado'
    const adminId = req.session.user.userId; // Asumimos que el administrador está autenticado y tiene este ID
    const transaction = await sequelize.transaction();

    try {
        // Buscar la solicitud de confirmación
        const solicitud = await SolicitudConfirmacion.findByPk(id_solicitud, {
            include: [Estudiante, Caso] // Asegúrate que se incluyan las referencias necesarias
        });

        if (!solicitud) {
            throw new CustomError(HttpStatus.NOT_FOUND, 'Solicitud no encontrada');
        }

        if (solicitud.estado !== 'pendiente') {
            throw new CustomError(HttpStatus.BAD_REQUEST, 'Esta solicitud ya fue procesada.');
        }

        // Procesar la solicitud
        if (decision === 'aceptado') {
            // Si es una solicitud para eliminar un estudiante
            if (solicitud.accion === 'eliminar' && solicitud.id_estudiante) {
                const estudiante = await Estudiante.findByPk(solicitud.id_estudiante, {
                    include: [Persona]
                });

                if (!estudiante) {
                    throw new CustomError(HttpStatus.NOT_FOUND, 'Estudiante no encontrado');
                }
                const id_estudiante = estudiante.id_estudiante;
                // Verificar si el estudiante tiene avances asociados
                const avances = await Avance.findAll({ where: { id_estudiante } });

                if (avances.length > 0) {
                    // Opción 1: Actualizar los avances para desasignar al estudiante (dejar la referencia a NULL o a un valor alternativo)
                    await Avance.update({ id_estudiante: null }, { where: { id_estudiante }, transaction });

                    // Opción 2: Si prefieres eliminar los avances, usa el siguiente código en lugar de la actualización:
                    // await Avance.destroy({ where: { id_estudiante }, transaction });
                }

                // Verificar si el estudiante tiene asignaciones de caso
                const asignaciones = await AsignacionDeCaso.findAll({ where: { id_estudiante: estudiante.id_estudiante } });
                if (asignaciones.length > 0) {
                    // Desasignar casos en lugar de eliminar
                    for (const asignacion of asignaciones) {
                        await asignacion.destroy({ transaction });
                    }
                }

                // Eliminar al estudiante y su persona asociada
                const persona = estudiante.Persona;
                await persona.destroy({ transaction });

                // Actualizar el estado de la solicitud a 'aceptado'
                solicitud.estado = 'aceptado';
            }
        } else if (decision === 'denegado') {
            solicitud.estado = 'denegado'; // Marcar la solicitud como denegada
        } else {
            throw new CustomError(HttpStatus.BAD_REQUEST, 'Decisión inválida. Debe ser "aceptado" o "denegado".');
        }

        // Guardar los cambios
        await solicitud.save({ transaction });
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
