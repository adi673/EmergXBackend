const express = require('express');
const router = express.Router();

const { authMiddleware } = require('../../middlewares/authMiddleware.js');
const { createInterview, getAllInterviews } = require('../../controllers/Main/interviewController');

router.post('/create',authMiddleware, createInterview);
router.get('/all',authMiddleware, getAllInterviews); 



module.exports = router;
