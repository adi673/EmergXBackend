const express = require('express')
const router = express.Router()
const { authMiddleware } = require('../../middlewares/authMiddleware.js');
const InterviewReportController = require('../../controllers/Candidate/interviewReportController.js');

router.post('/full-interview-report',authMiddleware,InterviewReportController.interviewReport);
router.get('/full-interview-report',authMiddleware,InterviewReportController.getInterviewReports);
module.exports = router;