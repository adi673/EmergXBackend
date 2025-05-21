const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const candidateSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    default: null, // null for Google-auth users
  },
  mobileNumber: {
    type: String,
    // required: function () {
    //   return this.authProvider === 'local'; // required only for local signups
    // },
    // match: [/^\+?[1-9]\d{9,14}$/, 'Invalid mobile number'],
  },
  role: {
    type: String,
    enum: ['candidate'],
    default: 'candidate',
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  questionnaire: { 
    rolePreferences: [String],
    locations: [String],
    experienceLevels: [String],
    companySizePreferences: {
      earlyStartup: Number,
      midStartup: Number,
      lateStartup: Number,
    },
    jobRoles: [String],
  },
  resumeUrl: { type: String, default: '' },
  extractedData: { type: mongoose.Schema.Types.Mixed, default: null }
});

// Compare password only for local users
candidateSchema.methods.comparePassword = function (candidatePassword) {
  if (this.authProvider !== 'local') return false;
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Candidate', candidateSchema);
