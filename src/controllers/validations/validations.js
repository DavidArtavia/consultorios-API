// Función de validación

const { MESSAGE_ERROR } = require("../../constants/constants");

const validateLoginInput = (email, password) => {
    const errors = [];
    if (!email) errors.push(MESSAGE_ERROR.EMAIL_IS_REQUIRED);
    if (!password) errors.push(MESSAGE_ERROR.PASSWORD_IS_REQUIRED);
    return errors;
};




module.exports = { validateLoginInput };