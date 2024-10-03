// routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifySession = require('../middlewares/auth');


router.post('/login', authController.login);
router.post('/logout',  authController.logout);

module.exports = router;
