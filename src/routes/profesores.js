const express = require('express');
const router = express.Router();
const { mostrarProfesor } = require('../controllers/profesorController');
const verifySession = require('../middlewares/auth');
const { verifyRole } = require('../middlewares/verifyRole');
const { ROL } = require('../constants/constants');
const profesor = require('../models/profesor');

// Ruta para obtener la información del estudiante y sus casos
router.get(
    '/mostrar',
    verifySession,
    verifyRole([
        ROL.SUPERADMIN]),
    mostrarProfesor
);

module.exports = router;