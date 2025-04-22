//backend/src/utils/jwtUtils.js
const jwt = require('jsonwebtoken');

const secret = 'mysecretkey';

module.exports.generatejwtToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email, role: user.role }, secret, { expiresIn: '1h' });
};

module.exports.verifyToken = (token) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};
