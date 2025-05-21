const Leaderboard = require('../models/leaderboardModel');

exports.updateScore = async (req, res) => {
  const { candidateId, interviewId, score } = req.body;

  try {
    // Find and update existing score or create new
    const leaderboardEntry = await Leaderboard.findOneAndUpdate(
      { candidateId, interviewId },
      { score, lastAttemptedAt: new Date() },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'Score updated successfully',
    //   leaderboardEntry,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getTop10AndUserScoreWithRank = async (req, res) => {
  const { interviewId, candidateId } = req.params;

  try {
    // Get top 10 scores for the interview
    const top10 = await Leaderboard.find({ interviewId })
      .populate('candidateId', 'name email')
      .sort({ score: -1, lastAttemptedAt: 1 })
      .limit(10);

    // Get particular user's score
    const userScoreDoc = await Leaderboard.findOne({ interviewId, candidateId });
    if (!userScoreDoc) {
      return res.status(404).json({ success: false, message: 'User score not found' });
    }

    // Count how many users have a higher score than this user for the interview
    const higherScoresCount = await Leaderboard.countDocuments({
      interviewId,
      $or: [
        { score: { $gt: userScoreDoc.score } },
        {
          score: userScoreDoc.score,
          lastAttemptedAt: { $lt: userScoreDoc.lastAttemptedAt } // tie-breaker by earlier attempt time
        }
      ]
    });

    const userRank = higherScoresCount + 1;

    res.status(200).json({
      success: true,
      top10,
      userScore: userScoreDoc,
      userRank,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
