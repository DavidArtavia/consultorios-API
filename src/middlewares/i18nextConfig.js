const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const middleware = require('i18next-express-middleware');
const path = require('path');

i18next.use(Backend).use(middleware.LanguageDetector).init({
    backend: {
        loadPath: path.join(__dirname, 'translation/{{lng}}/trans{{lng}}.json'), // Ruta a los archivos de traducción
    },
    fallbackLng: 'es', // Idioma por defecto
    preload: ['es', 'en'], // Idiomas soportados
    detection: {
        order: ['header', 'querystring', 'cookie'],
        caches: ['cookie'], // Dónde almacenar el idioma detectado
    },
    debug: false, // Desactiva los mensajes de depuración en producción
});

module.exports = i18next;
