const express = require('express');
const router = express.Router();
const { actualizarProfesor, mostrarProfesor, mostrarProfesoresActivos, mostrarProfesoresInactivos, activarProfesor, desactivarProfesor } = require('../controllers/profesorController');
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
router.put(
    ROUTES.UPDATE,
    verifySession,
    verifyRole([
        ROL.SUPERADMIN]),
    actualizarProfesor
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
router.post(
    ROUTES.ACTIVATE,
    verifySession,
    verifyRole([
        ROL.SUPERADMIN]),
    activarProfesor
);

module.exports = router;