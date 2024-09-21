// routes/usuario.js
const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const verificarSesion = require('../middlewares/auth');

// url, next(middleware), controoller 
router.post('/login', usuarioController.login);
router.post('/logout', verificarSesion, usuarioController.logout);
router.post('/register', verificarSesion, usuarioController.register);

module.exports = router;
