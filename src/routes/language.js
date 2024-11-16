const express = require('express');
const router = express.Router();
const { changeLanguage } = require("../controllers/languageController");
const { ROUTES } = require('../constants/constants');

router.post(ROUTES.CHANGE, changeLanguage);

module.exports = router;