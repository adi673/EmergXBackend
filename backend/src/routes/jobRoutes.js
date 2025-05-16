//backend/src/routes/jobRoutes.js
const express = require('express');
const router = express.Router();

const { createJob, getAllJobs } = require('../controllers/jobController.js');
const { authMiddleware } = require('../middlewares/authMiddleware.js');

router.post('/create', authMiddleware, createJob);
router.get('/all', authMiddleware, getAllJobs);

module.exports = router;