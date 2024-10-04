const { MESSAGE_ERROR, HttpStatus, FIELDS } = require("../constants/constants");
const { CustomError } = require("../handlers/responseHandler");

const getFullName = (persona) => {
    if (!persona) return null;
    return `${persona.primer_nombre} ${persona.segundo_nombre || ''} ${persona.primer_apellido} ${persona.segundo_apellido}`.trim();
};

const validateLoginInput = (email, password) => {
    const errors = [];
    if (!email) errors.push(MESSAGE_ERROR.EMAIL_IS_REQUIRED);
    if (!password) errors.push(MESSAGE_ERROR.PASSWORD_IS_REQUIRED);
    return errors;
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

const validateIfExists = async ({ model, field, value, errorMessage }) => {
    const existingRecord = await model.findOne({
        where: { [field]: value }
    });

    if (existingRecord) {
        throw new CustomError(HttpStatus.BAD_REQUEST, errorMessage || `Record with ${field} ${value} already exists.`);
    }
};

const validateName = (name) => {
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;  
    return nameRegex.test(name);
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


const validateInput = (input, field) => {
    switch (field) {
        case FIELDS.NAME:
            if (!validateName(input)) {
                throw new CustomError(HttpStatus.BAD_REQUEST, `--> ${input} Invalid name format. Only letters are allowed.`);
            }
            break;
        case FIELDS.ID:
            if (!validateID(input)) {
                throw new CustomError(HttpStatus.BAD_REQUEST, `--> ${input} Invalid ID format.`);
            }
            break;
        case FIELDS.EMAIL:
            if (!validateEmail(input)) {
                throw new CustomError(HttpStatus.BAD_REQUEST, `--> ${input} Invalid email format.`);
            }
            break;
        case FIELDS.NUMERIC:
            if (!validateNumericInput(input)) {
                throw new CustomError(HttpStatus.BAD_REQUEST, `--> ${input} Invalid numeric value.`);
            }
            break;
        case FIELDS.EXPEDIENTE:
            if (!validateExpediente(input)) {
                throw new CustomError(HttpStatus.BAD_REQUEST, `--> ${input} Invalid case number format.`);
            }
            break;
        case FIELDS.PHONE_NUMBER:
            if (!validatePhoneNumberCR(input)) {
                throw new CustomError(HttpStatus.BAD_REQUEST, `--> ${input} Invalid phone number format. The number must be 8 digits and start with 2, 5, 6, 7, or 8.`);
            }
            break;
        case FIELDS.CARNET:
            if (!validateCarnet(input)) {
                throw new CustomError(HttpStatus.BAD_REQUEST, `--> ${input} Invalid carnet format.`);
            }
            break;
    }
};


module.exports = {
    validateInput,
    getFullName,
    validateLoginInput,
    validateUpdatesInputs,
    validateIfExists
};
