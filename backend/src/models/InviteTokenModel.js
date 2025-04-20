const mongoose = require('mongoose');

const inviteTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // CEO or authorized person who sent invite
    required: true,
  },
  email: {
    type: String, // Optional: for pre-filling or invite restriction
    lowercase: true,
  },
  expiresAt: {
    type: Date,
    default: () => Date.now() + 1000 * 60 * 60 * 24 // 24 hours
  },
  used: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('InviteToken', inviteTokenSchema);
