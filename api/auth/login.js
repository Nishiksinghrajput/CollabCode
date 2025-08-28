/**
 * Vercel Serverless Function - Login Endpoint
 * /api/auth/login
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Admin credentials (use environment variables in production)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'hiring@atomtickets.com';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '$2a$10$AK4xnyU8Di5rwP7hJRxrv.l0WQv1/PmtwGV/QKPA2o9LsCpMCGOmO';
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-change-this';

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Parse body if it's a string (Vercel sometimes doesn't parse JSON automatically)
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid JSON in request body' });
    }
  }

  // Debug logging (remove in production)
  console.log('Request body type:', typeof req.body);
  console.log('Request body:', req.body);
  console.log('Parsed body:', body);

  const { email, password } = body || {};

  if (!email || !password) {
    return res.status(400).json({ 
      error: 'Email and password required',
      debug: process.env.NODE_ENV !== 'production' ? {
        bodyType: typeof req.body,
        hasBody: !!req.body,
        hasEmail: !!email,
        hasPassword: !!password
      } : undefined
    });
  }

  try {
    // Check email
    if (email !== ADMIN_EMAIL) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      {
        email: email,
        isAdmin: true,
        userId: 'admin-' + Date.now()
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      token: token,
      user: { email: email, isAdmin: true }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};