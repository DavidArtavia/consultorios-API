const { HttpStatus, ACTION, DECISION, STATES, TABLE_FIELDS, ORDER } = require("../constants/constants");
const { sendResponse, CustomError } = require("../handlers/responseHandler");
const { sequelize, Persona, Estudiante, Caso, SolicitudConfirmacion } = require("../../models");
const { checkStudentAssignments, findConfirmationRequestById, findStudentByPk, getFullName } = require("../utils/helpers");

exports.mostrarSolicitudes = async (req, res) => {
    try {

        // Obtener todas las solicitudes de confirmación
        const solicitudes = await SolicitudConfirmacion.findAll({
            include: [
                {
                    model: Estudiante,
                    include: [Persona]
                }
            ],
            order: [[TABLE_FIELDS.CREATED_AT, ORDER.DESC]] // Ordenar por fecha de creación, más recientes primero
        });

        if (!solicitudes || solicitudes.length === 0) {
            throw new CustomError(HttpStatus.NOT_FOUND, req.t('warning.NO_CONFIRMATION_REQUESTS_FOUND'));
        }

        const solicitudInfo = solicitudes.map(solicitud => ({
            id_solicitud: solicitud.id_solicitud,
            id_caso: solicitud.id_caso,
            accion: solicitud.accion,
            detalles: solicitud.detalles,
            estado: solicitud.estado,
            createdBy: solicitud.createdBy,
            createdAt: solicitud.createdAt,
            Estudiante: {
                id_estudiante: solicitud.id_estudiante,
                nombre_completo: getFullName(solicitud.Estudiante.Persona),
                primer_nombre: solicitud.Estudiante.Persona.primer_nombre,
                segundo_nombre: solicitud.Estudiante.Persona.segundo_nombre || '',
                primer_apellido: solicitud.Estudiante.Persona.primer_apellido,
                segundo_apellido: solicitud.Estudiante.Persona.segundo_apellido,
                carnet: solicitud.Estudiante.carnet,
                cedula: solicitud.Estudiante.Persona.cedula,
                telefono: solicitud.Estudiante.Persona.telefono,
                telefono_adicional: solicitud.Estudiante.Persona.telefono_adicional,
                createdAt: solicitud.Estudiante.createdAt,
                updatedAt: solicitud.Estudiante.updatedAt,
                direccion: solicitud.Estudiante.Persona.Direccion && {
                    ...solicitud.Estudiante.Persona.Direccion.toJSON()
                }
            }
        }));

        // Responder con las solicitudes
        return sendResponse({
            res,
            statusCode: HttpStatus.OK,
            message: req.t('success.CONFIRMATION_REQUESTS_FOUND'),
            data: solicitudInfo
        });
    } catch (error) {

        console.error('Error en mostrarSolicitudes', error);
        return sendResponse({
            res,
            statusCode: error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
            message: error?.message || {
                message: req.t('error.RETRIEVING_CONFIRMATION_REQUESTS'),
                error: error.message,
                stack: error.stack
            }
        });
    }
};


exports.procesarSolicitudConfirmacion = async (req, res) => {
    const { id_solicitud, decision } = req.body; // decision puede ser 'aceptado' o 'denegado'
    const transaction = await sequelize.transaction();

    try {
        // Buscar la solicitud de confirmación
        const solicitud = await findConfirmationRequestById(id_solicitud);

        const state = solicitud.estado;

        if (state != STATES.PENDING) {
            throw new CustomError(HttpStatus.BAD_REQUEST, req.t('warning.REQUEST_PROCESSED'));
        }

        // Procesar la solicitud
        if (decision == DECISION.ACCEPTED) {

            const id_estudiante = solicitud.id_estudiante;
            if (solicitud.accion == ACTION.DELETE && id_estudiante) {

                const estudiante = await findStudentByPk(id_estudiante, req);
                await checkStudentAssignments(id_estudiante, transaction);
                await estudiante.update({ estado: STATES.INACTIVE }, { transaction });
                await solicitud.update({ estado: DECISION.ACCEPTED }, { transaction });

            }
        } else if (decision == DECISION.DENIED) {

            await solicitud.update({ estado: DECISION.DENIED }, { transaction });
        } else {

            throw new CustomError(HttpStatus.BAD_REQUEST, req.t('warning.INVALID_DECISION'));
        }

        await transaction.commit();

        return sendResponse({
            res,
            statusCode: HttpStatus.OK,
            message: req.t('success.REQUEST_DETAILS', { data: decision }),
            data: solicitud
        });
    } catch (error) {
        await transaction.rollback();
        return sendResponse({
            res,
            statusCode: error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
            message: error?.message || {
                message: req.t('error.PROCESS_REQUEST'),
                error: error.message,
                stack: error.stack
            }
        });
    }
};
