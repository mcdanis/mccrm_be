const jwt = require('jsonwebtoken');
require('dotenv').config();

const AuthMiddleware = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: true, message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: true, message: 'Failed to authenticate token' });
    }
    console.log('Decoded JWT:', decoded);

    req.user = decoded;
    next();
  });
};

module.exports = AuthMiddleware;