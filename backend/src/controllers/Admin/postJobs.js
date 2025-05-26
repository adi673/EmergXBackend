// Admin uploads a job (external link type)
const Job = require('../../models/flexibleJobModel');

exports.postJob = async (req, res) => {
  try {
    const {
      jobTitle,
      jobDescription,
      skills,
      location,
      employmentType,
      minExperience,
      salaryRange,
      duration,
      startDate,
      externalLink,
      companyName,
      qualifications,
      tags
    } = req.body;
    // console.log(req.body);
    // Validate required fields for admin-uploaded job
    if (
      !jobTitle || !jobDescription || !skills || !location || !employmentType ||
      minExperience === undefined || !salaryRange || !externalLink || !companyName
    ) {
      return res.status(400).json({ success: false, message: 'Missing required fields for admin job upload' });
    }

    const newJob = new Job({
      sourceType: 'admin',
      jobTitle,
      jobDescription,
      skills,
      location,
      employmentType,
      minExperience,
      salaryRange,
      duration,
      startDate,
      externalLink,
      companyName,
      qualifications,
      tags
    });

    await newJob.save();

    res.status(201).json({ success: true, message: 'Job uploaded successfully', job: newJob });
  } catch (error) {
    console.error('Error uploading job by admin:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
