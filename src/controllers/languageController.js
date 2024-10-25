// languageController.js
const { CustomError, sendResponse } = require('../handlers/responseHandler');
const { HttpStatus, KEYS, ENV, TIME, LANGUAGES } = require('../constants/constants');

// Cambiar idioma y guardar en una cookie
exports.changeLanguage = (req, res) => {
    const { language } = req.body; // Esperamos que el cliente envíe el idioma en el cuerpo de la solicitud (e.g., { "lng": "en" })
    try {
        const lng = language?.toLowerCase();

        // Validar si el idioma es válido
        if (!lng || (lng !== LANGUAGES.SPANISH && lng !== LANGUAGES.ENGLISH)) {
            throw new CustomError(HttpStatus.BAD_REQUEST, req.t('error.INVALID_LANGUAGE'));
        }

        // Cambiar el idioma en la sesión actual de i18next
        req.i18n.changeLanguage(lng);

        // Crear una cookie para almacenar el idioma
        res.cookie(KEYS.LANGUAGE, lng, {
            httpOnly: false,
            secure: process.env.APP_ENV == ENV.PROD,
            maxAge: TIME.DAY, // Almacenar por un día
        });

        // Responder al cliente confirmando el cambio de idioma
        return sendResponse({
            res,
            statusCode: HttpStatus.OK,
            message: req.t('success.CHANGE_LANGUAGE'),
            data: { lng }
        });

    } catch (error) {
        return sendResponse({
            res,
            statusCode: error?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
            message: error?.message || {
                message: req.t('error.CHANGING_LANGUAGE'),
                error: error.message,
                stack: error.stack
            }
        });
    }
};
