# 🚀 Deploy to Firebase - Manual Steps

Firebase CLI is now installed! Follow these steps in your terminal:

## Step 1: Login to Firebase
```bash
firebase login
```
This will open a browser window for authentication.

## Step 2: Deploy to Production
```bash
firebase deploy --only hosting
```

## That's it! Your app will be live at:
- https://sneakers-688b6.firebaseapp.com  
- https://sneakers-688b6.web.app

---

## Alternative: Generate CI Token (for automation)

If you want to deploy from CI/CD or scripts:

```bash
# Generate a CI token
firebase login:ci

# Save the token, then use it:
FIREBASE_TOKEN=your_token_here firebase deploy --only hosting
```

---

## Quick Commands Reference

```bash
# Deploy everything (hosting + database rules)
firebase deploy

# Deploy only hosting
firebase deploy --only hosting

# Deploy only database rules  
firebase deploy --only database

# Test locally before deploying
firebase serve

# View deployment
firebase open hosting:site
```

---

## After Deployment

1. Visit your live site
2. Test admin login: hiring@atomtickets.com / AtomHiring2024!
3. Create a session
4. Share the 6-digit code
5. Join from another device/browser
6. Verify real-time sync works

---

**Status:** Firebase CLI is installed ✅ Ready to deploy!