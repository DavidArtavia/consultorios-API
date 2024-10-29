// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const sequelize = require('./src/config/database');
const i18next = require('./src/middlewares/i18nextConfig');
const i18nextMiddleware = require('i18next-http-middleware'); 

// rutas 
const casosRoutes = require('./src/routes/casos');
const usuarioRoutes = require('./src/routes/usuario');
const estudiantesRoutes = require('./src/routes/estudiantes');
const profesoresRoutes = require('./src/routes/profesores');
const authRoutes = require('./src/routes/auth');
const personasRoutes = require('./src/routes/persona');
const avancesRoutes = require('./src/routes/avances');
const solicitudRoutes = require('./src/routes/solicitud');
const languageRoutes = require('./src/routes/language');

const app = express();

// Configuración de CORS con opciones
const corsOptions = {
    origin: true, // "true" permite todas las peticiones
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

// Middleware logger
const logger = (req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next(); // Pasa al siguiente middleware o ruta
};

//middeleware i18next
app.use(i18nextMiddleware.handle(i18next));
app.use(logger);

// Rutas
app.use('/api/v1/usuarios', usuarioRoutes);
app.use('/api/v1/casos', casosRoutes);
app.use('/api/v1/estudiantes', estudiantesRoutes);
app.use('/api/v1/profesores', profesoresRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/personas', personasRoutes);
app.use('/api/v1/avances', avancesRoutes);
app.use('/api/v1/solicitud', solicitudRoutes);
app.use('/api/v1/language', languageRoutes);


app.get('/api/v1/version', (req, res) => {
    res.send('v0.0.1');
});


const port = process.env.PORT || 3000;

// Iniciar el servidor y conectar a la base de datos
sequelize.sync({ force: true })
    .then(() => {
        app.listen(port, () => {
            console.log(`Servidor corriendo en el puerto ${port}`);
        });
    })
    .catch(err => {
        console.error('No se pudo conectar a la base de datos:', err);
    });
