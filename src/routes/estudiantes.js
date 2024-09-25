const express = require('express');
const router = express.Router();
const estudianteController = require('../controllers/estudianteController');
const verifySession = require('../middlewares/auth');
const { verifyRole } = require('../middlewares/verifyRole');
const { ROL } = require('../constants/constants');

// Ruta para obtener la información del estudiante y sus casos
router.post(
    '/casos',
    verifySession,
    verifyRole([
        ROL.SUPERADMIN,
        ROL.PROFESSOR,
        ROL.STUDENT]),
    estudianteController.mostrarInformacionEstudianteConCasos
);

router.put(
    '/actualizar',
    verifySession,
    verifyRole([
        ROL.SUPERADMIN,
        ROL.PROFESSOR
    ]),
    estudianteController.actualizarEstudiante
);


router.get(
    '/mostrar',
    verifySession,
    verifyRole([
        ROL.SUPERADMIN,
        ROL.PROFESSOR
    ]),
    estudianteController.mostrarEstudiantes
);

module.exports = router;
