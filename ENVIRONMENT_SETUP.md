# Environment Variables Setup

## Required Environment Variables

These environment variables must be configured in your deployment platform (Vercel) for the application to work properly.

### 1. Slack Integration

```
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

**Purpose:** Enables sharing interview feedback to Slack  
**Security:** Keeps webhook URL server-side, never exposed to client  
**How to get:** 
1. Go to https://api.slack.com/messaging/webhooks
2. Create a new app or use existing
3. Add "Incoming Webhooks" feature
4. Generate webhook for your channel

### 2. Code Execution (Optional)

```
PISTON_API_URL=https://emkc.org/api/v2/piston
```

**Purpose:** Endpoint for code execution service  
**Default:** Uses public Piston API if not set  
**Note:** Can be changed to a self-hosted instance for better performance

### 3. Firebase Admin (Already Configured)

```
FIREBASE_PROJECT_ID=sneakers-688b6
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@sneakers-688b6.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
```

**Purpose:** Server-side Firebase admin access  
**Security:** Used only in API routes, never exposed to client

## Setting Environment Variables in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: `sneakers-atom`
3. Navigate to Settings → Environment Variables
4. Add each variable:
   - Key: `SLACK_WEBHOOK_URL`
   - Value: Your webhook URL
   - Environment: ✓ Production, ✓ Preview, ✓ Development
5. Click "Save"
6. **Important:** Redeploy for changes to take effect

## Local Development

For local testing, create a `.env.local` file in the root directory:

```bash
# .env.local (DO NOT COMMIT THIS FILE)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
PISTON_API_URL=https://emkc.org/api/v2/piston
```

**Security Note:** Never commit `.env.local` to version control. It's already in `.gitignore`.

## Verification

After setting up environment variables:

1. **Test Slack Integration:**
   - Create a test interview session
   - Add feedback and notes
   - Click "Share to Slack"
   - Verify message appears in your Slack channel

2. **Test Code Execution:**
   - Join a session
   - Write simple code (e.g., `console.log("test")`)
   - Click "Run"
   - Verify output appears

## Troubleshooting

### Slack not working:
- Check environment variable is set correctly
- Verify webhook URL is valid and active
- Check Vercel function logs for errors

### Code execution not working:
- Verify Piston API is accessible
- Check network/firewall settings
- Review Vercel function logs

## Security Benefits

This setup provides several security advantages:

1. **No Client-Side Secrets:** All sensitive URLs and keys are server-side only
2. **Centralized Management:** Update webhooks without changing code
3. **Access Control:** Only authenticated admin users can trigger Slack messages
4. **Rate Limiting:** Can be added at the API level
5. **Audit Trail:** All API calls are logged in Vercel

## Support

For issues or questions:
- Check Vercel function logs: `vercel logs`
- Verify environment variables: `vercel env ls`
- Test locally first with `.env.local`

---

*Last Updated: 2025-08-29*