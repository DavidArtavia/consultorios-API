// routes/casos.js
const express = require('express');
const router = express.Router();
const casoController = require('../controllers/casoController');
const verificarSesion = require('../middlewares/auth');

// Ruta para crear un caso
router.post('/crear', verificarSesion, casoController.crearCaso);

module.exports = router;
