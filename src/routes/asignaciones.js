const express = require('express');
const router = express.Router();
const asignacionController = require('../controllers/asignacionController');

// Ruta para ver un estudiante y sus casos asignados
// router.get('/verEstudiante/:idEstudiante', asignacionController.mostrarEstudianteConCasos);

// Ruta para asignar un caso a un estudiante
router.post('/asignar', asignacionController.asignarCasoAEstudiante);

module.exports = router;
