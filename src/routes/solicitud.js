const express = require('express');
const router = express.Router();
const verifySession = require('../middlewares/auth');
const { verifyRole } = require('../middlewares/verifyRole');
const { ROL, ROUTES } = require('../constants/constants');
const {
    procesarSolicitudConfirmacion,
    mostrarSolicitudes
} = require('../controllers/solicitudController');


router.post(
    ROUTES.DELETE,
    verifySession,
    verifyRole([
        ROL.SUPERADMIN]),
    procesarSolicitudConfirmacion
);
router.get(
    ROUTES.SHOW,
    verifySession,
    verifyRole([
        ROL.SUPERADMIN]),
    mostrarSolicitudes
);

module.exports = router;
