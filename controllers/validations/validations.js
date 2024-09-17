// Función de validación
const validateRegisterInput = (email, password, username) => {
    const errors = [];
    if (!email) errors.push('Email is required');
    if (!password) errors.push('Password is required');
    if (!username) errors.push('Username is required');
    return errors;
};
const validateLoginInput = (email, password) => {
    const errors = [];
    if (!email) errors.push('Email is required');
    if (!password) errors.push('Password is required');
    return errors;
};

function validateIfExists(existingUser) {

    if (existingUser) {
        const errors = [];
        if (existingUser.email === email) {
            errors.push('El correo electrónico ya está en uso.');
        }
        if (existingUser.username === username) {
            errors.push('El nombre de usuario ya está en uso.');
        }
        if (errors.length > 0) {
            return res.status(400).json({ ok: false, message: errors.join(', ') });
        }
    }
}



module.exports = { validateRegisterInput, validateLoginInput, validateIfExists };