const express = require('express');
const router = express.Router();
const verifySession = require('../middlewares/auth');
const { verifyRole } = require('../middlewares/verifyRole');
const { ROL, ROUTES } = require('../constants/constants');
const {
    mostrarInformacionEstudianteConCasos,
    actualizarEstudiante,
    mostrarEstudiantes,
    solicitarEliminarEstudiante,
    mostrarEstudiantesActivos,
    mostrarEstudiantesInactivos,
    desactivarEstudiante,
    activarEstudiante, 
    actualizarCaso
} = require('../controllers/estudianteController');

// Ruta para obtener la información del estudiante y sus casos
router.post(
    ROUTES.CASES,
    verifySession,
    verifyRole([
        ROL.SUPERADMIN,
        ROL.PROFESSOR,
        ROL.STUDENT]),
    mostrarInformacionEstudianteConCasos
);
router.post(
    ROUTES.UPDATE_CASE,
    verifySession,
    verifyRole([
        ROL.SUPERADMIN,
        ROL.STUDENT]),
    actualizarCaso
);
router.post(
    ROUTES.DELETE,
    verifySession,
    verifyRole([ROL.SUPERADMIN,]),
    desactivarEstudiante
);
router.post(
    ROUTES.ACTIVATE,
    verifySession,
    verifyRole([ROL.SUPERADMIN,]),
    activarEstudiante
);

router.get(
    ROUTES.SHOW,
    verifySession,
    verifyRole([
        ROL.SUPERADMIN,
        ROL.PROFESSOR,
        ROL.STUDENT
    ]),
    mostrarEstudiantes
);

router.get(
    ROUTES.SHOW_ACTIVE,
    verifySession,
    verifyRole([
        ROL.SUPERADMIN,
        ROL.PROFESSOR,
        ROL.STUDENT
    ]),
    mostrarEstudiantesActivos
);

router.get(
    ROUTES.SHOW_INACTIVE,
    verifySession,
    verifyRole([
        ROL.SUPERADMIN,
        ROL.PROFESSOR
    ]),
    mostrarEstudiantesInactivos
);

router.put(
    ROUTES.UPDATE,
    verifySession,
    verifyRole([
        ROL.SUPERADMIN,
        ROL.PROFESSOR
    ]),
    actualizarEstudiante
);

router.post(
    ROUTES.REQUEST_DELETE,
    verifySession,
    verifyRole([
        ROL.SUPERADMIN,
        ROL.PROFESSOR
    ]),
    solicitarEliminarEstudiante
);

module.exports = router;
