const express = require('express');
const router = express.Router();

const leaderboardController = require('../../controllers/Main/leaderboardController');
const { authMiddleware } = require('../../middlewares/authMiddleware.js');

router.post('/updateScore',authMiddleware, leaderboardController.updateScore);
router.get('/getTop10AndUserScoreWithRank/:interviewId/:candidateId',authMiddleware, leaderboardController.getTop10AndUserScoreWithRank);

module.exports = router;
