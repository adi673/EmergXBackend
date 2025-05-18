const express = require('express');
const router = express.Router();

const postJobController = require('../../controllers/Admin/postJobs');

router.post('/postJob', postJobController.postJob);

module.exports = router;
