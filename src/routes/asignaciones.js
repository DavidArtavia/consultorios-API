const express = require('express');
const router = express.Router();
const asignacionController = require('../controllers/asignacionController');
const verifySession = require('../middlewares/auth');
const { verifyRole } = require('../middlewares/verifyRole');
const { ROL } = require('../constants/constants');

// Ruta para ver un estudiante y sus casos asignados
// router.get('/verEstudiante/:idEstudiante', asignacionController.mostrarEstudianteConCasos);

// Ruta para asignar un caso a un estudiante
router.post(
    '/asignar',
    verifySession,
    verifyRole([ROL.SUPERADMIN, ROL.PROFESSOR]),
    asignacionController.asignarCasoAEstudiante
);

module.exports = router;
