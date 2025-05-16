//backend/src/controllers/authController.js
const bcrypt = require('bcrypt');
const User = require('../models/UserModel.js');
const Company = require('../models/CompanyModel.js');
const { generatejwtToken } = require('../utils/jwtUtils.js');
// Controller to register CEO and the company
exports.registerCEOAndCompany = async (req, res) => {
    const { fullName, email, password, mobileNumber, companyName, businessEmail } = req.body;

    try {
        // ✅ Check if company already exists
        const existingCompany = await Company.findOne({ companyName });
        if (existingCompany) {
            return res.status(400).json({ success: false, message: 'Company with this name already exists.' });
        }

        // ✅ Check if the same business email is already used by another company
        const emailConflictCompany = await Company.findOne({
            businessEmail,
            companyName: { $ne: companyName } // Not the same company name
        });

        if (emailConflictCompany) {
            return res.status(400).json({ success: false, message: 'Business email is already used by another company.' });
        }

        // ✅ Check if user with the same email already exists
        // const existingUser = await User.findOne({ email });
        // if (existingUser) {
        //     return res.status(400).json({
        //         success: false,
        //         message: 'User with this email already exists.'
        //     });
        // }

        // ✅ Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // ✅ Create user
        const newCEO = new User({
            fullName,
            email,
            password: hashedPassword,
            mobileNumber,
            role: 'ceo'
        });

        // ✅ Create company
        const newCompany = new Company({
            companyName,
            businessEmail,
            createdBy: newCEO._id
        });

        // ✅ Link user to company
        newCEO.companyId = newCompany._id;

        // ✅ Save both
        await newCompany.save();
        await newCEO.save();

        // ✅ Generate JWT
        const jwtToken = generatejwtToken(newCEO);
        res.cookie('token', jwtToken, { httpOnly: true, secure: true });

        // ✅ Respond
        res.status(201).json({
            message: 'Company and CEO registered successfully!',
            token: jwtToken,
            companyId: newCompany._id,
            user: newCEO,
        });

    } catch (error) {
        console.error(error);

        // ✅ Handle MongoDB duplicate key errors clearly
        if (error.code === 11000) {
            const duplicatedField = Object.keys(error.keyPattern)[0];
            return res.status(400).json({
                success: false,
                message: `A record with this ${duplicatedField} already exists.`,
            });
        }

        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};



exports.login = async (req, res) => {
    const { email, password } = req.body;
    console.log(email,password);
    try {
        const user = await User.findOne({ email });
        if (!user) {
            console.log("user not found");
             return res.status(400).json({ success: false, message: 'User not found' })
            };

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log("password not matching");
            return res.status(400).json({ success: false, message: 'Invalid credentials' })};

        const token = generatejwtToken(user);
        res.cookie('token', token, { httpOnly: true, secure: true });

        res.json({
            success: true,
            message: 'User logged in',
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                role: user.role,
                companyId: user.companyId,
            },
        });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};


exports.logout = (req, res) => {
    res.clearCookie('token');
    res.json({ success: true, message: 'User logged out' });
};