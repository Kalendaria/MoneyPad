const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'your-secret-key';
const EXPIRES_IN = '7d';

const signToken = (payload) => {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
};

const verifyToken = (token) => {
  return jwt.verify(token, SECRET);
};

module.exports = { signToken, verifyToken };