#!/bin/bash

echo "🚀 Deploying Sneakers to Vercel"
echo "================================"

# Check login
CURRENT_USER=$(vercel whoami 2>/dev/null)
if [ $? -ne 0 ]; then
    echo "❌ Not logged in to Vercel"
    echo "Please run: vercel login"
    echo "Then select 'Continue with Email'"
    echo "Enter: infrastructure@atomtickets.com"
    exit 1
fi

echo "✅ Logged in as: $CURRENT_USER"

# Deploy
echo ""
echo "📦 Starting deployment..."
vercel --prod --yes --name sneakers-atom

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Go to your Vercel dashboard: https://vercel.com/dashboard"
echo "2. Click on the 'sneakers-atom' project"
echo "3. Go to Settings > Environment Variables"
echo "4. Add these variables (already in .env.production):"
echo "   - ADMIN_PASSWORD_HASH"
echo "   - JWT_SECRET"
echo "   - FIREBASE_PROJECT_ID"
echo ""
echo "Your app URL will be shown above!"