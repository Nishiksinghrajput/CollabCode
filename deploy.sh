#!/bin/bash

# Simple deployment script for Sneakers to Vercel

echo "🚀 Deploying to Vercel..."
echo "========================"

# Deploy to production
vercel --prod --yes

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🔗 Production URL: https://sneakers-atom.vercel.app/"
echo ""
echo "📝 Remember to check environment variables in Vercel Dashboard if needed."