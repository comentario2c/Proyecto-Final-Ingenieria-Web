const express = require('express');
const router = express.Router();
const { loginGoogle } = require('../controllers/auth');

router.post("/", loginGoogle);

module.exports = router;