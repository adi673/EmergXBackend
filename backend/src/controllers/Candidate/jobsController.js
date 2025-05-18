// Candidate fetches all jobs (can add filters later)
const Job = require('../../models/flexibleJobModel');
exports.getAllJobs =async (req, res) => {
    try {
      // You can add query filters here, e.g. by location, skills, etc.
      const jobs = await Job.find().sort({ createdAt: -1 }); // newest first
  
      res.status(200).json({ success: true, jobs });
    } catch (error) {
      console.error('Error fetching jobs:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
};
  