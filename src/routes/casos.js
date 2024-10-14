// routes/casos.js
const express = require('express');
const router = express.Router();
const casoController = require('../controllers/casoController');
const verifySession = require('../middlewares/auth');
const { verifyRole } = require('../middlewares/verifyRole');
const { ROL } = require('../constants/constants');

// Ruta para crear un caso
router.post(
    '/crear',
    verifySession,
    verifyRole([ROL.PROFESSOR, ROL.SUPERADMIN]),
    casoController.crearCaso
);

router.post(
    '/asignar',
    verifySession,
    verifyRole([ROL.SUPERADMIN, ROL.PROFESSOR]),
    casoController.asignarCasoAEstudiante
);

router.get(
    '/noAsignados',
    verifySession,
    verifyRole([ROL.SUPERADMIN, ROL.PROFESSOR]),
    casoController.mostrarCasosNoAsignados
);

router.get(
    '/asignados',
    verifySession,
    verifyRole([ROL.SUPERADMIN, ROL.PROFESSOR]),
    casoController.mostrarCasosAsignados
);

module.exports = router;
