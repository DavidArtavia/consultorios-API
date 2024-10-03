// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const sequelize = require('./src/config/database');

// rutas 
const casosRoutes = require('./src/routes/casos');
const usuarioRoutes = require('./src/routes/usuario');
const estudiantesRoutes = require('./src/routes/estudiantes');
const profesoresRoutes = require('./src/routes/profesores');
const authRoutes = require('./src/routes/auth');
const personasRoutes = require('./src/routes/persona');

const app = express();
const router = express.Router();

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
        secure: process.env.NODE_ENV === 'production', // Usar solo HTTPS en producción
       // maxAge: 1000 * 60 * 60 * 24 // 24 horas de duración
    }
}));

// Rutas
app.use('/api/v1/usuarios', usuarioRoutes);
app.use('/api/v1/casos', casosRoutes);
app.use('/api/v1/estudiantes', estudiantesRoutes);
app.use('/api/v1/profesores', profesoresRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/personas', personasRoutes);


app.get('/api/v1/version', (req, res) => {
    res.send('v0.0.1');
  });


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
