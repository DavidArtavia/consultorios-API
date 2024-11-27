// routes/usuario.js
const express = require('express');
const router = express.Router();
const verifySession = require('../middlewares/auth');
const { ROL, ROUTES } = require('../constants/constants');
const { verifyRole } = require('../middlewares/verifyRole');
const {
    register,
    editarUsuario,
    cambiarContrasena,
    editarDatosUsuarioAdmin
} = require('../controllers/usuarioController');

router.post(
    ROUTES.REGISTER,
    verifySession,
    verifyRole([
        ROL.SUPERADMIN,
        ROL.PROFESSOR
    ]),
    register
);
router.post(
    ROUTES.CHANGE_PASSWORD,
    verifySession,
    verifyRole([
        ROL.SUPERADMIN,
        ROL.PROFESSOR,
        ROL.STUDENT
    ]),
    cambiarContrasena
);
router.put(
    ROUTES.UPDATE,
    verifySession,
    verifyRole([
        ROL.SUPERADMIN,
        ROL.PROFESSOR,
        ROL.STUDENT
    ]),
    editarUsuario
);

router.put(
    ROUTES.UPDATE_BY_ADMIN,
    verifySession,
    verifyRole([ROL.SUPERADMIN]),
    editarDatosUsuarioAdmin
);

module.exports = router;
