// routes/avances.js
const express = require('express');
const verifySession = require('../middlewares/auth');
const { verifyRole } = require('../middlewares/verifyRole');
const { ROL, STATES, ROUTES } = require('../constants/constants');
const router = express.Router();
const {
    actualizarAvance,
    crearAvance,
    mostrarAvancesPorCaso,
} = require('../controllers/avanceController');

// Ruta para crear un avance
router.post(
    ROUTES.CREATE,
    verifySession,
    verifyRole([
        ROL.STUDENT]),
    crearAvance
);
router.post(
    ROUTES.CASE,
    verifySession,
    verifyRole([
        ROL.PROFESSOR,
        ROL.SUPERADMIN,
        ROL.STUDENT]),
    mostrarAvancesPorCaso
);
router.put(
    ROUTES.UPDATE,
    verifySession,
    verifyRole([
        ROL.SUPERADMIN,
        ROL.STUDENT]),
    actualizarAvance
);

module.exports = router;


