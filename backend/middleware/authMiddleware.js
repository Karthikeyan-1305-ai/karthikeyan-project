const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

const authMiddleware = (req, res, next) => {
  try {
    console.log('🔐 Auth Middleware - Headers:', req.headers.authorization);
    
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      console.log('❌ No authorization header');
      return res.status(401).json({ 
        success: false, 
        message: 'No authorization header provided' 
      });
    }

    // Check if Bearer token exists
    if (!authHeader.startsWith('Bearer ')) {
      console.log('❌ Invalid authorization format');
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid authorization format. Use: Bearer <token>' 
      });
    }

    // Extract token
    const token = authHeader.split(' ')[1];

    if (!token) {
      console.log('❌ No token in header');
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }

    console.log('🔑 Token received:', token.substring(0, 20) + '...');

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    console.log('✅ Token verified. User:', decoded.email);
    
    // Attach user info to request
    req.user = decoded;
    
    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired. Please login again.' 
      });
    }
    
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication failed' 
    });
  }
};

module.exports = authMiddleware;
