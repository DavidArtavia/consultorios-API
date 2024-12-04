const express = require('express');
const router = express.Router();
const verifySession = require('../middlewares/auth');
const { verifyRole } = require('../middlewares/verifyRole');
const { ROL, ROUTES } = require('../constants/constants');
const { mostrarPersonasConUsuarios } = require('../controllers/personaController');

router.get(
    ROUTES.USERS,
    verifySession,
    verifyRole([
        ROL.SUPERADMIN,
        ROL.PROFESSOR,
        ROL.STUDENT
    ]),
    mostrarPersonasConUsuarios
);

module.exports = router;
