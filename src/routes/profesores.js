const express = require('express');
const router = express.Router();
const { mostrarProfesor, mostrarProfesoresActivos, mostrarProfesoresInactivos, desactivarProfesor } = require('../controllers/profesorController');
const verifySession = require('../middlewares/auth');
const { verifyRole } = require('../middlewares/verifyRole');
const { ROL, ROUTES } = require('../constants/constants');

router.get(
    ROUTES.SHOW,
    verifySession,
    verifyRole([
        ROL.SUPERADMIN]),
    mostrarProfesor
);
router.get(
    ROUTES.SHOW_ACTIVE,
    verifySession,
    verifyRole([
        ROL.SUPERADMIN]),
    mostrarProfesoresActivos
);
router.get(
    ROUTES.SHOW_INACTIVE,
    verifySession,
    verifyRole([
        ROL.SUPERADMIN]),
    mostrarProfesoresInactivos
);
router.post(
    ROUTES.DELETE,
    verifySession,
    verifyRole([
        ROL.SUPERADMIN]),
    desactivarProfesor
);

module.exports = router;