const { Op } = require("sequelize");
const { MESSAGE_ERROR, HttpStatus, FIELDS, ROL } = require("../constants/constants");
const { CustomError } = require("../handlers/responseHandler");
const { Usuario, Caso, AsignacionDeCaso, Avance, Estudiante, SolicitudConfirmacion, Persona } = require("../../models");
const bcrypt = require("bcryptjs/dist/bcrypt");

const getFullName = (persona) => {
    const {
        primer_nombre,
        segundo_nombre = '',
        primer_apellido,
        segundo_apellido
    } = persona;

    if (!primer_nombre || !primer_apellido || !segundo_apellido) return null;

    const fullName = [
        primer_nombre,
        segundo_nombre,
        primer_apellido,
        segundo_apellido
    ].filter(Boolean).join(' ');

    return fullName.trim();
};

const findStudentByPk = async (id_estudiante, req) => {

    const estudiante = await Estudiante.findByPk(id_estudiante, {
        include: [Persona]
    });

    if (!estudiante) {
        throw new CustomError(HttpStatus.NOT_FOUND, req.t('warning.STUDENT_NOT_FOUND'));
    }

    return estudiante;
};
const findConfirmationRequestById = async (id_solicitud, req) => {

    const solicitud = await SolicitudConfirmacion.findByPk(id_solicitud, {
        include: [Estudiante, Caso] // Asegúrate que se incluyan las referencias necesarias
    });

    if (!solicitud) {
        throw new CustomError(HttpStatus.NOT_FOUND, req.t('warning.REQUEST_NOT_FOUND'));
    }

    return solicitud;
};

const checkStudentAssignmentsAndProgress = async (id_estudiante, transaction) => {

    // Check if the student has associated progress
    const avance = await Avance.findAll({ where: { id_estudiante: id_estudiante }, transaction });
    if (avance.length > 0) {
        console.log('Desarrollar la logica para ver que hacer con los avances');

        // se puiede eliminar un estudiante que no haya hecho ningun avance 
        //Agregar un enum de activo inactivo Finalisado en estudiante
    }

    // Check if the student has case assignments
    const asignacion = await AsignacionDeCaso.findAll({ where: { id_estudiante: id_estudiante }, transaction });
    if (asignacion.length > 0) {
        for (const asignacion of asignacion) {
            await asignacion.destroy({ transaction });
        }
    }
};


const validateIfUserIsTeacher = (userRole, req) => {

    if (userRole !== ROL.PROFESSOR) {
        throw new CustomError(HttpStatus.FORBIDDEN, req.t('warning.WITHOUT_PERMISSION', { userRole }));
    }
};

const validateIfExists = async ({ model, field, value, errorMessage }) => {
    const existingRecord = await model.findOne({
        where: { [field]: value }
    });

    if (existingRecord) {
        throw new CustomError(HttpStatus.BAD_REQUEST, errorMessage);
    }
};
const validateIfUserExists = async ({ model, field, value, errorMessage }) => {

    const existingRecord = await model.findOne({
        where: { [field]: value }
    });

    if (!existingRecord) {
        throw new CustomError(HttpStatus.BAD_REQUEST, errorMessage);
    } else {
        return existingRecord;
    }
};
const validateExistingUser = async (username, email, req) => {
    const existingUser = await Usuario.findOne({
        where: {
            [Op.or]: [{ email }, { username }]
        }
    });
    if (existingUser) {
        if (existingUser.email === email) {
            throw new CustomError(HttpStatus.OK, req.t('warning.EMAIL_ALREADY_USED'));
        }
        if (existingUser.username === username) {
            throw new CustomError(HttpStatus.OK, req.t('warning.USERNAME_ALREADY_USED'));
        }
    }
};

const validateCaseAssignedToStudent = async (id_caso, id_estudiante, req) => {
    const caso = await AsignacionDeCaso.findOne({
        where: { id_caso, id_estudiante },
        include: [Caso],

    });

    if (!caso) {
        throw new CustomError(HttpStatus.NOT_FOUND, req.t('warning.NO_CASE_ASSIGNED'));
    }
    return caso;
};


const validateRoleChange = (sessionRole, requestedRole, req) => {
    if (sessionRole === requestedRole) {
        throw new CustomError(HttpStatus.FORBIDDEN, req.t('warning.WITHOUT_PERMISSION', { userRole }));
    }
};

const validateUpdatesInputs = async ({ currentValue, newValue, model, field, message }) => {
    if (currentValue !== newValue) {
        const whereClause = {};
        whereClause[field] = newValue;

        const existing = await model.findOne({
            where: whereClause
        });

        if (existing) {
            throw new CustomError(HttpStatus.BAD_REQUEST, message);
        }
    }
}


const validatePasswordHash = async (password, userPasswordHash, req) => {

    const passwordMatch = await bcrypt.compare(password, userPasswordHash);
    if (!passwordMatch) {
        // Si la contraseña no coincide, lanza un error personalizado
        throw new CustomError(HttpStatus.BAD_REQUEST, req.t('warning.INVALID_PASSWORD'));
    }
}

const validateText = (text) => {
    const textRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    return textRegex.test(text);
};

const validateTextWithSpaces = (text) => {
    const textRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,'()-]+$/;
    return textRegex.test(text);
};

const validateID = (id) => {
    const idRegex = /^(\d{9}|\d{1}-\d{4}-\d{4}|[a-zA-Z0-9]+)$/;
    return idRegex.test(id);
};

