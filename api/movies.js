// Serverless function to proxy movie API requests
// This hides the actual API endpoint from the client

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // The actual API endpoint is stored in environment variable
    const API_ENDPOINT = process.env.ATOMTICKETS_API_URL;
    
    if (!API_ENDPOINT) {
      // Return empty response if API not configured
      return res.status(200).json({ 
        productions: [],
        message: 'Movie API not configured'
      });
    }
    
    const response = await fetch(API_ENDPOINT, {
      headers: {
        'User-Agent': 'Sneakers-Interview-Platform/1.0',
      },
    });
    
    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }
    
    const data = await response.json();
    
    // Cache for 1 hour
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching movies:', error);
    
    // Return empty productions array as fallback
    res.status(200).json({ 
      productions: [],
      error: 'Unable to fetch movies at this time'
    });
  }
}