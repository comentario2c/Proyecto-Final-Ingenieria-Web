const express = require('express');
const router = express.Router();

const { registrarPrestamo } = require('../controllers/prestamo');
const prestamoMiddleware = require('../Middleware/prestamoMiddleware');

router.use(express.json());
router.post('/', prestamoMiddleware, registrarPrestamo);

module.exports = router;