const { v4: uuidv4 } = require('uuid');
const InviteToken = require('../models/InviteTokenModel');
const User = require('../models/UserModel');
const { generatejwtToken } = require('../utils/jwtUtils.js');
const bcrypt = require('bcrypt');
exports.generateInviteToken = async (req, res) => {
    const { email } = req.body; // optional: restrict invite to this email only
    if (!email) {
        email = null;
    }
    const user = req.user; // from auth middleware

    try {
        // Ensure only CEO can generate
        if (user.role !== 'ceo') {
            return res.status(403).json({ success: false, message: 'Only CEO can generate invites' });
        }

        const token = uuidv4();

        const invite = new InviteToken({
            token,
            companyId: user.companyId,
            createdBy: user._id,
            email, // optional
        });

        await invite.save();

        res.status(201).json({ success: true, message: 'Invite token generated', token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};


exports.registerEmployee = async (req, res) => {
    const { fullName, email, password, mobileNumber, inviteToken } = req.body;

    try {
        const tokenDoc = await InviteToken.findOne({ token: inviteToken });

        if (!tokenDoc || tokenDoc.used) {
            return res.status(400).json({ success: false, message: 'Invalid or already used invite token' });
        }

        if (tokenDoc.expiresAt < Date.now()) {
            return res.status(400).json({ success: false, message: 'Invite token has expired' });
        }

        if (tokenDoc.email && tokenDoc.email.toLowerCase() !== email.toLowerCase()) {
            return res.status(400).json({ success: false, message: 'Email does not match invite' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
            mobileNumber,
            role: 'employee', // or whatever roles you have
            companyId: tokenDoc.companyId,
        });

        await newUser.save();

        tokenDoc.used = true;
        await tokenDoc.save();

        const jwtToken = generatejwtToken(newUser);
        res.cookie('token', jwtToken, { httpOnly: true, secure: true });

        res.status(201).json({ success: true, message: 'Employee registered successfully', token: jwtToken });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};