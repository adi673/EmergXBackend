//backend/src/models/CompanyModel.js
const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  businessEmail: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // CEO who created the company
    required: true,
  }
});

module.exports = mongoose.model('Company', companySchema);
