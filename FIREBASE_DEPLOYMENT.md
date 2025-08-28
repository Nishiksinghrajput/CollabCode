# 🔥 Firebase Deployment Guide

## Why Firebase?

Firebase provides everything you need in one platform:
- **Hosting**: Fast CDN for your frontend
- **Functions**: Serverless backend (no server management)
- **Realtime Database**: Already using for collaboration
- **Authentication**: Built-in secure auth (optional)
- **Free Tier**: Generous free usage

## Prerequisites

1. **Google Account** (for Firebase)
2. **Node.js 16+** installed
3. **Firebase CLI** (`npm install -g firebase-tools`)

## 🚀 Quick Start (5 Minutes)

```bash
# 1. Run the setup script
chmod +x setup-firebase.sh
./setup-firebase.sh

# 2. Follow the prompts to:
#    - Login to Firebase
#    - Select your project
#    - Set admin password

# 3. Deploy
./deploy-to-firebase.sh
```

Your app will be live at: `https://YOUR-PROJECT.web.app`

## 📋 Step-by-Step Manual Setup

### Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase

```bash
firebase login
```

### Step 3: Initialize Project

```bash
firebase init

# Select:
# ✓ Database
# ✓ Functions
# ✓ Hosting
# 
# Use existing project or create new
# Functions language: JavaScript
# Install dependencies: Yes
# Public directory: public
# Single-page app: Yes
# Set up GitHub Actions: No (optional)
```

### Step 4: Configure Functions

Set your admin credentials:

```bash
# Generate password hash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('YOUR_PASSWORD', 10));"

# Set config
firebase functions:config:set \
  jwt.secret="your-random-jwt-secret-here" \
  admin.email="hiring@atomtickets.com" \
  admin.password_hash="$2a$10$your-hash-here"
```

### Step 5: Prepare Files

```bash
# Create public directory
mkdir -p public/scripts public/styles public/lib

# Copy files
cp index.html public/
cp -r scripts/* public/scripts/
cp -r styles/* public/styles/
cp -r lib/* public/lib/

# Remove insecure auth file
rm public/scripts/auth.js
```

### Step 6: Deploy

```bash
# Deploy everything
firebase deploy

# Or deploy specific parts
firebase deploy --only hosting    # Frontend only
firebase deploy --only functions  # Backend only
firebase deploy --only database   # Rules only
```

## 🧪 Testing Locally

Firebase provides excellent local emulation:

```bash
# Start all emulators
firebase emulators:start

# Access at:
# - App: http://localhost:5000
# - Functions: http://localhost:5001
# - Database: http://localhost:9000
```

## 🔧 Configuration

### Environment Variables

Firebase Functions use config instead of .env:

```bash
# Set config
firebase functions:config:set somekey="somevalue"

# View config
firebase functions:config:get

# Access in code
const config = functions.config();
const value = config.somekey;
```

### Database Rules

Edit `database.rules.secure.json`:

```json
{
  "rules": {
    "sessions": {
      "$sessionId": {
        ".read": true,
        ".write": "auth != null || !data.exists()",
        
        "terminated": {
          ".write": "auth != null"
        }
      }
    }
  }
}
```

Deploy rules:
```bash
firebase deploy --only database
```

## 📊 Firebase Console Features

Access at: https://console.firebase.google.com

### Realtime Database
- View all sessions
- Monitor active users
- Export data
- Set up backups

### Functions
- View logs
- Monitor performance
- Set up alerts
- Track errors

### Hosting
- View traffic
- Configure domains
- Set up CDN
- SSL certificates (automatic)

### Analytics (Free)
- User engagement
- Performance monitoring
- Crash reporting

## 🌐 Custom Domain

1. Go to Firebase Console > Hosting
2. Click "Add custom domain"
3. Enter your domain (e.g., `interview.yourcompany.com`)
4. Add DNS records as instructed
5. Wait for SSL certificate (automatic)

## 💰 Pricing

### Free Tier (Spark Plan) - Perfect for Starting
- **Hosting**: 10 GB storage, 360 MB/day bandwidth
- **Functions**: 125K invocations/month, 40K GB-seconds
- **Database**: 1 GB storage, 10 GB/month download
- **Authentication**: Unlimited users

### Paid Tier (Blaze Plan) - Pay as You Go
- **Hosting**: $0.026/GB storage, $0.15/GB bandwidth
- **Functions**: $0.40/million invocations
- **Database**: $5/GB storage, $1/GB download

**Estimated Monthly Cost for 100 daily users**: ~$5-10

## 🔒 Security Best Practices

### 1. Functions Security

```javascript
// Always validate input
if (!sessionId || sessionId.length !== 8) {
  return res.status(400).json({ error: 'Invalid session ID' });
}

// Sanitize user input
const sanitized = userName.replace(/[<>]/g, '');

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5
});
```

### 2. Database Rules

```json
{
  "rules": {
    ".read": false,  // Default deny
    ".write": false,
    
    "sessions": {
      "$session": {
        ".read": true,  // Public read
        ".write": "auth.uid != null"  // Authenticated write
      }
    }
  }
}
```

### 3. CORS Configuration

```javascript
const cors = require('cors');
app.use(cors({
  origin: 'https://yourdomain.com',
  credentials: true
}));
```

## 🐛 Troubleshooting

### "Permission Denied"
- Check database rules
- Verify authentication token
- Check Functions logs

### "Functions not working"
```bash
# View logs
firebase functions:log

# Test locally
firebase emulators:start --only functions
```

### "Deployment failed"
```bash
# Check quota
firebase projects:list

# Update Firebase CLI
npm update -g firebase-tools

# Clear cache
rm -rf .firebase
firebase deploy
```

## 🚀 CI/CD with GitHub Actions

Create `.github/workflows/firebase-deploy.yml`:

```yaml
name: Deploy to Firebase

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          npm install
          cd functions && npm install
      
      - name: Deploy to Firebase
        uses: w9jds/firebase-action@master
        with:
          args: deploy
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

Get Firebase token:
```bash
firebase login:ci
# Add token to GitHub Secrets
```

## 📈 Monitoring

### Firebase Performance Monitoring

Add to your app:
```javascript
// Add Firebase Performance
import { getPerformance } from "firebase/performance";
const perf = getPerformance();
```

### Custom Metrics

```javascript
// Track API performance
const trace = perf.trace('api_call');
trace.start();
// ... make API call
trace.stop();
```

### Alerts

1. Go to Firebase Console > Functions
2. Click "Alert policies"
3. Create alerts for:
   - Error rate > 1%
   - Latency > 1000ms
   - Cold starts > 10/min

## ✅ Deployment Checklist

- [ ] Admin password set
- [ ] JWT secret configured
- [ ] Database rules updated
- [ ] Functions deployed
- [ ] Hosting deployed
- [ ] Custom domain (optional)
- [ ] SSL verified
- [ ] Tested login flow
- [ ] Tested session creation
- [ ] Tested candidate join
- [ ] Monitoring enabled
- [ ] Backups configured

## 🎉 You're Live!

Your secure app is now deployed on Firebase! 

**Next steps:**
1. Share the URL with your team
2. Monitor usage in Firebase Console
3. Set up custom domain
4. Enable analytics
5. Configure backups

**Support:**
- Firebase Docs: https://firebase.google.com/docs
- Stack Overflow: https://stackoverflow.com/questions/tagged/firebase
- Firebase YouTube: https://www.youtube.com/firebase

---

**Remember**: Firebase handles all the infrastructure, scaling, and security. You just focus on your app! 🚀