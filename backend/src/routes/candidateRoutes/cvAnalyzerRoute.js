const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const candidateAuthController = require("../../controllers/Candidate/candidateAuthController");
const { analyzeCV, updateResume } = require("../../controllers/Candidate/cvAnalyzerController");

router.post("/analyze-cv", analyzeCV);
router.put('/update-resume', updateResume);
module.exports = router;
