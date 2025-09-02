// API endpoint to save activity data
// Since Firebase is disabled, we'll store in memory (temporary)
// In production, you'd want to use a database like Supabase

// In-memory storage (resets when server restarts)
const activityStorage = {};

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  const { sessionCode } = req.query;
  
  if (!sessionCode) {
    return res.status(400).json({ error: 'Session code required' });
  }
  
  if (req.method === 'POST') {
    // Save activity data
    const activityData = req.body;
    
    if (!activityStorage[sessionCode]) {
      activityStorage[sessionCode] = {
        summary: null,
        logs: [],
        finalSummary: null
      };
    }
    
    // Update based on data type
    if (activityData.type === 'summary') {
      activityStorage[sessionCode].summary = activityData.data;
    } else if (activityData.type === 'final') {
      activityStorage[sessionCode].finalSummary = activityData.data;
    } else if (activityData.type === 'log') {
      activityStorage[sessionCode].logs.push(activityData.data);
      // Keep only last 100 logs
      if (activityStorage[sessionCode].logs.length > 100) {
        activityStorage[sessionCode].logs.shift();
      }
    }
    
    return res.status(200).json({ 
      success: true,
      message: 'Activity data saved',
      sessionCode 
    });
  }
  
  if (req.method === 'GET') {
    // Retrieve activity data
    const data = activityStorage[sessionCode];
    
    if (!data) {
      return res.status(200).json({ 
        summary: null,
        finalSummary: null,
        logs: []
      });
    }
    
    // Return the most recent summary (final takes precedence)
    return res.status(200).json({
      summary: data.finalSummary || data.summary,
      finalSummary: data.finalSummary,
      logs: data.logs
    });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}