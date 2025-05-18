const express = require('express');
const router = express.Router();

const jobController = require('../../controllers/Candidate/jobsController');
const { authMiddleware } = require('../../middlewares/authMiddleware.js');

router.get('/getall',authMiddleware, jobController.getAllJobs);

module.exports = router;