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
} = require('../controllers/estudianteController');

// Ruta para obtener la información del estudiante y sus casos
router.post(
    ROUTES.CASE,
    verifySession,
    verifyRole([
        ROL.SUPERADMIN,
        ROL.PROFESSOR,
        ROL.STUDENT]),
    mostrarInformacionEstudianteConCasos
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


router.get(
    ROUTES.SHOW,
    verifySession,
    verifyRole([
        ROL.SUPERADMIN,
        ROL.PROFESSOR
    ]),
    mostrarEstudiantes
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
