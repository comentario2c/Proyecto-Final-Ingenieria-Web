const express = require('express');
const router = express.Router();
const verificarToken = require('../Middleware/authMiddleware');
const { loginGoogle, completarPerfil } = require('../controllers/auth');

router.post("/googlelogin", verificarToken, loginGoogle);
router.post("/completar-perfil", verificarToken, completarPerfil);

module.exports = router;