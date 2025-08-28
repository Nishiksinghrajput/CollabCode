# 🚀 Sneakers - Collaborative Code Interview Platform

A secure, real-time collaborative code editor for technical interviews, deployed on Vercel with Firebase Realtime Database.

![Version](https://img.shields.io/badge/version-3.0.0-blue.svg)
![Security](https://img.shields.io/badge/security-production--ready-green.svg)
![Languages](https://img.shields.io/badge/languages-16+-orange.svg)

## 🔗 Live Application

**Production URL:** https://sneakers-atom.vercel.app/

## ✨ Features

### Core Functionality
- **🔄 Real-time Collaboration** - See changes instantly as users type
- **🌍 16+ Language Support** - JavaScript, Python, Java, C++, Go, Rust, and more
- **▶️ Live Code Execution** - Run code directly in the browser
- **🎨 Multiple Themes** - 8 editor themes including Monokai, GitHub, Solarized
- **👥 User Presence** - See who's online with live indicators
- **📱 Responsive Design** - Works on desktop and mobile devices

### Interview Features
- **🔐 Secure Authentication** - JWT-based admin login (no client-side passwords!)
- **🔢 6-Digit Session Codes** - Easy to share session identifiers
- **👋 Join/Leave Notifications** - Get notified when users enter or leave
- **🚪 Session Termination** - Interviewers can end sessions and kick out users
- **📊 Session Management** - View and manage all active sessions
- **💾 Persistent Sessions** - Code remains even after users leave

## 🏗️ Architecture

```
Frontend (Vercel CDN)
    ↓
API Endpoints (Vercel Serverless Functions)
    ↓
Database (Firebase Realtime Database)
```

### Security Features
- **No client-side credentials** - All authentication through secure API
- **JWT tokens** for session management
- **Bcrypt password hashing**
- **Security headers** (XSS, CSRF protection)
- **Firebase Security Rules** for database access control

## 🚀 Deployment

### Quick Deploy to Production

```bash
./deploy.sh
```

This will deploy to Vercel. The app will be available at your Vercel URL.

### Environment Variables

Set these in [Vercel Dashboard](https://vercel.com/dashboard) → Settings → Environment Variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `ADMIN_EMAIL` | Admin login email | `hiring@atomtickets.com` |
| `ADMIN_PASSWORD_HASH` | Bcrypt hashed password | `$2a$10$...` |
| `JWT_SECRET` | Secret for JWT tokens | Generate with `openssl rand -hex 32` |
| `FIREBASE_PROJECT_ID` | Your Firebase project ID | `sneakers-688b6` |

## 👤 User Access

### For Interviewers

1. Go to https://sneakers-atom.vercel.app/
2. Click **"I'm an Interviewer"**
3. Login with credentials:
   - Email: `hiring@atomtickets.com`
   - Password: `AtomHiring2024!`
4. Create a new session or manage existing ones
5. Share the 6-digit code with candidates

### For Candidates

1. Go to https://sneakers-atom.vercel.app/
2. Click **"I'm a Candidate"**
3. Enter your full name
4. Enter the 6-digit session code from your interviewer
5. Start coding!

## 🔑 Password Management

### Reset Admin Password

1. Generate new password hash:
```bash
node generate-password-hash.js "YourNewSecurePassword123!"
```

2. Copy the generated hash

3. Update in Vercel Dashboard:
   - Go to Settings → Environment Variables
   - Update `ADMIN_PASSWORD_HASH`
   - Redeploy (happens automatically)

## 🛠️ Local Development

### Prerequisites
- Node.js 16+
- npm or yarn
- Vercel CLI

### Setup

1. **Clone the repository**
```bash
git clone [your-repo-url]
cd sneakers
```

2. **Install dependencies**
```bash
npm install
```

3. **Install Vercel CLI**
```bash
npm i -g vercel
```

4. **Run locally**
```bash
vercel dev
```

5. **Open in browser**
```
http://localhost:3000
```

## 📁 Project Structure

```
sneakers/
├── api/                    # Vercel Serverless Functions
│   └── auth/              # Authentication endpoints
│       ├── login.js       # Secure login with JWT
│       ├── verify.js      # Token verification
│       ├── logout.js      # Session termination
│       └── reset-password.js  # Password reset
├── scripts/               # Client-side JavaScript
│   ├── app.js            # Main application controller
│   ├── auth-api.js       # Secure auth module (no passwords!)
│   ├── firepad.js        # Collaboration logic
│   └── code-executor.js  # Code execution handler
├── styles/               # CSS files
├── lib/                  # Libraries
│   └── firebase-sdk.js   # Firebase config (public keys only)
├── index.html            # Main application
├── reset-password.html   # Password reset page
├── vercel.json          # Vercel configuration
├── firebase.json        # Firebase database config
└── deploy.sh           # Deployment script
```

## 🔒 Security Notes

### Firebase Configuration
The Firebase config in `lib/firebase-sdk.js` contains API keys that are **intentionally public**. This is by design:
- Firebase API keys are meant to be public
- They only identify your project, not grant access
- Security is enforced through:
  1. Firebase Security Rules (`database.rules.secure.json`)
  2. Backend authentication (Vercel API)
  3. CORS and domain restrictions

### Production Security
- ✅ All passwords hashed with bcrypt
- ✅ JWT tokens with expiration
- ✅ No sensitive data in client code
- ✅ Security headers on all responses
- ✅ Database rules restrict access

## 📊 API Endpoints

All endpoints are serverless functions on Vercel:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | Admin login with email/password |
| `/api/auth/verify` | GET | Verify JWT token validity |
| `/api/auth/logout` | POST | Terminate session |
| `/api/auth/reset-password` | POST | Initiate password reset |
| `/api/auth/update-password` | POST | Update password with reset token |

## 🐛 Troubleshooting

### Login Not Working?
- Verify environment variables are set in Vercel Dashboard
- Check browser console for errors
- Ensure you're using the correct credentials

### Firebase Not Syncing?
- Check Firebase connection status (console logs)
- Verify Firebase project is active
- Check database rules allow access

### Deployment Issues?
- Ensure you're logged into Vercel CLI
- Check `vercel.json` configuration
- Verify all dependencies in `package.json`

## 🤝 Tech Stack

- **Frontend:** Vanilla JavaScript, HTML5, CSS3
- **Backend:** Vercel Serverless Functions (Node.js)
- **Database:** Firebase Realtime Database
- **Editor:** ACE Editor with Firepad
- **Authentication:** JWT + bcrypt
- **Hosting:** Vercel (automatic scaling, global CDN)
- **Code Execution:** Piston API

## 📈 Performance

- WebSocket connections for real-time sync
- Global CDN via Vercel
- Serverless functions for infinite scaling
- Optimized bundle size
- Connection pooling for Firebase

## 📄 License

MIT License - see LICENSE file for details

## 📞 Support

For issues or questions:
- Email: infrastructure@atomtickets.com
- Author: Archith
- Open an issue on GitHub

---

**Deployed with ❤️ on Vercel** | **Secured with JWT + bcrypt** | **No client-side passwords!**
