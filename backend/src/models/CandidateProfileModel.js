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
    type: String, 
    required: true 
  },        
  Languages: [                                    
    {
      language: String,
      proficiency: String,
    }
  ],
  work_experience: [                                
    {
      company: String,
      position: String,
      start_date: String,                           
      end_date: String,
      description: String,
    }
  ],
  education: [
    {
      institution: String,
      degree: String,
      start_year: Number,                          
      end_year: Number,
      grade: String,                           
    }
  ],
  skills: [String],
  Projects: [                                   
    {
      name: String,
      description: String,
      technologies: [String],
      link: String,
    }
  ],
  certifications: [
    {
      name: String,
      issuing_organization: String,      
      issue_date: String,
      link: String,
    }
  ]
}, { timestamps: true });


module.exports = mongoose.model('CandidateProfile', candidateProfileSchema);
