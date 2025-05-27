const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  sourceType: {
    type: String,
    enum: ['company', 'admin'],
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: function () {
      return this.sourceType === 'company';
    }
  },
  companyName: {
    type: String,
    required: function () {
      return this.sourceType === 'admin';
    }
  },
  jobTitle: {
    type: String,
    required: true
  },
  jobDescription: {
    type: String,
    required: true
  },
  skills: {
    type: [String], // Array of skill strings
    required: true
  },
  location: {
    type: String,
    required: true
  },
  employmentType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Internship', 'Contract', 'Temporary'],
    required: true
  },
  minExperience: {
    type: Number, // in years
    required: true
  },
  salaryRange: {
    min: {
      type: Number,
      required: true
    },
    max: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'INR'
    }
  },
  duration: {
    type: String // e.g., "6 months", "1 year", etc.
  },
  startDate: {
    type: Date
  },
  externalLink: {
    type: String, // for admin-uploaded jobs
    required: function () {
      return this.sourceType === 'admin';
    }
  },
  qualifications: {
    type: String,
  },
  // ✅ Inline enum for tags
  tags: {
    type: [String],
    enum: ['Software', 'AI/ML', 'Data Science', 'Design', 'Marketing', 'Consulting', 'Business'],
    default: []
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('FlexibleJob', jobSchema);
