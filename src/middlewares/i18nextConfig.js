// i18nextConfig.js
const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const middleware = require('i18next-http-middleware');
const path = require('path');

// Capitalizar el código de idioma
const capitalizeLng = (lng) => lng.charAt(0).toUpperCase() + lng.slice(1);

i18next.use(Backend).use(middleware.LanguageDetector).init({
    backend: {
        // Capitalizamos el código de idioma aquí antes de construir la ruta
        loadPath: path.join(__dirname, `../translation/{{lng}}/trans${capitalizeLng('{{lng}}')}.json`),
    },
    fallbackLng: 'es', // Idioma por defecto
    preload: ['es', 'en'], // Idiomas soportados
    detection: {
        order: ['cookie', 'header', 'querystring'],
        caches: ['cookie'], // Almacenar el idioma en cookies
        lookupCookie: 'lng',
    },
    supportedLngs: ['es', 'en'], // Lista de idiomas soportados
    debug: false // process.env.APP_ENV !== 'PROD', // Activa depuración solo en desarrollo

});

module.exports = i18next;
