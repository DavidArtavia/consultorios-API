const { MESSAGE_ERROR, HttpStatus, TABLE_FIELDS, MESSAGE_SUCCESS, STATES, FIELDS } = require("../constants/constants");
const { sendResponse, CustomError } = require("../handlers/responseHandler");
const { Profesor, Persona, Direccion, Usuario, AuditLog, sequelize } = require("../../models");
const { getFullName, validateInput } = require("../utils/helpers");


exports.mostrarProfesor = async (req, res) => {
    try {
        const profesor = await Profesor.findAll({
            include: [
                {
                    model: Persona,
                    attributes: [
                        TABLE_FIELDS.PRIMER_NOMBRE,
                        TABLE_FIELDS.SEGUNDO_NOMBRE,
                        TABLE_FIELDS.PRIMER_APELLIDO,
                        TABLE_FIELDS.SEGUNDO_APELLIDO,
                        TABLE_FIELDS.CEDULA,
                        TABLE_FIELDS.TELEFONO,
                        TABLE_FIELDS.TELEFONO_ADICIONAL
                    ],
                    include: [
                        {
                            model: Direccion,
                            attributes: [
                                TABLE_FIELDS.UID_DIRECCION,
                                TABLE_FIELDS.DIRECCION_EXACTA,
                                TABLE_FIELDS.CANTON,
                                TABLE_FIELDS.DISTRITO,
                                TABLE_FIELDS.LOCALIDAD,
                                TABLE_FIELDS.PROVINCIA,
                                TABLE_FIELDS.CREATED_AT,
                                TABLE_FIELDS.UPDATED_AT
                            ]
                        }
                    ]
                },
            ]
        });

        if (profesor.length == 0) {

            throw new CustomError(HttpStatus.NOT_FOUND, req.t('warning.NOT_PROFESORS_FOUND'));
        }

        const profesoresInfo = profesor.map(profesor => ({
            id_profesor: profesor.id_profesor,
            nombre_completo: getFullName(profesor.Persona),
            especialidad: profesor.especialidad,
            fecha_inscripcion: profesor.fecha_inscripcion,
            cedula: profesor.Persona.cedula,
            telefono: profesor.Persona.telefono,
            telefono_adicional: profesor.Persona.telefono_adicional,
            estado: profesor.estado,
            createAt: profesor.createdAt,
            updateAt: profesor.updatedAt,
            direccion: profesor.Persona.Direccion && {
                ...profesor.Persona.Direccion.toJSON()
            },
        }));

        return sendResponse({
            res,
            statusCode: HttpStatus.OK,
            message: req.t('success.RECOVERED_PROFESORS'),
            data: profesoresInfo
        });
    } catch (error) {

        return sendResponse({
            res,
            statusCode: error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
            message: error?.message || {
                message: req.t('error.RECOVERED_PROFESORS'),
                error: error.message,
                stack: error.stack
            }
        });
    }
};

exports.mostrarProfesoresActivos = async (req, res) => {
    try {
        const profesoresActivos = await Profesor.findAll({
            where: { estado: STATES.ACTIVE }, // Filtro para profesores activos
            include: [
                {
                    model: Persona,
                    attributes: [
                        TABLE_FIELDS.PRIMER_NOMBRE,
                        TABLE_FIELDS.SEGUNDO_NOMBRE,
                        TABLE_FIELDS.PRIMER_APELLIDO,
                        TABLE_FIELDS.SEGUNDO_APELLIDO,
                        TABLE_FIELDS.CEDULA,
                        TABLE_FIELDS.TELEFONO,
                        TABLE_FIELDS.TELEFONO_ADICIONAL
                    ],
                    include: [
                        {
                            model: Direccion,
                            attributes: [
                                TABLE_FIELDS.UID_DIRECCION,
                                TABLE_FIELDS.DIRECCION_EXACTA,
                                TABLE_FIELDS.CANTON,
                                TABLE_FIELDS.DISTRITO,
                                TABLE_FIELDS.LOCALIDAD,
                                TABLE_FIELDS.PROVINCIA,
                                TABLE_FIELDS.CREATED_AT,
                                TABLE_FIELDS.UPDATED_AT
                            ]
                        },
                        {
                            model: Usuario,
                        }
                    ]
                }
            ]
        });

        if (profesoresActivos.length === 0) {
            throw new CustomError(HttpStatus.NOT_FOUND, req.t('warning.NOT_PROFESORS_FOUND'));
        }

        const profesoresInfo = profesoresActivos.map(profesor => ({
            id_profesor: profesor.id_profesor,
            nombre_completo: getFullName(profesor.Persona),
            primer_nombre: profesor.Persona.primer_nombre,
            segundo_nombre: profesor.Persona.segundo_nombre,
            primer_apellido: profesor.Persona.primer_apellido,
            segundo_apellido: profesor.Persona.segundo_apellido,
            email: profesor.Persona.Usuario.email,
            especialidad: profesor.especialidad,
            fecha_inscripcion: profesor.fecha_inscripcion,
            cedula: profesor.Persona.cedula,
            telefono: profesor.Persona.telefono,
            telefono_adicional: profesor.Persona.telefono_adicional,
            estado: profesor.estado,
            createAt: profesor.createdAt,
            updateAt: profesor.updatedAt,
            direccion: profesor.Persona.Direccion && {
                ...profesor.Persona.Direccion.toJSON()
            },
        }));

        return sendResponse({
            res,
            statusCode: HttpStatus.OK,
            message: req.t('success.RECOVERED_PROFESORS'),
            data: profesoresInfo
        });
    } catch (error) {
        return sendResponse({
            res,
            statusCode: error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
            message: error?.message || {
                message: req.t('error.RECOVERED_PROFESORS'),
                error: error.message,
                stack: error.stack
            }
        });
    }
};

