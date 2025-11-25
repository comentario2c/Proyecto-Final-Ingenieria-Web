const express = require('express');
const router = express.Router();
const { registrarPrestamo } = require('../controllers/prestamo');
const profesoresMiddleware = require('../Middleware/profesoresMiddleware');

router.post('/', registrarPrestamo);

module.exports = router;