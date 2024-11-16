// routes/casos.js
const express = require('express');
const router = express.Router();
const verifySession = require('../middlewares/auth');
const { verifyRole } = require('../middlewares/verifyRole');
const { ROL, ROUTES } = require('../constants/constants');
const {
    asignarCasoAEstudiante,
    mostrarCasosAsignados,
    crearCaso,
    mostrarCasosNoAsignados,
    actualizarCaso,   
    desasignarCasoDeEstudiante
} = require('../controllers/casoController');

// Ruta para crear un caso
router.post(
    ROUTES.CREATE,
    verifySession,
    verifyRole([ROL.PROFESSOR, ROL.SUPERADMIN]),
    crearCaso
);

router.post(
    ROUTES.ASSIGN,
    verifySession,
    verifyRole([ROL.SUPERADMIN, ROL.PROFESSOR]),
    asignarCasoAEstudiante
);
router.post(
    ROUTES.DEASSIGN,
    verifySession,
    verifyRole([ROL.SUPERADMIN, ROL.PROFESSOR]),
    desasignarCasoDeEstudiante
);

router.get(
   ROUTES.SHOW_UNASSIGNED,
    verifySession,
    verifyRole([ROL.SUPERADMIN, ROL.PROFESSOR]),
    mostrarCasosNoAsignados
);

router.get(
    ROUTES.ASSIGNED,
    verifySession,
    verifyRole([ROL.SUPERADMIN, ROL.PROFESSOR]),
    mostrarCasosAsignados
);

router.put(
    ROUTES.UPDATE,
    verifySession,
    verifyRole([ROL.SUPERADMIN, ROL.PROFESSOR]),
    actualizarCaso
);

module.exports = router;
