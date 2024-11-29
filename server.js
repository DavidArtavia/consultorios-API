// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const sequelize = require('./src/config/database');
const i18next = require('./src/middlewares/i18nextConfig');
const i18nextMiddleware = require('i18next-http-middleware');
const emailService = require('./src/services/emailService');
const { TIME, ENV } = require('./src/constants/constants');
// rutas 
const apiRoutes = require('./src/routes');

const app = express();

// Configuración de CORS con opciones
const corsOptions = {
    origin: process.env.ORIGIN || 'http://localhost:5173',
    credentials: true, // Permite el intercambio de cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Métodos permitidos
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language'],
    exposedHeaders: ['set-cookie'],
};

app.use(cors(corsOptions));

// Si estamos en producción y usando secure cookies
if (process.env.APP_ENV === 'PROD') {
    app.set('trust proxy', 1); // Confiar en el primer proxy
}
// Configurar la sesión con cookies de larga duración
const sessionConfig = {
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.APP_ENV === ENV.PROD,
        sameSite: process.env.APP_ENV === ENV.PROD ? 'none' : 'lax', // Importante para CORS
        maxAge: TIME.DAY, // 24 horas
        path: '/'
    },
};


app.use(session(sessionConfig));
app.use(express.json());

// Middleware para debug de sesiones
app.use((req, res, next) => {
    // console.log('Session ID:', req.sessionID);
    // console.log('Session Data:', req.session);
    next();
});
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
