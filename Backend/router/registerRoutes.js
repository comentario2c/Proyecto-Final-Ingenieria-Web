const express = require('express');
const router = express.Router();

const { completarRegistro } = require('../controllers/register');
const registerMiddleware = require('../Middleware/registerMiddleware');

router.post('/', registerMiddleware, completarRegistro);

module.exports = router;