exports.mostrarProfesoresInactivos = async (req, res) => {
    try {
        const profesoresInactivos = await Profesor.findAll({
            where: { estado: STATES.INACTIVE }, // Filtro para profesores inactivos
            include: [
                {
                    model: Persona,
                    attributes: [
                        TABLE_FIELDS.PRIMER_NOMBRE,
                        TABLE_FIELDS.SEGUNDO_NOMBRE,
                        TABLE_FIELDS.PRIMER_APELLIDO,
                        TABLE_FIELDS.SEGUNDO_APELLIDO,
                        TABLE_FIELDS.CEDULA,
                        TABLE_FIELDS.TELEFONO,
                        TABLE_FIELDS.TELEFONO_ADICIONAL
                    ],
                    include: [
                        {
                            model: Direccion,
                            attributes: [
                                TABLE_FIELDS.UID_DIRECCION,
                                TABLE_FIELDS.DIRECCION_EXACTA,
                                TABLE_FIELDS.CANTON,
                                TABLE_FIELDS.DISTRITO,
                                TABLE_FIELDS.LOCALIDAD,
                                TABLE_FIELDS.PROVINCIA,
                                TABLE_FIELDS.CREATED_AT,
                                TABLE_FIELDS.UPDATED_AT
                            ]
                        },
                        {
                            model: Usuario,
                        }
                    ]
                }
            ]
        });

        if (profesoresInactivos.length === 0) {
            throw new CustomError(HttpStatus.NOT_FOUND, req.t('warning.NOT_PROFESORS_FOUND'));
        }

        const profesoresInfo = profesoresInactivos.map(profesor => ({
            id_profesor: profesor.id_profesor,
            nombre_completo: getFullName(profesor.Persona),
            primer_nombre: profesor.Persona.primer_nombre,
            segundo_nombre: profesor.Persona.segundo_nombre,
            primer_apellido: profesor.Persona.primer_apellido,
            segundo_apellido: profesor.Persona.segundo_apellido,
            email: profesor.Persona.Usuario.email,
            especialidad: profesor.especialidad,
            fecha_inscripcion: profesor.fecha_inscripcion,
            cedula: profesor.Persona.cedula,
            telefono: profesor.Persona.telefono,
            telefono_adicional: profesor.Persona.telefono_adicional,
            estado: profesor.estado,
            createAt: profesor.createdAt,
            updateAt: profesor.updatedAt,
            direccion: profesor.Persona.Direccion && {
                ...profesor.Persona.Direccion.toJSON()
            },
        }));

        return sendResponse({
            res,
            statusCode: HttpStatus.OK,
            message: req.t('success.RECOVERED_PROFESORS'),
            data: profesoresInfo
        });
    } catch (error) {
        return sendResponse({
            res,
            statusCode: error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
            message: error?.message || {
                message: req.t('error.RECOVERED_PROFESORS'),
                error: error.message,
                stack: error.stack
            }
        });
    }
};


