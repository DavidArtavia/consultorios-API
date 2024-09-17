// routes/protegido.js
const express = require('express');
const verificarSesion = require('../middlewares/auth');
const router = express.Router();

router.get('/recurso-protegido', verificarSesion, (req, res) => {
    res.json({ message: 'Acceso permitido a recurso protegido', usuario: req.session.userId });
});

module.exports = router;