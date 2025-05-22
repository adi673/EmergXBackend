// authController.js
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const { generatejwtToken } = require('../../utils/jwtUtils');
const Candidate = require('../../models/CandidateModel');
const CandidateProfile = require('../../models/CandidateProfileModel');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleLogin = async (req, res) => {
  const { idToken } = req.body;

  try {
    // 1. Verify token with Google
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();

    const { email, name, sub: googleId } = payload;

    // 2. Find or create user
    let user = await Candidate.findOne({ email });
    if (!user) {

      user = await Candidate.create({
        email,
        fullName: name,
        googleId,
        role: 'candidate', // default role
        authProvider: 'google',
      });
    }

    // 3. Create your own JWT
    const jwtToken = generatejwtToken(user);

    // Optional: Set cookie
    res.cookie('token', jwtToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
    });

    res.json({ success: true, token: jwtToken, user });
  } catch (err) {
    console.error('Google login error:', err);
    res.status(401).json({ success: false, message: 'Invalid Google token' });
  }
};





exports.googleAuth = async (req, res) => {
  const { idToken } = req.body;

  console.log("token", idToken)
  try {
    // 1. Verify Google token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Invalid Google token' });
    }

    // 2. Check if user exists
    let user = await Candidate.findOne({ email });

    // 3. If not exists, auto sign up
    if (!user) {
      console.log("user not found making new user")
      user = await Candidate.create({
        fullName: name,
        email,
        role: 'candidate',
        authProvider: 'google',

        // Initialize questionnaire as empty arrays/objects
        questionnaire: {
          rolePreferences: [],
          locations: [],
          experienceLevels: [],
          companySizePreferences: {
            earlyStartup: 0,
            midStartup: 0,
            lateStartup: 0,
          },
          jobRoles: [],
        },

        // Top-level fields according to your schema
        resumeUrl: '',
        extractedData: null,
      });

      await CandidateProfile.create({
        userId: user._id,
        name: user.fullName,
        about_me: '',
        Languages: [],
        work_experience: [],
        education: [],
        skills: [],
        Projects: [],
        certifications: []
      });


      //new added 
      isNewUser = true;
    } else {
      console.log("user found already logging in")
      // Optional: check if login method matches
      if (user.authProvider !== 'google') {
        return res.status(403).json({
          success: false,
          message: 'Email registered with a different method. Use password login.',
        });
      }
      isNewUser = false;
    }

    // 4. Generate JWT
    const jwtToken = generatejwtToken(user);

    // 5. Send cookie/token
    res.cookie('token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
    });

    res.status(200).json({
      success: true,
      message: 'Authenticated successfully',
      token: jwtToken,
      isNewUser:isNewUser,
      user,
    });

  } catch (err) {
    console.error('Google Auth error:', err);
    res.status(500).json({ success: false, message: 'Google login/signup failed' });
  }
};

// PATCH /api/candidate/questionnaire
exports.updateQuestionnaire = async (req, res) => {
  try {
    const userId = req.user.id; // Extracted from JWT middleware

    const {
      rolePreferences,
      locations,
      experienceLevels,
      companySizePreferences,
      jobRoles,
      resumeUrl,
      extractedData
    } = req.body;

    // Build update object
    const updateData = {
      questionnaire: {
        rolePreferences,
        locations,
        experienceLevels,
        companySizePreferences,
        jobRoles,
      },
      resumeUrl,
      extractedData
    };

    // Update the candidate profile
    const updatedCandidate = await Candidate.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedCandidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Questionnaire updated successfully',
      user: updatedCandidate,
    });

  } catch (err) {
    console.error('Error saving questionnaire:', err);
    res.status(500).json({ success: false, message: 'Failed to save questionnaire' });
  }
};

// PATCH /api/candidate/update-profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      name,
      about_me,
      Languages,
      work_experience,
      education,
      skills,
      Projects,
      certifications
    } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (about_me !== undefined) updateData.about_me = about_me;
    if (Languages !== undefined) updateData.Languages = Languages;
    if (work_experience !== undefined) updateData.work_experience = work_experience;
    if (education !== undefined) updateData.education = education;
    if (skills !== undefined) updateData.skills = skills;
    if (Projects !== undefined) updateData.Projects = Projects;
    if (certifications !== undefined) updateData.certifications = certifications;

    const updatedProfile = await CandidateProfile.findOneAndUpdate(
      { userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({
        success: false,
        message: 'Candidate profile not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profile: updatedProfile,
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};

