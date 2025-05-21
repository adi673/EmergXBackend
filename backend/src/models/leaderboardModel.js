const mongoose = require('mongoose');
const { Schema } = mongoose;

const leaderboardSchema = new Schema({
    candidateId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    interviewId: { type: Schema.Types.ObjectId, ref: 'Interview', required: true },
    score: { type: Number, required: true },
    lastAttemptedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Unique index to prevent multiple entries per user & interview
leaderboardSchema.index({ candidateId: 1, interviewId: 1 }, { unique: true });

module.exports = mongoose.model('Leaderboard', leaderboardSchema);
