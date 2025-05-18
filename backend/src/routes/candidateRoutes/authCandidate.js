const express = require('express');
const router = express.Router();

const candidateAuthController = require('../../controllers/Candidate/candidateAuthController');

router.post('/GAuth/signUp', candidateAuthController.googleLogin);
router.post('/google', candidateAuthController.googleAuth);

// ✅ Fix: export the router
module.exports = router; 
