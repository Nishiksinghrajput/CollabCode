# 🚀 Secure Deployment Guide

## Prerequisites

1. **Node.js 16+** installed
2. **Firebase Project** created
3. **Git** installed
4. Terminal/Command Line access

## 🔒 Step 1: Initial Setup

### 1.1 Install Dependencies
```bash
npm install
```

### 1.2 Run Security Setup
```bash
chmod +x setup-secure.sh
./setup-secure.sh
```

This will:
- Generate secure session secrets
- Hash your admin password
- Create `.env` file
- Update client code

### 1.3 Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Navigate to **Project Settings** > **Service Accounts**
3. Click **Generate New Private Key**
4. Save the JSON file as `firebase-admin-key.json`
5. Update `.env` with Firebase credentials:
   ```env
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk@...
   ```

### 1.4 Update Firebase Security Rules

1. Open Firebase Console > **Realtime Database** > **Rules**
2. Replace with contents of `database.rules.secure.json`
3. Click **Publish**

## 🏃‍♂️ Step 2: Local Development

```bash
# Start development server
npm run dev

# Access at
http://localhost:3000
```

## 📦 Step 3: Deployment Options

### Option A: Deploy to Heroku

```bash
# Install Heroku CLI
brew tap heroku/brew && brew install heroku

# Login to Heroku
heroku login

# Deploy
chmod +x deploy-heroku.sh
./deploy-heroku.sh
```

### Option B: Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel Dashboard
# Settings > Environment Variables
```

### Option C: Deploy to AWS/DigitalOcean

Using Docker:
```bash
# Build image
docker build -t sneakers-secure .

# Run container
docker run -p 3000:3000 --env-file .env sneakers-secure
```

### Option D: Deploy to Google Cloud Run

```bash
# Install gcloud CLI
# Build and deploy
gcloud run deploy sneakers-secure \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## 🔐 Step 4: Production Security Checklist

### Before Going Live:

- [ ] Changed default admin password
- [ ] Set strong JWT_SECRET (min 32 characters)
- [ ] Set strong SESSION_SECRET (min 32 characters)
- [ ] Updated Firebase security rules
- [ ] Enabled HTTPS only
- [ ] Set NODE_ENV=production
- [ ] Removed all console.logs in production
- [ ] Enabled rate limiting
- [ ] Set up monitoring/logging
- [ ] Backup Firebase database
- [ ] Test all authentication flows
- [ ] Verify CORS settings
- [ ] Check CSP headers

### Environment Variables Required:

```env
# Required
NODE_ENV=production
PORT=3000
SESSION_SECRET=<64-char-random-string>
JWT_SECRET=<64-char-random-string>
ADMIN_EMAIL=your-admin@email.com
ADMIN_PASSWORD_HASH=<bcrypt-hash>
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@...

# Optional
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ALLOWED_ORIGINS=https://yourdomain.com
```

## 🎯 Step 5: Testing Production

### Security Tests:
```bash
# Test rate limiting
for i in {1..10}; do curl http://localhost:3000/api/auth/login; done

# Test invalid tokens
curl -H "Authorization: Bearer invalid" http://localhost:3000/api/sessions

# Test XSS prevention
curl -X POST http://localhost:3000/api/sessions/validate \
  -H "Content-Type: application/json" \
  -d '{"userName":"<script>alert(1)</script>","sessionId":"123456"}'
```

### Functionality Tests:
1. Admin login works
2. Session creation works
3. Candidates can join valid sessions
4. Invalid sessions are rejected
5. Session termination works
6. Real-time collaboration works

## 🚨 Step 6: Monitoring & Maintenance

### Set Up Monitoring:

1. **Application Monitoring**: New Relic, DataDog, or PM2
2. **Error Tracking**: Sentry or Rollbar
3. **Uptime Monitoring**: UptimeRobot or Pingdom
4. **Security Scanning**: Snyk or npm audit

### Regular Maintenance:

- Weekly: Check logs for errors
- Monthly: Update dependencies (`npm update`)
- Monthly: Review Firebase usage/costs
- Quarterly: Security audit
- Quarterly: Backup database

## 📊 Step 7: Scaling Considerations

### When You Need to Scale:

- **>100 concurrent sessions**: Add Redis for session storage
- **>1000 users**: Implement database sharding
- **Global users**: Use CDN (CloudFlare)
- **High availability**: Deploy to multiple regions

### Performance Optimizations:

```javascript
// Add to server.js for caching
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

// Cache session data
app.use(session({
  store: new RedisStore({ client }),
  // ... other options
}));
```

## 🆘 Troubleshooting

### Common Issues:

1. **"Cannot connect to Firebase"**
   - Check FIREBASE_PRIVATE_KEY format (needs \n characters)
   - Verify service account email

2. **"Invalid token"**
   - Clear cookies and localStorage
   - Verify JWT_SECRET matches

3. **"CORS error"**
   - Update ALLOWED_ORIGINS in .env
   - Check protocol (http vs https)

4. **"Rate limit exceeded"**
   - Adjust RATE_LIMIT_MAX_REQUESTS
   - Implement user-based limits

## 📞 Support & Resources

- **Firebase Documentation**: https://firebase.google.com/docs
- **Express Security**: https://expressjs.com/en/advanced/best-practice-security.html
- **OWASP Guidelines**: https://owasp.org/www-project-top-ten/
- **Node.js Security**: https://nodejs.org/en/docs/guides/security/

## ✅ Launch Checklist

Before announcing your app:

- [ ] All security vulnerabilities fixed
- [ ] SSL certificate installed
- [ ] Backup strategy in place
- [ ] Legal pages added (Privacy, Terms)
- [ ] Admin documentation created
- [ ] User guide created
- [ ] Support email set up
- [ ] Analytics configured
- [ ] Load tested (use Apache Bench or K6)
- [ ] Security tested (use OWASP ZAP)

---

**Remember**: Security is an ongoing process. Stay updated with security patches and best practices!

**Next Steps**: 
1. Complete the setup
2. Test thoroughly
3. Deploy to staging first
4. Get security review
5. Launch! 🎉