const express = require('express');
const router = express.Router();

const { generateInviteToken } = require('../controllers/inviteAuth.js');
const { authMiddleware } = require('../middlewares/authMiddleware.js');
const { validateRegister } = require('../middlewares/validationMiddleware.js');
const { registerEmployee } = require('../controllers/inviteAuth.js');

router.post('/generate', authMiddleware, generateInviteToken);

router.post('/register', registerEmployee);

module.exports = router;
