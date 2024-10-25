const express = require('express');
const router = express.Router();
const verifySession = require('../middlewares/auth');
const { verifyRole } = require('../middlewares/verifyRole');
const { ROL } = require('../constants/constants');
const {
    mostrarInformacionEstudianteConCasos,
    actualizarEstudiante,
    mostrarEstudiantes,
    solicitarEliminarEstudiante,
} = require('../controllers/estudianteController');

// Ruta para obtener la información del estudiante y sus casos
router.post(
    '/casos',
    verifySession,
    verifyRole([
        ROL.SUPERADMIN,
        ROL.PROFESSOR,
        ROL.STUDENT]),
    mostrarInformacionEstudianteConCasos
);

router.put(
    '/actualizar',
    verifySession,
    verifyRole([
        ROL.SUPERADMIN,
        ROL.PROFESSOR
    ]),
    actualizarEstudiante
);


router.get(
    '/mostrar',
    verifySession,
    verifyRole([
        ROL.SUPERADMIN,
        ROL.PROFESSOR
    ]),
    mostrarEstudiantes
);


router.post(
    '/solicitar/eliminar',
    verifySession,
    verifyRole([
        ROL.SUPERADMIN,
        ROL.PROFESSOR
    ]),
    solicitarEliminarEstudiante
);

module.exports = router;