// Función para eliminar (desactivar) un profesor
exports.desactivarProfesor = async (req, res) => {
    const { id_profesor } = req.body;
    const userId = req.session.user?.userId;

    try {
        const profesor = await Profesor.findByPk(id_profesor);

        if (!profesor) {
            throw new CustomError(HttpStatus.NOT_FOUND, req.t('warning.NOT_PROFESORS_FOUND'));
        }

        // Verificar si el profesor ya está desactivado
        if (profesor.estado == STATES.INACTIVE) {
            throw new CustomError(HttpStatus.BAD_REQUEST, req.t('warning.PROFESSOR_ALREADY_INACTIVE'));
        }

        // Cambiar el estado del profesor a inactivo
        profesor.estado = STATES.INACTIVE;
        await profesor.save();

        // Registrar en la tabla de auditoría
        await AuditLog.create({
            user_id: userId,
            action: 'Desactivación de Profesor',
            description: `El profesor con UID ${id_profesor} fue desactivado`,
        });

        return sendResponse({
            res,
            statusCode: HttpStatus.OK,
            message: req.t('success.PROFESSOR_DEACTIVATED'),
        });

    } catch (error) {
        return sendResponse({
            res,
            statusCode: error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
            message: error?.message || {
                message: req.t('error.DEACTIVATING_PROFESSOR'),
                error: error.message,
                stack: error.stack
            }
        });
    }
};

// Función para activar un profesor
exports.activarProfesor = async (req, res) => {
    const { id_profesor } = req.body;
    const userId = req.session.user?.userId;

    try {
        const profesor = await Profesor.findByPk(id_profesor);

        if (!profesor) {
            throw new CustomError(HttpStatus.NOT_FOUND, req.t('warning.NOT_PROFESORS_FOUND'));
        }

        // Verificar si el profesor ya está activado
        if (profesor.estado == STATES.ACTIVE) {
            throw new CustomError(HttpStatus.BAD_REQUEST, req.t('warning.PROFESSOR_ALREADY_ACTIVE'));
        }

        // Cambiar el estado del profesor a inactivo
        profesor.estado = STATES.ACTIVE;
        await profesor.save();

        // Registrar en la tabla de auditoría
        await AuditLog.create({
            user_id: userId,
            action: 'Activación de Profesor',
            description: `El profesor con UID ${id_profesor} fue activado`,
        });

        return sendResponse({
            res,
            statusCode: HttpStatus.OK,
            message: req.t('success.PROFESSOR_ACTIVATED'),
        });

    } catch (error) {
        return sendResponse({
            res,
            statusCode: error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
            message: error?.message || {
                message: req.t('error.ACTIVATING_PROFESSOR'),
                error: error.message,
                stack: error.stack
            }
        });
    }
};


exports.actualizarProfesor = async (req, res) => {
    const {
        id_profesor,
        primer_nombre,
        segundo_nombre,
        primer_apellido,
        segundo_apellido,
        telefono,
        telefono_adicional,
        especialidad,
    } = req.body;
    const userId = req.session.user?.userId;
    const transaction = await sequelize.transaction();
    try {
        // Buscar al profesor por ID
        const profesor = await Profesor.findByPk(id_profesor, {
            include: [
                {
                    model: Persona,
                    as: 'Persona',
                }
            ]
        });

        if (!profesor || profesor.estado !== STATES.ACTIVE) {
            throw new CustomError(HttpStatus.NOT_FOUND, req.t('warning.PROFESOR_NOT_FOUND'));
        }

        validateInput(primer_nombre, FIELDS.TEXT, req);
        validateInput(primer_apellido, FIELDS.TEXT, req);
        validateInput(segundo_apellido, FIELDS.CEDULA, req);
        validateInput(telefono, FIELDS.TELEFONO, req);
        validateInput(especialidad, FIELDS.TEXT, req);
        telefono_adicional && validateInput(telefono_adicional, FIELDS.TELEFONO, req);
        segundo_nombre && validateInput(segundo_nombre, FIELDS.TEXT, req);

        // Actualizar los campos del profesor y de persona
        await profesor.Persona.update({
            primer_nombre,
            segundo_nombre,
            primer_apellido,
            segundo_apellido,
            telefono,
            telefono_adicional
        }, { transaction });

        await profesor.update({ especialidad }, { transaction });

        // Registrar en la tabla de auditoría
        await AuditLog.create({
            user_id: userId,
            action: 'Actualización de Profesor',
            description: `Profesor con UID ${id_profesor} fue actualizado`,
        }, { transaction });

        const profesorInfo = {
            id_profesor: profesor.id_profesor,
            nombre_completo: getFullName(profesor.Persona),
            primer_nombre,
            segundo_nombre,
            primer_apellido,
            segundo_apellido,
            cedula: profesor.Persona.cedula,
            especialidad,
        };

        await transaction.commit();

        return sendResponse({
            res,
            statusCode: HttpStatus.OK,
            message: req.t('success.PROFESOR_UPDATED'),
            data: profesorInfo
        });
    } catch (error) {
        await transaction.rollback();
        return sendResponse({
            res,
            statusCode: error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
            message: error?.message || {
                message: req.t('error.UPDATING_PROFESOR'),
                error: error.message,
                stack: error.stack
            }
        });
    }
};