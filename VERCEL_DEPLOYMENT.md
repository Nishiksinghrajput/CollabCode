# 🚀 Vercel Deployment Guide

## Why Vercel?

**Better than Firebase for this project because:**
- ✅ **FREE Serverless Functions** (no Blaze plan needed!)
- ✅ Automatic HTTPS & SSL
- ✅ Global CDN (faster than Firebase)
- ✅ GitHub integration
- ✅ Preview deployments for PRs
- ✅ Better developer experience

## Prerequisites

1. **Vercel Account** (free at vercel.com)
2. **Node.js 16+** installed
3. **Git** (optional, for GitHub integration)

## 🎯 Quick Deploy (2 Minutes)

### Option 1: Deploy with CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts:
# - Login/Signup
# - Select project name
# - Confirm settings
# - Done!
```

### Option 2: Deploy with GitHub

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repo
5. Click "Deploy"

## 📋 Manual Setup

### Step 1: Install Vercel CLI

```bash
npm i -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Configure Environment Variables

Create `.env.local`:
```env
ADMIN_EMAIL=hiring@atomtickets.com
ADMIN_PASSWORD_HASH=$2a$10$AK4xnyU8Di5rwP7hJRxrv.l0WQv1/PmtwGV/QKPA2o9LsCpMCGOmO
JWT_SECRET=your-random-secret-here
FIREBASE_PROJECT_ID=sneakers-688b6
```

### Step 4: Deploy

```bash
# Development deployment
vercel

# Production deployment
vercel --prod
```

## 🔧 Project Structure for Vercel

```
sneakers/
├── api/                    # Serverless functions (automatic)
│   ├── auth/
│   │   └── login.js       # /api/auth/login endpoint
│   └── sessions/
│       ├── create.js      # /api/sessions/create
│       └── validate.js    # /api/sessions/validate
├── public/                # Static files
│   ├── index.html
│   ├── scripts/
│   ├── styles/
│   └── lib/
├── vercel.json           # Vercel configuration
└── package.json
```

## 🔐 Environment Variables

### In Vercel Dashboard:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

| Variable | Value |
|----------|-------|
| `ADMIN_EMAIL` | `hiring@atomtickets.com` |
| `ADMIN_PASSWORD_HASH` | `$2a$10$AK4xnyU8Di5rwP7hJRxrv.l0WQv1/PmtwGV/QKPA2o9LsCpMCGOmO` |
| `JWT_SECRET` | Generate with: `openssl rand -hex 32` |
| `FIREBASE_PROJECT_ID` | `sneakers-688b6` |
| `FIREBASE_PRIVATE_KEY` | Your Firebase private key |
| `FIREBASE_CLIENT_EMAIL` | Your Firebase service account email |

## 🎯 API Endpoints (Serverless Functions)

### Login
```javascript
POST /api/auth/login
Body: {
  "email": "hiring@atomtickets.com",
  "password": "AtomHiring2024!"
}
Response: {
  "success": true,
  "token": "jwt-token-here"
}
```

### Create Session
```javascript
POST /api/sessions/create
Headers: {
  "Authorization": "Bearer jwt-token-here"
}
Response: {
  "success": true,
  "sessionId": "ABCD1234"
}
```

## 🚀 Deployment Commands

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# List deployments
vercel list

# View logs
vercel logs

# Set environment variable
vercel env add JWT_SECRET

# Pull environment variables
vercel env pull
```

## 💰 Pricing Comparison

| Feature | Vercel (Free) | Firebase (Spark) | Firebase (Blaze) |
|---------|--------------|------------------|------------------|
| **Hosting** | ✅ Unlimited | ✅ 10GB | ✅ Pay-as-you-go |
| **Bandwidth** | ✅ 100GB/month | ✅ 360MB/day | 💰 $0.15/GB |
| **Functions** | ✅ Unlimited | ❌ Not available | 💰 $0.40/million |
| **SSL** | ✅ Free | ✅ Free | ✅ Free |
| **Custom Domain** | ✅ Free | ✅ Free | ✅ Free |
| **Edge Network** | ✅ Global | ✅ Global | ✅ Global |

## 🔗 GitHub Integration

### Automatic Deployments:

1. Connect GitHub repo to Vercel
2. Every push to `main` → Production deployment
3. Every PR → Preview deployment
4. Rollback with one click

### Setup:
```bash
# Initialize git
git init
git add .
git commit -m "Initial commit"

# Push to GitHub
git remote add origin https://github.com/yourusername/sneakers.git
git push -u origin main

# Import in Vercel
# Go to vercel.com → Import Project → Select repo
```

## 🧪 Testing Locally

```bash
# Install Vercel CLI
npm i -g vercel

# Run development server
vercel dev

# Access at http://localhost:3000
```

## 🐛 Troubleshooting

### "Function timeout"
- Increase timeout in `vercel.json`:
```json
{
  "functions": {
    "api/auth/login.js": {
      "maxDuration": 30
    }
  }
}
```

### "CORS error"
- Already handled in function code
- Check allowed origins in function

### "Environment variable not found"
```bash
# Pull from Vercel
vercel env pull

# Or set locally
echo "JWT_SECRET=your-secret" >> .env.local
```

## 🎉 Your URLs

After deployment:
- **Production**: `https://sneakers-secure.vercel.app`
- **Preview**: `https://sneakers-secure-git-feature.vercel.app`
- **API**: `https://sneakers-secure.vercel.app/api/`

## ✅ Deployment Checklist

- [ ] Vercel CLI installed
- [ ] Logged in to Vercel
- [ ] Environment variables set
- [ ] API functions created
- [ ] `vercel.json` configured
- [ ] Deployed with `vercel --prod`
- [ ] Custom domain configured (optional)
- [ ] GitHub integration (optional)

## 🆚 Vercel vs Firebase Comparison

| Aspect | Vercel | Firebase |
|--------|--------|----------|
| **Setup Complexity** | Simple | Complex |
| **Free Functions** | ✅ Yes | ❌ Needs Blaze |
| **Database** | Use Firebase | ✅ Included |
| **Learning Curve** | Easy | Moderate |
| **Build Times** | Fast (< 1min) | Slow (3-5min) |
| **DX** | Excellent | Good |

## 🎯 Best Practice

Use **Vercel for hosting + functions** and **Firebase for database**:
- Vercel: Frontend, API, Auth
- Firebase: Realtime Database, Storage
- Result: Best of both worlds!

---

**Ready to deploy?** Run:
```bash
vercel --prod
```

Your secure app will be live in under 60 seconds! 🚀