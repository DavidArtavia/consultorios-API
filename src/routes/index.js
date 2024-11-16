const express = require('express');
const router = express.Router();

// Importa todas las rutas aquí
const usuarioRoutes = require('./usuario');
const casosRoutes = require('./casos');
const estudiantesRoutes = require('./estudiantes');
const profesoresRoutes = require('./profesores');
const authRoutes = require('./auth');
const personasRoutes = require('./persona');
const avancesRoutes = require('./avances');
const solicitudRoutes = require('./solicitud');
const languageRoutes = require('./language');
const tseRoutes = require('./tseRoutes');

// Define todas las rutas con su prefijo
router.use('/usuarios', usuarioRoutes);
router.use('/casos', casosRoutes);
router.use('/estudiantes', estudiantesRoutes);
router.use('/profesores', profesoresRoutes);
router.use('/auth', authRoutes);
router.use('/personas', personasRoutes);
router.use('/avances', avancesRoutes);
router.use('/solicitud', solicitudRoutes);
router.use('/language', languageRoutes);
router.use('/consula', tseRoutes);
router.get('/version', (req, res) => {
    res.send('v0.0.1');
});

module.exports = router;
