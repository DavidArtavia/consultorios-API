// routes/usuario.js
const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const verifySession = require('../middlewares/auth');
const { ROL } = require('../constants/constants');
const { verifyRole } = require('../middlewares/verifyRole');

router.post(
    '/register',
    // verifySession,
    // verifyRole([
    // ROL.SUPERADMIN,
    // ROL.PROFESSOR
    // ]),
    usuarioController.register);

module.exports = router;
