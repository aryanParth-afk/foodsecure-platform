const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, authorization denied.' });
    }

    // Verify token using the secret key from your .env file
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_for_hackathon');
    
    // Attach the verified user details directly to the request object
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is invalid or expired, access denied.' });
  }
};

module.exports = auth;