const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        return false;
    }

    const validDomains = [
        'gmail.com',
        "ucr.ac.cr",
        'yahoo.com',
        'hotmail.com',
        'outlook.com',
        'icloud.com',
        'aol.com',
        'zoho.com',
        'protonmail.com',
        'mail.com',
        'gmx.com',
        'yandex.com',
        'live.com',
        'me.com',
        'msn.com',
        'rocketmail.com',
        'qq.com',
        'naver.com',
        '163.com',
        'sina.com',
        'rediffmail.com',
        'libero.it',
        'virgilio.it',
        'uol.com.br',
        'bol.com.br',
        'terra.com.br',
        'web.de',
        'mail.ru'
    ];

    const emailDomain = email.split('@')[1];

    if (!validDomains.includes(emailDomain)) {
        return false;
    }

    return true;
};

const validateNumericInput = (input) => {
    return !isNaN(parseFloat(input)) && isFinite(input);
};

const validateExpediente = (expediente) => {
    const expedienteRegex = /^\d{2}-\d{6}-\d{3,4}-[A-Z]{2}(?:-\d)?$/;
    return expedienteRegex.test(expediente);
};

const validateCarnet = (carnet) => {
    const carnetRegex = /^[A-Z]\d{5}$/; // Formato: Una letra en mayúscula seguida de 5 dígitos
    return carnetRegex.test(carnet);
};

const validatePhoneNumberCR = (phoneNumber) => {
    // Expresión regular para teléfonos fijos (inician con 2) y celulares (inician con 5, 6, 7, 8)
    const phoneRegex = /^[25678]\d{7}$/;
    return phoneRegex.test(phoneNumber)
};

const validatePassword = (password) => {
    // Expresión regular para la contraseña segura
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    return passwordRegex.test(password);
};

const validateUniqueCedulas = (clienteCedula, contraparteCedula, subsidiarioCedula, req) => {

    if (subsidiarioCedula) {
        if (subsidiarioCedula === clienteCedula) {
            console.log(req.t('warning.SAME_ID_ID_CONFLICT', {
                entity1: req.t('person.CLIENT'),
                entity2: req.t('person.SUBSIDIARY')
            }));
            throw new CustomError(HttpStatus.BAD_REQUEST, req.t('warning.SAME_ID_ID_CONFLICT', {
                entity1: req.t('person.CLIENT'),
                entity2: req.t('person.SUBSIDIARY')
            }));
        }
        if (subsidiarioCedula === contraparteCedula) {
            throw new CustomError(HttpStatus.BAD_REQUEST, req.t('warning.SAME_ID_ID_CONFLICT', {
                entity1: req.t('person.COUNTERPART'),
                entity2: req.t('person.SUBSIDIARY')
            }));
        }
    }
    if (clienteCedula === contraparteCedula) {
        throw new CustomError(HttpStatus.BAD_REQUEST, req.t('warning.SAME_ID_ID_CONFLICT', {
            entity1: req.t('person.CLIENT'),
            entity2: req.t('person.COUNTERPART')
        }));
    }
};

const validateInput = (input, field, req) => {
    switch (field) {
        case FIELDS.TEXT:
            if (!validateText(input)) {
                throw new CustomError(HttpStatus.BAD_REQUEST, req.t('validation.INVALID_TEXT_FORMAT', { data: input }));
            }
            break;
        case FIELDS.TEXTBOX:
            if (!validateTextWithSpaces(input)) {
                throw new CustomError(HttpStatus.BAD_REQUEST, req.t('validation.INVALID_TEXTBOX_FORMAT', { data: input }));
            }
            break;
        case FIELDS.ID:
            if (!validateID(input)) {
                throw new CustomError(HttpStatus.BAD_REQUEST, req.t('validation.INVALID_ID_FORMAT', { data: input }));
            }
            break;
        case FIELDS.EMAIL:
            if (!validateEmail(input)) {
                throw new CustomError(HttpStatus.BAD_REQUEST, req.t('validation.INVALID_EMAIL_FORMAT', { data: input }));
            }
            break;
        case FIELDS.PASSWORD:
            if (!validatePassword(input)) {
                throw new CustomError(HttpStatus.BAD_REQUEST, req.t('validation.INVALID_PASSWORD_FORMAT', { data: input }));
            }
            break;
        case FIELDS.NUMERIC:
            if (!validateNumericInput(input)) {
                throw new CustomError(HttpStatus.BAD_REQUEST, req.t('validation.INVALID_NUMERIC_FORMAT', { data: input }));
            }
            break;
        case FIELDS.EXPEDIENTE:
            if (!validateExpediente(input)) {
                throw new CustomError(HttpStatus.BAD_REQUEST, req.t('validation.INVALID_EXPEDIENTE_FORMAT', { data: input }));
            }
            break;
        case FIELDS.PHONE_NUMBER:
            if (!validatePhoneNumberCR(input)) {
                throw new CustomError(HttpStatus.BAD_REQUEST, req.t('validation.INVALID_PHONE_NUMBER_FORMAT', { data: input }));
            }
            break;
        case FIELDS.CARNET:
            if (!validateCarnet(input)) {
                throw new CustomError(HttpStatus.BAD_REQUEST, req.t('validation.INVALID_CARNET_FORMAT', { data: input }));
            }
            break;
    }
};


module.exports = {
    findStudentByPk,
    validateInput,
    getFullName,
    validateUpdatesInputs,
    validateIfExists,
    validateExistingUser,
    validateRoleChange,
    validateIfUserExists,
    validatePasswordHash,
    validateUniqueCedulas,
    validateCaseAssignedToStudent,
    validateIfUserIsTeacher,
    checkStudentAssignmentsAndProgress,
    findConfirmationRequestById
};
