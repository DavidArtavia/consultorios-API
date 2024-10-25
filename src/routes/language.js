const express = require('express');
const router = express.Router();
const { changeLanguage } = require("../controllers/languageController");

router.post('/cambiar', changeLanguage);

module.exports = router;