const { Op } = require("sequelize");
const { MESSAGE_ERROR, HttpStatus, FIELDS } = require("../constants/constants");
const { CustomError } = require("../handlers/responseHandler");
const { Usuario, Caso, AsignacionDeCaso } = require("../models");
const bcrypt = require("bcryptjs/dist/bcrypt");

const getFullName = (persona) => {
    if (!persona) return null;
    return `${persona.primer_nombre} ${persona.segundo_nombre || ''} ${persona.primer_apellido} ${persona.segundo_apellido}`.trim();
};

const validateIfExists = async ({ model, field, value, errorMessage }) => {
    const existingRecord = await model.findOne({
        where: { [field]: value }
    });

    if (existingRecord) {
        throw new CustomError(HttpStatus.BAD_REQUEST, errorMessage || `Record with ${field} ${value} already exists.`);
    }
};
const validateIfUserExists = async ({ model, field, value, errorMessage }) => {
    const existingRecord = await model.findOne({
        where: { [field]: value }
    });

    if (!existingRecord) {
        throw new CustomError(HttpStatus.BAD_REQUEST, errorMessage || `Record with ${field} ${value} already exists.`);
    } else {
        return existingRecord;
    }
};
const validateExistingUser = async (username, email) => {
    const existingUser = await Usuario.findOne({
        where: {
            [Op.or]: [{ email }, { username }]
        }
    });
    if (existingUser) {
        if (existingUser.email === email) {
            throw new CustomError(HttpStatus.OK, MESSAGE_ERROR.EMAIL_ALREADY_USED);
        }
        if (existingUser.username === username) {
            throw new CustomError(HttpStatus.OK, MESSAGE_ERROR.USERNAME_ALREADY_USED);
        }
    }
};

const validateCaseAssignedToStudent = async (id_caso, id_estudiante) => {
    const caso = await AsignacionDeCaso.findOne({
        where: { id_caso, id_estudiante },
        include: [Caso],

    });

    if (!caso) {
        throw new CustomError(HttpStatus.NOT_FOUND, MESSAGE_ERROR.NO_CASE_ASSIGNED);
    }
    return caso;
};

const validateRoleChange = (sessionRole, requestedRole) => {
    if (sessionRole === requestedRole) {
        throw new CustomError(HttpStatus.FORBIDDEN, MESSAGE_ERROR.WITHOUT_PERMISSION);
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


const validatePasswordHash = async (password, userPasswordHash) => {

    const passwordMatch = await bcrypt.compare(password, userPasswordHash);
    if (!passwordMatch) {
        // Si la contraseña no coincide, lanza un error personalizado
        throw new CustomError(HttpStatus.BAD_REQUEST, MESSAGE_ERROR.INVALID_PASSWORD);
    }
}

const validateText = (text) => {
    const textRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
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

const validateUniqueCedulas = (clienteCedula, contraparteCedula, subsidiarioCedula) => {
    if (subsidiarioCedula) {
        if (subsidiarioCedula === clienteCedula) {
            throw new CustomError(HttpStatus.BAD_REQUEST, MESSAGE_ERROR.SUBSIDIARY_CLIENT_SAME_ID);
        }
        if (subsidiarioCedula === contraparteCedula) {
            throw new CustomError(HttpStatus.BAD_REQUEST, MESSAGE_ERROR.SUBSIDIARY_COUNTERPART_SAME_ID);
        }
    }
    if (clienteCedula === contraparteCedula) {
        throw new CustomError(HttpStatus.BAD_REQUEST, MESSAGE_ERROR.CLIENT_COUNTERPART_SAME_ID);
    }
};

const validateInput = (input, field) => {
    switch (field) {
        case FIELDS.TEXT:
            if (!validateText(input)) {
                throw new CustomError(HttpStatus.BAD_REQUEST, `--> ${input} <--  Invalid ${FIELDS.TEXT} format. Only letters are allowed.`);
            }
            break;
        case FIELDS.ID:
            if (!validateID(input)) {
                throw new CustomError(HttpStatus.BAD_REQUEST, `--> ${input} <-- Invalid ${FIELDS.ID} format.`);
            }
            break;
        case FIELDS.EMAIL:
            if (!validateEmail(input)) {
                throw new CustomError(HttpStatus.BAD_REQUEST, `--> ${input} <-- Invalid ${FIELDS.EMAIL} format.`);
            }
            break;
        case FIELDS.PASSWORD:
            if (!validatePassword(input)) {
                throw new CustomError(HttpStatus.BAD_REQUEST, `--> ${input} <-- Invalid ${FIELDS.PASSWORD} format. Password must be at least 8 characters long, contain one uppercase letter, one lowercase letter, one number, and one special character.`);

            }
            break;
        case FIELDS.NUMERIC:
            if (!validateNumericInput(input)) {
                throw new CustomError(HttpStatus.BAD_REQUEST, `--> ${input} <-- Invalid ${FIELDS.NUMERIC} value.`);
            }
            break;
        case FIELDS.EXPEDIENTE:
            if (!validateExpediente(input)) {
                throw new CustomError(HttpStatus.BAD_REQUEST, `--> ${input} <-- Invalid ${FIELDS.EXPEDIENTE} number format.`);
            }
            break;
        case FIELDS.PHONE_NUMBER:
            if (!validatePhoneNumberCR(input)) {
                throw new CustomError(HttpStatus.BAD_REQUEST, `--> ${input} <-- Invalid ${FIELDS.PHONE_NUMBER} format. The number must be 8 digits and start with 2, 5, 6, 7, or 8.`);
            }
            break;
        case FIELDS.CARNET:
            if (!validateCarnet(input)) {
                throw new CustomError(HttpStatus.BAD_REQUEST, `--> ${input} <-- Invalid ${FIELDS.CARNET} format.`);
            }
            break;
    }
};


module.exports = {
    validateInput,
    getFullName,
    validateUpdatesInputs,
    validateIfExists,
    validateExistingUser,
    validateRoleChange,
    validateIfUserExists,
    validatePasswordHash,
    validateUniqueCedulas,
    validateCaseAssignedToStudent
};
