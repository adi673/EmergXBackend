//backend/src/middlewares/authMiddleware.js
const { verifyToken } = require('../utils/jwtUtils');
const Candidate = require('../models/CandidateModel');
exports.authMiddleware = async (req, res, next) => {
    var token = req.cookies.token;
    console.log("Token : ", token)
    const authHeader = req.headers['authorization'];
    // console.log("Auth Header : ", authHeader)
    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header is missing' });
    }
    token = authHeader.split(' ')[1]; // Bearer <token>


    if (!token) {
        return res.status(401).json({ success: false, message: 'No token, authorization denied' });
    }
    try {
        const currentTime = Math.floor(Date.now() / 1000);

        // console.log('Current Time:', currentTime);
        // console.log('Token Expiration Time:', decoded.exp);
        // console.log('Decoded Payload:', decoded);


        // if (currentTime > decoded.exp) {
        //      console.error('Token has expired');
        // } else {
        //     console.log('Token is valid');
        // }
        const decoded = verifyToken(token);
        // console.log(decoded)
        const user = await Candidate.findOne({ _id: decoded.id });
        // console.log("User", user);
        req.user = user;
        // console.log("User :",user)
        // console.log(req.user.role);
        // console.log("Going next ")
        next();
    } catch (err) {
        //console.log("Sending token is invalid")
        res.status(401).json({ success: false, message: 'Token is not valid' });
    }
};


