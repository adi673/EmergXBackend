//backend/src/controllers/jobController.js
const Job = require('../models/JobModel');
const Company = require('../models/CompanyModel');
const mongoose = require('mongoose');

exports.createJob = async (req, res) => {
    try {
        const {
            companyId,
            jobTitle,
            jobDescription,
            skills,
            location,
            employmentType,
            minExperience,
            salaryRange,
            duration,
            startDate
        } = req.body;
        console.log(req.body);

        // Check if required fields are present
        if (
            !companyId || !jobTitle || !jobDescription || !skills || !location ||
            !employmentType || minExperience === undefined ||
            !salaryRange || salaryRange.min === undefined || salaryRange.max === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Check if the company exists
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        // Check valid employment type
        const validTypes = ['Full-time', 'Part-time', 'Internship', 'Contract', 'Temporary'];
        if (!validTypes.includes(employmentType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid employment type'
            });
        }

        // Check experience is not negative
        if (minExperience < 0) {
            return res.status(400).json({
                success: false,
                message: 'Minimum experience must be 0 or higher'
            });
        }

        // Check salary range logic
        if (salaryRange.min > salaryRange.max) {
            return res.status(400).json({
                success: false,
                message: 'Minimum salary cannot be greater than maximum salary'
            });
        }

        // Check if start date is valid (if provided)
        if (startDate && isNaN(Date.parse(startDate))) {
            return res.status(400).json({
                success: false,
                message: 'Invalid start date format'
            });
        }

        // Optional: Check if job already exists with same title for the same company
        const existingJob = await Job.findOne({ companyId, jobTitle });
        if (existingJob) {
            return res.status(409).json({
                success: false,
                message: 'Job with this title already exists for this company'
            });
        }

        // (Optional Security) Check if logged-in user belongs to this company
        if (req.user && req.user.companyId.toString() !== companyId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to create jobs for this company'
            });
        }

        // Create and save job
        const newJob = new Job({
            companyId,
            jobTitle,
            jobDescription,
            skills,
            location,
            employmentType,
            minExperience,
            salaryRange,
            duration,
            startDate
        });

        await newJob.save();

        res.status(201).json({
            success: true,
            message: 'Job created successfully',
            job: newJob
        });

    } catch (err) {
        console.error('Error creating job:', err);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: err.message
        });
    }
};



exports.getAllJobs = async (req, res) => {
  try {
    const { companyId } = req.query;
    console.log(companyId);
    const filter = {};

    // Validate ObjectId
    if (companyId && !mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ success: false, message: 'Invalid company ID' });
    }

    // Secure company-level access
    if (companyId) {
        console.log('Company ID:', companyId);
        console.log('User ID:', req.user?.companyId);
        console.log('User:', req.user);
        if (req.user.companyId.toString() !== req.query.companyId.toString()) {
            return res.status(403).json({ success: false, message: 'Unauthorized to access this company’s jobs' });
        }
      filter.companyId = companyId;
    }

    const jobs = await Job.find(filter)
      .populate('companyId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, jobs });

  } catch (err) {
    console.error('Error fetching jobs:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

