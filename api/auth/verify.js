/**
 * Vercel Serverless Function - Verify Token Endpoint
 * /api/auth/verify
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

// Ensure required environment variables are set
if (!JWT_SECRET) {
  console.error('Missing required environment variable: JWT_SECRET');
}

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get token from header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ valid: false, error: 'No token provided' });
  }

  const token = authHeader.substring(7);

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if token is expired (should be handled by jwt.verify but double-check)
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return res.status(401).json({ valid: false, error: 'Token expired' });
    }

    res.status(200).json({
      valid: true,
      user: {
        email: decoded.email,
        isAdmin: decoded.isAdmin,
        userId: decoded.userId
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ valid: false, error: 'Invalid token' });
  }
};