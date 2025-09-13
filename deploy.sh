#!/bin/bash

# Simple deployment script for OpenCollab to Vercel

echo "🚀 Deploying OpenCollab to Vercel..."
echo "====================================="

# Deploy to production
vercel --prod --yes

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🔗 Your app is now live on Vercel!"
echo ""
echo "📝 Remember to set environment variables in Vercel Dashboard:"
echo "   - ADMIN_EMAIL"
echo "   - ADMIN_PASSWORD_HASH"
echo "   - JWT_SECRET"
echo "   - FIREBASE_PROJECT_ID"
echo "   - FIREBASE_CLIENT_EMAIL"
echo "   - FIREBASE_PRIVATE_KEY"