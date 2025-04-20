const { body, validationResult } = require('express-validator');

exports.validateRegister = [
    body('fullName')
        .notEmpty()
        .withMessage('Full name is required'),

    body('email')
        .isEmail()
        .withMessage('A valid email is required'),

    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),

    // body('confirmPassword')
    //     .custom((value, { req }) => {
    //         if (value !== req.body.password) {
    //             throw new Error('Password confirmation does not match password');
    //         }
    //         return true;
    //     }),

    body('mobileNumber')
        .notEmpty()
        .withMessage('Mobile number is required'),

    body('companyName')
        .notEmpty()
        .withMessage('Company name is required'),

    body('businessEmail')
        .isEmail()
        .withMessage('A valid business email is required'),

    // Final middleware to handle errors
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    }
];
