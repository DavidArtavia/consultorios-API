// routes/avances.js
const express = require('express');
const verifySession = require('../middlewares/auth');
const { verifyRole } = require('../middlewares/verifyRole');
const { ROL } = require('../constants/constants');
const router = express.Router();
const {
    actualizarAvance,
    crearAvance,
    mostrarAvancesPorCaso,
} = require('../controllers/avanceController');

// Ruta para crear un avance
router.post(
    '/crear',
    verifySession,
    verifyRole([
        ROL.STUDENT]),
    crearAvance
);
router.post(
    '/caso',
    verifySession,
    verifyRole([
        ROL.PROFESSOR,
        ROL.SUPERADMIN,
        ROL.STUDENT]),
    mostrarAvancesPorCaso
);
router.put(
    '/actualizar',
    verifySession,
    verifyRole([
        ROL.SUPERADMIN,
        ROL.STUDENT]),
    actualizarAvance
);

module.exports = router;


