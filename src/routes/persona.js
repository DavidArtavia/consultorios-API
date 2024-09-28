const express = require('express');
const router = express.Router();
const { mostrarPersonasConUsuarios } = require('../controllers/personaController');

router.get('/usuarios', mostrarPersonasConUsuarios);

module.exports = router;
