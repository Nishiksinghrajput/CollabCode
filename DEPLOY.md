# 🚀 Deploying to Firebase Hosting

## Prerequisites

1. **Install Firebase CLI**
```bash
npm install -g firebase-tools
```

2. **Login to Firebase**
```bash
firebase login
```

## Deploy to Production

### Method 1: Quick Deploy (Recommended)

```bash
# Deploy everything
firebase deploy

# Or deploy only hosting
firebase deploy --only hosting
```

Your app will be available at:
- https://sneakers-688b6.firebaseapp.com
- https://sneakers-688b6.web.app

### Method 2: Step by Step

1. **Initialize Firebase (already done)**
```bash
firebase init
# Select: Hosting
# Project: sneakers-688b6
# Public directory: ./
# Single-page app: No
```

2. **Test locally**
```bash
firebase serve
# Opens at http://localhost:5000
```

3. **Deploy to production**
```bash
firebase deploy --only hosting
```

## Current Configuration

Your `firebase.json` is configured:
```json
{
  "database": {
    "rules": "database.rules.json"
  },
  "hosting": {
    "public": "./"
  }
}
```

## Post-Deployment

### Update Database Rules (Important!)

For production, update `database.rules.json`:
```json
{
  "rules": {
    "sessions": {
      ".read": true,
      ".write": true,
      "$session": {
        ".validate": "newData.hasChildren(['firepad', 'users'])"
      }
    },
    ".read": false,
    ".write": false
  }
}
```

Then deploy rules:
```bash
firebase deploy --only database
```

### Custom Domain (Optional)

1. Go to Firebase Console → Hosting
2. Click "Add custom domain"
3. Follow DNS verification steps
4. Update DNS records

## Environment Variables

For production, update `scripts/auth.js`:
- Change admin password
- Consider using Firebase Auth instead

## Monitoring

View deployment history:
```bash
firebase hosting:channel:list
```

View site:
```bash
firebase open hosting:site
```

## Rollback

If needed, rollback to previous version:
1. Go to Firebase Console → Hosting
2. Click "Version history"
3. Select previous version → "Rollback"

## CI/CD with GitHub Actions (Optional)

Create `.github/workflows/firebase-hosting.yml`:
```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches: [ master ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: sneakers-688b6
```

## Testing the Deployment

After deployment, test:
1. Visit https://sneakers-688b6.web.app
2. Create a session as admin
3. Join from another browser
4. Verify real-time sync works
5. Test code execution

## Troubleshooting

### "Permission Denied" Error
- Check Firebase project permissions
- Ensure you're logged in: `firebase login`

### Site Not Updating
- Clear browser cache
- Check deployment status: `firebase deploy --debug`

### Real-time Not Working
- Verify database rules are deployed
- Check Firebase quotas

## Cost Considerations

Firebase Free Tier includes:
- 10GB hosting storage
- 360MB/day hosting bandwidth  
- 100 simultaneous database connections
- 10GB database storage

Monitor usage:
- Firebase Console → Usage tab

---

**Current Status:** Ready to deploy! Just run `firebase deploy`