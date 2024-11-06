// routes/usuario.js
const express = require('express');
const router = express.Router();
const verifySession = require('../middlewares/auth');
const { ROL, ROUTES } = require('../constants/constants');
const { verifyRole } = require('../middlewares/verifyRole');
const {register} = require('../controllers/usuarioController');

router.post(
    ROUTES.REGISTER,
    verifySession,
    verifyRole([
    ROL.SUPERADMIN,
    ROL.PROFESSOR
    ]),
    register
);

module.exports = router;
