// routes/casos.js
const express = require('express');
const router = express.Router();
const casoController = require('../controllers/casoController');

// Ruta para crear un caso
router.post('/crear', casoController.crearCaso);

module.exports = router;
