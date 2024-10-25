const express = require('express');
const router = express.Router();
const verifySession = require('../middlewares/auth');
const { verifyRole } = require('../middlewares/verifyRole');
const { ROL } = require('../constants/constants');
const { mostrarPersonasConUsuarios } = require('../controllers/personaController');

router.get(
    '/usuarios',
    verifySession,
    verifyRole([
        ROL.SUPERADMIN,
    ]),
    mostrarPersonasConUsuarios
);

module.exports = router;
