const express = require('express');
const router = express.Router();

const { registerCEOAndCompany, login, logout } = require('../controllers/authController.js');
const { validateRegister } = require('../middlewares/validationMiddleware.js');

router.post('/register', validateRegister, registerCEOAndCompany);
router.post('/login', login);
router.post('/logout', logout);

module.exports = router;
