const express = require('express');
const router = express.Router();

const { devolverEquipo } = require('../controllers/devolucion');
const devolucionMiddleware = require('../Middleware/devolucionMiddleware');

router.use(express.json());
router.post('/', devolucionMiddleware, devolverEquipo);

module.exports = router;