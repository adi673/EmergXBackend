const CandidateProfile = require('../../models/CandidateProfileModel');
const FullInterviewReport = require('../../models/InterviewReportModel');


//both working perfectly . basic tesing completed. think about wht bugs can arise and test them.
exports.interviewReport = async (req, res) => {
  try {
    const userId = req.user.id;

    const candidate = await CandidateProfile.findOne({ userId: userId });
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    const {
      interviewId,
      role,
      score,
      overallConclusion,
      skillAnalysis,
      marketAlignedRecommendation,
      personalizedActionPlan,
      questions
    } = req.body;

    if (!interviewId || !role) {
      return res.status(400).json({ message: 'interviewId and role are required' });
    }

    const report = new FullInterviewReport({
      candidateId: candidate._id,
      interviewId,
      role,
      score,
      overallConclusion,
      skillAnalysis,
      marketAlignedRecommendation,
      personalizedActionPlan,
      questions
    });

    await report.save();

    res.status(201).json({
      message: 'Interview report created successfully',
      report
    });

  } catch (error) {
    console.error('Error creating interview report:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


exports.getInterviewReports = async (req, res) => {
  try {
    const userId = req.user.id;

    const candidate = await CandidateProfile.findOne({ userId: userId });
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    const reports = await FullInterviewReport.find({ candidateId: candidate._id })
      .populate('interviewId', 'title duration shortDescription')
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    res.status(200).json({
      message: 'Interview reports fetched successfully',
      totalReports: reports.length,
      reports
    });

  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


