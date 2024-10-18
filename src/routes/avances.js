// routes/avances.js
const express = require('express');
const avanceController = require('../controllers/avanceController');
const verifySession = require('../middlewares/auth');
const { verifyRole } = require('../middlewares/verifyRole');
const { ROL } = require('../constants/constants');
const router = express.Router();

// Ruta para crear un avance
router.post(
    '/crear',
    verifySession,
    verifyRole([
        ROL.STUDENT]),
    avanceController.crearAvance
);
router.get(
    '/caso',
    verifySession,
    verifyRole([
        ROL.PROFESSOR,
        ROL.SUPERADMIN,
        ROL.STUDENT]),
    avanceController.mostrarAvancesPorCaso
);
router.put(
    '/actualizar',
    verifySession,
    verifyRole([
        ROL.SUPERADMIN,
        ROL.STUDENT]),
    avanceController.actualizarAvance
);

module.exports = router;


