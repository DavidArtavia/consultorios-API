const { Op } = require("sequelize");
const { MESSAGE_ERROR, HttpStatus, FIELDS, ROL, STATES, TABLE_FIELDS } = require("../constants/constants");
const { CustomError } = require("../handlers/responseHandler");
const { Usuario, Caso, AsignacionDeCaso, Estudiante, Profesor, SolicitudConfirmacion, Persona, Direccion } = require("../../models");
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
const generateTempPassword = () => {
    // Definir caracteres permitidos
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    const length = 10; // Longitud de la contraseña
    let password = '';

    // Generar contraseña aleatoria
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        password += chars[randomIndex];
    }

    return password;
};
const updateRelatedEntity = async (Model, data, transaction, uid, req) => {



    if (!uid) {
        throw new CustomError(HttpStatus.BAD_REQUEST, req.t('warning.UID_IS_REQUIRED'));
    }
    const entity = await Model.findByPk(uid, { transaction });
    if (!entity) {
        throw new CustomError(HttpStatus.NOT_FOUND, req.t('warning.ENTITY_NOT_FOUND'));
    }
    await entity.update(data, { transaction });
};

const updatePersonAndAddress = async (personData, transaction, id_persona, req) => {
    if (!id_persona) {
        throw new CustomError(HttpStatus.BAD_REQUEST, req.t('warning.UID_IS_REQUIRED'));
    }
    const person = await Persona.findByPk(id_persona, { transaction });
    if (!person) {
        throw new CustomError(HttpStatus.NOT_FOUND, 'Person not found');
    }
    await person.update(personData, { transaction });

    // Update the address if present
    if (personData.Direccion) {
        if (!person.id_persona) {
            throw new CustomError(HttpStatus.BAD_REQUEST, 'Person ID is required');
        }
        await Direccion.update(
            { ...personData.Direccion },
            { where: { id_persona: person.id_persona } },
            { transaction });
    };
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
const findPersonById = async (cedula, req) => {

    const persona = await Persona.findOne({
        where: { cedula }
    });

    if (!persona) {
        throw new CustomError(HttpStatus.NOT_FOUND, req.t('warning.NOT_PERSON_FOUND'));
    }

    return persona;
};

const findConfirmationRequestById = async (id_solicitud, req) => {

    const solicitud = await SolicitudConfirmacion.findOne({
        where: { id_solicitud },
        include: [
            {
                model: Estudiante,
                include: [{
                    model: Persona
                }]
            },
            {
                // Incluir los datos del profesor que creó la solicitud
                model: Persona,
                as: 'Creador',
                foreignKey: 'createdBy',
                include: [{
                    model: Usuario,
                    attributes: ['email']
                }]
            }
        ]
    });

    if (!solicitud) {
        throw new CustomError(HttpStatus.NOT_FOUND, req.t('warning.REQUEST_NOT_FOUND'));
    }

    return solicitud;
};

const checkStudentAssignments = async (id_estudiante, transaction) => {

    // Check if the student has case assignments
    const asignaciones = await AsignacionDeCaso.findAll({ where: { id_estudiante: id_estudiante }, transaction });
    if (asignaciones && asignaciones.length > 0) {
        for (const asign of asignaciones) {
            // Lógica de eliminación de asignaciones
            await asign.destroy({ transaction });

            // Actualiza el estado del caso si es necesario
            const caso = await Caso.findByPk(asign.id_caso, { transaction });
            if (caso) {
                await caso.update({ estado: STATES.ACTIVE }, { transaction });
            }
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
    const textRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9.,'"?*¿¡!/:;&=#)(\s-]+$/;

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
        'mail.ru',
        "cpaurl.com"
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

// const validatePassword = (password) => {
//     // Expresión regular para la contraseña segura
//     const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

//     return passwordRegex.test(password);
// };

const validatePassword = (password) => {
    // Agregamos el punto (.) a los caracteres especiales permitidos
    const rules = {
        minLength: password.length >= 8,
        hasLower: /[a-z]/.test(password),
        hasUpper: /[A-Z]/.test(password),
        hasNumber: /\d/.test(password),
        hasSpecial: /[@$!%*?&.]/.test(password)  // Agregado el punto
    };

    return Object.values(rules).every(rule => rule);
};

const validateUniqueCedulas = (clienteCedula, contraparteCedula, subsidiarioCedula, req) => {

    if (subsidiarioCedula) {
        if (subsidiarioCedula == clienteCedula) {
            throw new CustomError(HttpStatus.BAD_REQUEST, req.t('warning.SAME_ID_ID_CONFLICT', {
                entity1: req.t('person.CLIENT'),
                entity2: req.t('person.SUBSIDIARY')
            }));
        }
        if (subsidiarioCedula == contraparteCedula) {
            throw new CustomError(HttpStatus.BAD_REQUEST, req.t('warning.SAME_ID_ID_CONFLICT', {
                entity1: req.t('person.COUNTERPART'),
                entity2: req.t('person.SUBSIDIARY')
            }));
        }
    }
    if (clienteCedula == contraparteCedula) {
        throw new CustomError(HttpStatus.BAD_REQUEST, req.t('warning.SAME_ID_ID_CONFLICT', {
            entity1: req.t('person.CLIENT'),
            entity2: req.t('person.COUNTERPART')
        }));
    }
};

const validateGenderCharacter = (character) => {
    const allowedCharacters = /^[MF]$/;
    return allowedCharacters.test(character);
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
        case FIELDS.CHAR:
            if (!validateGenderCharacter(input)) {
                throw new CustomError(HttpStatus.BAD_REQUEST, req.t('validation.INVALID_GENDER_CHARACTER', { data: input }));
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

const checkUserStatus = async (user, req, next) => {
    let model, idField, notFoundMessage, inactiveMessage;

    switch (user.rol) {
        case ROL.PROFESSOR:
            model = Profesor;
            idField = TABLE_FIELDS.UID_PROFESOR;
            notFoundMessage = req.t('warning.PROFESSOR_NOT_FOUND');
            inactiveMessage = req.t('warning.INACTIVE_PROFESSOR');
            break;
        case ROL.STUDENT:
            model = Estudiante;
            idField = TABLE_FIELDS.UID_ESTUDIANTE;
            notFoundMessage = req.t('warning.STUDENT_NOT_FOUND');
            inactiveMessage = req.t('warning.INACTIVE_STUDENT');
            break;
        default:
            return next();
    }

    const userData = await model.findOne({ where: { [idField]: user.id_persona } });

    if (!userData) {
        throw new CustomError(HttpStatus.NOT_FOUND, notFoundMessage);
    }

    if (userData.estado !== STATES.ACTIVE) {
        throw new CustomError(HttpStatus.BAD_REQUEST, inactiveMessage);
    }
};

module.exports = {
    checkUserStatus,
    findStudentByPk,
    findPersonById,
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
    checkStudentAssignments,
    findConfirmationRequestById,
    updateRelatedEntity,
    updatePersonAndAddress,
    generateTempPassword
};
