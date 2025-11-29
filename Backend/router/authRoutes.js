const express = require('express');
const router = express.Router();
const { loginGoogle } = require('../controllers/auth');
const { authMiddleware } = require('../Middleware/authMiddleware');

router.post("/", authMiddleware, loginGoogle);

module.exports = router;