// routes/auth.js
const express = require('express');
const router = express.Router();
const {
    login,
    logout
} = require('../controllers/authController');
const { ROUTES } = require('../constants/constants');

router.post(ROUTES.LOGIN, login);
router.post(ROUTES.LOGOUT, logout);

module.exports = router;
