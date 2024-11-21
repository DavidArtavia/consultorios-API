// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const sequelize = require('./src/config/database');
const i18next = require('./src/middlewares/i18nextConfig');
const i18nextMiddleware = require('i18next-http-middleware');
const emailService = require('./src/services/emailService');

// rutas 
const apiRoutes = require('./src/routes');

const app = express();

// Configuración de CORS con opciones
const corsOptions = {
    origin: process.env.ORIGIN || true, // "true" permite todas las peticiones
    credentials: true, // Permite el intercambio de cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Métodos permitidos
    allowedHeaders: ['Content-Type', 'Authorization'], // Headers permitidos
};

app.use(cors(corsOptions));
app.use(express.json());

// Configurar la sesión con cookies de larga duración
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true, // Protege la cookie contra accesos desde JavaScript del lado del cliente
        secure: process.env.APP_ENV === 'PROD', // Usar solo HTTPS en producción
        maxAge: 1000 * 60 * 60 * 24 // 24 horas de duración
    }
}));

// Verificar conexión al iniciar
emailService.verificarConexion()
    .then(() => console.log('Servicio de email inicializado'))
    .catch(err => console.error('Error al inicializar servicio de email:', err));

// Middleware logger
const logger = (req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next(); // Pasa al siguiente middleware o ruta
};

//middeleware i18next
app.use(i18nextMiddleware.handle(i18next));
app.use(logger);

// Rutas
app.use('/api/v1', apiRoutes);




const port = process.env.PORT || 3000;

// Iniciar el servidor y conectar a la base de datos
sequelize.sync({ force: true })
    .then(() => {
        app.listen(port, () => {
            console.log(i18next.t('success.SERVER_RUNNING', { port }));
        });
    })
    .catch(err => {
        console.error(i18next.t('error.SERVER_ERROR'), err);
    });
