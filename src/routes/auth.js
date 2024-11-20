// routes/auth.js
const express = require('express');
const router = express.Router();
const {
    login,
    logout,
    cambiarContrasenaInicial,
    solicitarRecuperacionContrasena,
} = require('../controllers/authController');
const { ROUTES } = require('../constants/constants');
router.post(ROUTES.LOGIN, login);
router.post(ROUTES.LOGOUT, logout);
router.post(ROUTES.RECOVERY_PASSWORD, solicitarRecuperacionContrasena)
router.post(ROUTES.CHANGE_PASSWORD, cambiarContrasenaInicial)

module.exports = router;
