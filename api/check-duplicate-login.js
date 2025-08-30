// Check for duplicate/multiple logins from different IPs
import crypto from 'crypto';

// Simple in-memory store for active sessions (in production, use Redis or Firebase)
const activeSessions = new Map();

// Clean up old sessions every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, session] of activeSessions.entries()) {
    if (now - session.lastActivity > 30 * 60 * 1000) { // 30 minutes
      activeSessions.delete(key);
    }
  }
}, 5 * 60 * 1000);

function hashIP(ip) {
  return crypto.createHash('sha256').update(ip + process.env.JWT_SECRET).digest('hex').substring(0, 16);
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { userId, userName, sessionCode, action } = req.body;
    
    if (!userId || !sessionCode) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Get IP
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() ||
               req.headers['x-real-ip'] ||
               req.connection?.remoteAddress ||
               '0.0.0.0';
    
    const hashedIP = hashIP(ip);
    const sessionKey = `${sessionCode}-${userId}`;
    
    // Handle different actions
    if (action === 'login') {
      // Check if user is already logged in from different IP
      const existingSession = activeSessions.get(sessionKey);
      
      if (existingSession && existingSession.ip !== hashedIP) {
        // User is already logged in from different IP
        const timeSinceLastActivity = Date.now() - existingSession.lastActivity;
        
        if (timeSinceLastActivity < 5 * 60 * 1000) { // Active in last 5 minutes
          return res.status(403).json({
            error: 'Multiple login detected',
            message: 'You are already logged into this session from another location',
            existingLocation: existingSession.location,
            existingDevice: existingSession.device,
            lastActivity: new Date(existingSession.lastActivity).toISOString()
          });
        }
      }
      
      // Store new session
      activeSessions.set(sessionKey, {
        userId,
        userName,
        sessionCode,
        ip: hashedIP,
        location: req.headers['cf-ipcountry'] || 'Unknown', // Cloudflare geo header
        device: req.headers['user-agent']?.substring(0, 50),
        loginTime: Date.now(),
        lastActivity: Date.now()
      });
      
      return res.status(200).json({
        success: true,
        message: 'Login tracked successfully'
      });
      
    } else if (action === 'heartbeat') {
      // Update last activity
      const session = activeSessions.get(sessionKey);
      if (session) {
        session.lastActivity = Date.now();
      }
      
      return res.status(200).json({ success: true });
      
    } else if (action === 'logout') {
      // Remove session
      activeSessions.delete(sessionKey);
      
      return res.status(200).json({
        success: true,
        message: 'Logout successful'
      });
      
    } else if (action === 'check') {
      // Check if session exists
      const session = activeSessions.get(sessionKey);
      
      return res.status(200).json({
        exists: !!session,
        session: session ? {
          loginTime: session.loginTime,
          lastActivity: session.lastActivity,
          location: session.location
        } : null
      });
    }
    
    return res.status(400).json({ error: 'Invalid action' });
    
  } catch (error) {
    console.error('Duplicate login check error:', error);
    res.status(500).json({ error: 'Failed to check login status' });
  }
}