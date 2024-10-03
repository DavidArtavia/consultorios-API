// Función de validación

const { MESSAGE_ERROR, HttpStatus } = require("../../constants/constants");
const { CustomError } = require("../../handlers/responseHandler");

const validateLoginInput = (email, password) => {
    const errors = [];
    if (!email) errors.push(MESSAGE_ERROR.EMAIL_IS_REQUIRED);
    if (!password) errors.push(MESSAGE_ERROR.PASSWORD_IS_REQUIRED);
    return errors;
};

const validateUpdatesInputs = async ({ currentValue, newValue, model, field, message }) => {
    // Si el valor ha cambiado, realiza la validación
    if (currentValue !== newValue) {
        const whereClause = {};
        whereClause[field] = newValue; // Asigna dinámicamente el campo a validar

        // Verifica si el nuevo valor ya existe en la base de datos
        const existing = await model.findOne({
            where: whereClause
        });

        if (existing) {
            throw new CustomError(HttpStatus.BAD_REQUEST, message);
        }
    }
}

const validateIfExists = async ({ model, field, value, table_name }) => {
    const existingRecord = await model.findOne({
        where: { [field]: value }  // Usamos una clave dinámica para el campo
    });

    if (existingRecord) {
        throw new CustomError(HttpStatus.BAD_REQUEST, errorMessage || `Record with ${field} ${value} already exists.`);
    }
};







module.exports = { validateLoginInput, validateUpdatesInputs, validateIfExists };