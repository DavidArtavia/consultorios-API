// routes/usuario.js
const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

router.post('/login', usuarioController.login);
router.post('/logout', usuarioController.logout);
router.post('/register', usuarioController.register);

module.exports = router;
