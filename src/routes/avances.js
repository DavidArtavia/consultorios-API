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
        ROL.SUPERADMIN,
        ROL.PROFESSOR,
        ROL.STUDENT]),
    avanceController.crearAvance
);

module.exports = router;
