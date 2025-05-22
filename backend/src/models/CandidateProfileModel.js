const mongoose = require('mongoose');

const candidateProfileSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  name: { 
    type: String, 
    required: true 
  },
  about_me: { 
    type: String 
  },        
  Languages: [
    {
      language: { type: String, required: true },
      proficiency: { type: String, required: true },
      _id: false
    }
  ],
  work_experience: [                                
    {
      company: String,
      position: String,
      start_date: String,                           
      end_date: String,
      description: String,
      _id: false
    }
  ],
  education: [
    {
      institution: String,
      degree: String,
      start_year: Number,                          
      end_year: Number,
      grade: String,
      _id: false
    }
  ],
  skills: [String],
  Projects: [                                   
    {
      name: String,
      description: String,
      technologies: [String],
      link: String,
      _id: false
    }
  ],
  certifications: [
    {
      name: String,
      issuing_organization: String,      
      issue_date: String,
      link: String,
      _id: false
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('CandidateProfile', candidateProfileSchema);
