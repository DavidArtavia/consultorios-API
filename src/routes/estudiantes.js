const express = require('express');
const router = express.Router();
const estudianteController = require('../controllers/estudianteController');
const verificarSesion = require('../middlewares/auth');

// Ruta para obtener la información del estudiante y sus casos
router.post('/casos', verificarSesion, estudianteController.mostrarInformacionEstudiante);

module.exports = router;
