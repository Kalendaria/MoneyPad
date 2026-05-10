const { verifyToken } = require('../utils/jwt');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.userId = decoded.id; // แนบ userId ไปกับทุก request
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token expired or invalid' });
  }
};

module.exports = authMiddleware;
