const bcrypt = require('bcrypt');
const User = require('../models/UserModel.js');
const Company = require('../models/CompanyModel.js');
const { generatejwtToken } = require('../utils/jwtUtils.js');
// Controller to register CEO and the company
exports.registerCEOAndCompany = async (req, res) => {
    const { fullName, email, password, mobileNumber, companyName, businessEmail } = req.body;

    try {
        // Check if company already exists
        const existingCompany = await Company.findOne({ companyName });
        if (existingCompany) {
            return res.status(400).json({ success: false, message: 'Company with this name already exists.' });
        }

        // Hash the CEO password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        // Create CEO user
        const newCEO = new User({
            fullName,
            email,
            password: hashedPassword,
            mobileNumber,
            role: 'ceo'
        });
        
        // Create company (assigning CEO as createdBy)
        const newCompany = new Company({
            companyName,
            businessEmail,
            createdBy: newCEO._id
        });
        

        // Update the company with CEO details
        newCEO.companyId = newCompany._id;
        await newCompany.save();
        await newCEO.save();
        // await savedCompany.save();
        const jwtToken = generatejwtToken(newCEO);
        res.cookie('token', jwtToken, { httpOnly: true, secure: true });

        // Optionally: Generate an invite token for the CEO to invite employees
        // const token = generateToken(savedCompany._id, savedCEO._id);

        // Respond with success
        res.status(201).json({
            message: 'Company and CEO registered successfully!',
            token: jwtToken,
            company: newCompany,
            ceo: newCEO,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};


exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ success: false, message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid credentials' });

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