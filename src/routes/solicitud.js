const express = require('express');
const router = express.Router();
const verifySession = require('../middlewares/auth');
const { verifyRole } = require('../middlewares/verifyRole');
const { ROL } = require('../constants/constants');
const {
    procesarSolicitudConfirmacion,
    mostrarSolicitudes
} = require('../controllers/solicitudController');

router.post(
    '/eliminar',
    verifySession,
    verifyRole([
        ROL.SUPERADMIN]),
    procesarSolicitudConfirmacion
);
router.get(
    '/mostrar',
    verifySession,
    verifyRole([
        ROL.SUPERADMIN]),
    mostrarSolicitudes
);

module.exports = router;
