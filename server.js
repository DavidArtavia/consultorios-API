// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const sequelize = require('./config/database');
const usuarioRoutes = require('./routes/usuario');
const casosRoutes = require('./routes/casos');

const app = express();

// Configuración de CORS
app.use(cors());

// Configuración de CORS con opciones
const corsOptions = {
    origin: '*', // Permite todas las origenes
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Métodos permitidos
    allowedHeaders: ['Content-Type', 'Authorization'], // Headers permitidos
};

app.use(cors(corsOptions));
app.use(express.json());

// Configurar la sesión con cookies de larga duración
app.use(session({
    secret: 'tu_secreto_de_sesion',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true, // Protege la cookie contra accesos desde JavaScript del lado del cliente
        secure: process.env.NODE_ENV === 'production', // Usar solo HTTPS en producción
        maxAge: 1000 * 60 * 60 * 24 * 30 // 30 días de duración
    }
}));

// Rutas
app.use('/api/v1/usuarios', usuarioRoutes);
app.use('/api/v1/casos', casosRoutes);



const port = process.env.PORT || 3000;

// Iniciar el servidor y conectar a la base de datos
sequelize.sync()
    .then(() => {
        app.listen(port, () => {
            console.log(`Servidor corriendo en el puerto ${port}`);
        });
    })
    .catch(err => {
        console.error('No se pudo conectar a la base de datos:', err);
    });
