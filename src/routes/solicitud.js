const express = require('express');
const router = express.Router();
const { procesarSolicitudConfirmacion } = require('../controllers/solicitudController');

router.post('/procesar', procesarSolicitudConfirmacion);

module.exports = router;
