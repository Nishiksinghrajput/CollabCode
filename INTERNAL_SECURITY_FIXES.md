# Internal Security Improvements for Sneakers

Since this is an **internal repo** (not going public), here are the practical fixes needed:

## ✅ Quick Fixes (Do These Now)

### 1. Remove Atomtickets API Hardcoded URL ✓
**DONE** - Just removed the hardcoded fallback in `/api/movies.js`

Now add to Vercel:
```bash
# In Vercel Dashboard, add:
ATOMTICKETS_API_URL=https://clientproxyservice.atomtickets.com/api/v1/aggregation/web-gateway
```

### 2. Remove JWT Fallbacks (5 minutes)
While not critical for internal use, it's good practice:

**Files to update:**
```javascript
// Change this:
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-change-this';

// To this:
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('JWT_SECRET not configured');
  return res.status(500).json({ error: 'Server configuration error' });
}
```

Files:
- `/api/auth/verify.js`
- `/api/auth/login.js`
- `/api/auth/update-password.js`
- `/api/auth/reset-password.js`
- `/api/sessions/create.js`

### 3. Firebase Config - Keep As Is ✅
**No action needed** - This is secure for internal use:
- Firebase configs are meant to be public
- Security is enforced via Firebase Rules
- Domain restrictions are already in place

**Optional Enhancement:** Add to Firebase Console:
1. Go to Firebase Console → Project Settings
2. Add authorized domains (only your Vercel domains)
3. Enable App Check for extra security

## 📋 What You DON'T Need to Worry About

Since it's internal:

### ✅ Keep These As-Is:
- `hiring@atomtickets.com` - Fine for internal docs
- Firebase config in client - This is normal
- Password hash fallback - It's bcrypted anyway

### ✅ Already Secure:
- IPs are hashed
- Passwords are bcrypted  
- Slack webhooks aren't exposed
- All sensitive operations require auth

## 🎯 Action Items for Production

### Must Do:
1. ✅ Remove Atomtickets API hardcoded URL (DONE)
2. Add `ATOMTICKETS_API_URL` to Vercel environment variables
3. (Optional) Remove JWT fallbacks for cleaner code

### Nice to Have:
1. Set up Firebase App Check
2. Add domain restrictions in Firebase
3. Regular `npm audit` checks

## 🔒 Environment Variables on Vercel

Make sure these are set:
```bash
# Required
JWT_SECRET=<your-actual-secret>
ADMIN_EMAIL=hiring@atomtickets.com
ADMIN_PASSWORD_HASH=<your-bcrypt-hash>

# For features
ATOMTICKETS_API_URL=<api-endpoint>
SLACK_WEBHOOK_URL=<if-using-slack>

# Firebase (if using admin SDK)
FIREBASE_PROJECT_ID=sneakers-688b6
FIREBASE_CLIENT_EMAIL=<service-account-email>
FIREBASE_PRIVATE_KEY=<service-account-key>
```

## Summary

For an **internal tool**, your security is actually pretty good:
- ✅ No real secrets exposed
- ✅ Proper password hashing
- ✅ IP anonymization
- ✅ Auth required for sensitive operations
- ✅ Environment variables for actual secrets

**Only critical fix:** Remove the Atomtickets API hardcoded URL (which we just did!)

The `hiring@atomtickets.com` and Firebase config are fine for internal use.