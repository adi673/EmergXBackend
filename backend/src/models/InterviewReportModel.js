const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FullInterviewReportSchema = new Schema({
  candidateId: {
    type: Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true,
  },
  interviewId: {
    type: Schema.Types.ObjectId,
    ref: 'Interview',
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  score: Number,
  overallConclusion: [String],
  skillAnalysis: [{
    _id: false,
    skillName: String,
    skillScore: Number,
    skillFeedback: [String],
  }],
  marketAlignedRecommendation: [String],
  personalizedActionPlan: {
    shortTermGoals: [String],
    midTermGoals: [String],
    longTermGoals: [String],
  },
  questions: [{
    _id: false,
    questionId: Number,
    question: String,
    score: Number,
    concept: Number,
    communication: Number,
    feedback: [String],
    transcript: [{
      _id: false,
      time: String,
      text: String,
    }],
  }],

}, {
  timestamps: true,
});

module.exports = mongoose.model('FullInterviewReport', FullInterviewReportSchema);
