// authController.js
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const { generatejwtToken } = require('../../utils/jwtUtils');
const Candidate = require('../../models/CandidateModel');
const CandidateProfile = require('../../models/CandidateProfileModel');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const axios = require('axios');

//Pop Up google auth controller not using it
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
    console.log("jwtToken", jwtToken)

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
      isNewUser: isNewUser,
      user,
    });

  } catch (err) {
    console.error('Google Auth error:', err);
    res.status(500).json({ success: false, message: 'Google login/signup failed' });
  }
};

//Redirect google Auth Controller
exports.redirectGoogleAuth = async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send('Missing code');

  try {
    // 1. Exchange code for tokens
    const tokenResponse = await axios.post(
      'https://oauth2.googleapis.com/token',
      new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: 'http://localhost:3003/api/auth/candidate/google/callback',
        grant_type: 'authorization_code',
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { id_token } = tokenResponse.data;

    // 2. Verify the ID token
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    if (!email) {
      return res.status(400).send('Invalid Google token (missing email)');
    }

    // 3. Check if user exists or create new one
    let user = await Candidate.findOne({ email });
    let isNewUser = false;

    if (!user) {
      user = await Candidate.create({
        fullName: name,
        email,
        role: 'candidate',
        authProvider: 'google',
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
        certifications: [],
      });

      isNewUser = true;
    } else {
      if (user.authProvider !== 'google') {
        return res.status(403).json({
          success: false,
          message: 'Email registered using a different method.',
        });
      }
    }

    // 4. Generate JWT
    const jwtToken = generatejwtToken(user);

    // 5. Set as cookie
    res.cookie('token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
    });

    // 6. Redirect back to frontend
    // let redirectUrl = 'http://localhost:3000/dashboard';
    const redirectUrl = `http://localhost:3000/google/success?token=${jwtToken}&newUser=${isNewUser}`;

    return res.redirect(redirectUrl);
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return res.status(500).send('Google OAuth callback error');
  }
};

// GET /api/candidate/me
exports.getCurrentCandidate = async (req, res) => {
  try {
    const userId = req.user.id; // Extracted from JWT middleware

    // Exclude the `questionnaire` field using .select()
    const user = await Candidate.findById(userId).select('-questionnaire');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error retrieving user' });
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

    // First, fetch the current profile to retain existing values
    const currentProfile = await CandidateProfile.findOne({ userId });
    if (!currentProfile) {
      return res.status(404).json({
        success: false,
        message: 'Candidate profile not found',
      });
    }

    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (about_me !== undefined) {
      updateData.about_me = about_me.trim().length > 0 ? about_me : currentProfile.about_me;
    }

    if (Languages !== undefined) {
      //condition for if language is coming as language:[] only nothing inside it.
      updateData.Languages = Languages.length > 0 ? Languages : currentProfile.Languages;
    }

    if (work_experience !== undefined) {
      updateData.work_experience = work_experience.length > 0 ? work_experience : currentProfile.work_experience;
    }

    if (education !== undefined) {
      updateData.education = education.length > 0 ? education : currentProfile.education;
    }

    if (skills !== undefined) {
      updateData.skills = skills.length > 0 ? skills : currentProfile.skills;
    }

    if (Projects !== undefined) {
      updateData.Projects = Projects.length > 0 ? Projects : currentProfile.Projects;
    }

    if (certifications !== undefined) {
      updateData.certifications = certifications.length > 0 ? certifications : currentProfile.certifications;
    }

    const updatedProfile = await CandidateProfile.findOneAndUpdate(
      { userId },
      updateData,
      { new: true, runValidators: true }
    );

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


exports.getCandidateProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Make sure JWT middleware sets this
    console.log(req.user)
    const profile = await CandidateProfile.findOne({ userId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Candidate profile not found',
      });
    }

    res.status(200).json({
      success: true,
      profile,
    });
  } catch (err) {
    console.error('Error fetching candidate profile:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch candidate profile',
    });
  }
};
