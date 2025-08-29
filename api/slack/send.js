// API endpoint to send Slack notifications
// SECURITY: Webhook URL should be stored as environment variable, not sent from client
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { payload } = req.body;

    // Get webhook URL from environment variable (secure)
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    
    if (!webhookUrl) {
      console.error('SLACK_WEBHOOK_URL environment variable not configured');
      return res.status(500).json({ 
        error: 'Slack integration not configured. Please contact administrator.' 
      });
    }

    // Validate payload
    if (!payload || !payload.text) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    // Forward request to Slack
    const slackResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // Check if Slack request was successful
    if (!slackResponse.ok) {
      const errorText = await slackResponse.text();
      console.error('Slack API error:', errorText);
      return res.status(slackResponse.status).json({ 
        error: 'Failed to send to Slack',
        details: errorText 
      });
    }

    // Success
    return res.status(200).json({ 
      success: true,
      message: 'Successfully sent to Slack' 
    });

  } catch (error) {
    console.error('Error proxying to Slack:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}