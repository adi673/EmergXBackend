const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PromptSchema = new Schema({
  prompt: {
    type: String,
    required: true,
  },
  interviewId: {
    type: Schema.Types.ObjectId,
    ref: 'Interview',
  },
//   createdBy: {
//     type: Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//   },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Prompt', PromptSchema);
