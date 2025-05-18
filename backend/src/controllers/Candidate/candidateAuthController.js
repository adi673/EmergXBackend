// authController.js
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const { generatejwtToken } = require('../../utils/jwtUtils');
const Candidate = require('../../models/CandidateModel');

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
    const { idToken} = req.body;

    console.log("token",idToken)
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
        email,
        fullName: name,
        googleId,
        role: 'candidate', // default role
        authProvider: 'google',
      });
    } else {
        console.log("user found already logging in")
      // Optional: check if login method matches
      if (user.authProvider !== 'google') {
        return res.status(403).json({
          success: false,
          message: 'Email registered with a different method. Use password login.',
        });
      }
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
      user,
    });

  } catch (err) {
    console.error('Google Auth error:', err);
    res.status(500).json({ success: false, message: 'Google login/signup failed' });
  }
};
