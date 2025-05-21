const express = require("express");
const router = express.Router();

const { analyzeCV } = require("../../controllers/Candidate/cvAnalyzerController");

router.post("/analyze-cv", analyzeCV);

module.exports = router;
