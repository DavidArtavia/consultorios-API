// routes/casos.js
const express = require('express');
const router = express.Router();
const verifySession = require('../middlewares/auth');
const { verifyRole } = require('../middlewares/verifyRole');
const { ROL } = require('../constants/constants');
const {
    asignarCasoAEstudiante,
    mostrarCasosAsignados,
    crearCaso,
    mostrarCasosNoAsignados,    
} = require('../controllers/casoController');

// Ruta para crear un caso
router.post(
    '/crear',
    verifySession,
    verifyRole([ROL.PROFESSOR, ROL.SUPERADMIN]),
    crearCaso
);

router.post(
    '/asignar',
    verifySession,
    verifyRole([ROL.SUPERADMIN, ROL.PROFESSOR]),
    asignarCasoAEstudiante
);

router.get(
    '/noAsignados',
    verifySession,
    verifyRole([ROL.SUPERADMIN, ROL.PROFESSOR]),
    mostrarCasosNoAsignados
);

router.get(
    '/asignados',
    verifySession,
    verifyRole([ROL.SUPERADMIN, ROL.PROFESSOR]),
    mostrarCasosAsignados
);

module.exports = router;
