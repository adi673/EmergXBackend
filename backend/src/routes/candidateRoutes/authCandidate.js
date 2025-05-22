const express = require('express');
const router = express.Router();

const candidateAuthController = require('../../controllers/Candidate/candidateAuthController');
const { authMiddleware } = require('../../middlewares/authMiddleware.js');

router.post('/GAuth/signUp', candidateAuthController.googleLogin);
router.post('/google', candidateAuthController.googleAuth);
router.patch('/update-questionnaire', authMiddleware, candidateAuthController.updateQuestionnaire);
router.patch('/update-profile', authMiddleware, candidateAuthController.updateProfile);
//nothing

// ✅ Fix: export the router
module.exports = router; 
