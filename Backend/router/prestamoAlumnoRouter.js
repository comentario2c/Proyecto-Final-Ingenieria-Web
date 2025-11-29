const express = require('express');
const router = express.Router();

// Importamos la función desde el archivo NUEVO que acabamos de crear
const { obtenerPrestamosPorUsuario } = require('../controllers/prestamoAlumno');


// Cuando alguien visite "/:id", se ejecutará la función.
router.get('/:id', obtenerPrestamosPorUsuario);

module.exports = router;