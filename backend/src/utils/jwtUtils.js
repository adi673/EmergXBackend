//backend/src/utils/jwtUtils.js
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const secret = process.env.JWT_SECRET;

module.exports.generatejwtToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email, role: user.role }, secret, { expiresIn: '1d' });
};

module.exports.verifyToken = (token) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};
