/**
 * Vercel Serverless Function - Logout Endpoint
 * /api/auth/logout
 */

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

  // In a production system with a database, you would:
  // 1. Invalidate the token in a blacklist
  // 2. Clear any server-side session
  // 3. Log the logout event
  
  // For now, we just return success
  // The client will clear its local storage
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};