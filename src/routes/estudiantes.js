const express = require('express');
const router = express.Router();
const estudianteController = require('../controllers/estudianteController');

// Ruta para obtener la información del estudiante y sus casos
router.get('/:idEstudiante/casos', estudianteController.mostrarInformacionEstudiante);

module.exports = router;
