const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InterviewSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  duration: {
    type: Number, // duration in minutes (or your preferred unit)
    required: true,
  },
  shortDescription: {
    type: String,
    required: true,
  },
  longDescription: {
    type: String,
    required: true,
  },
  promptId: {
    type: Schema.Types.ObjectId,
    ref: 'Prompt',
    required: true,
  },
//   createdBy: {
//     type: Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//   },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Interview', InterviewSchema);
