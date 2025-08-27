#!/bin/bash

echo "🚀 Firebase Deployment Script"
echo "=============================="

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "📦 Installing Firebase CLI..."
    npm install -g firebase-tools
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install Firebase CLI"
        echo "Try: sudo npm install -g firebase-tools"
        exit 1
    fi
    echo "✅ Firebase CLI installed"
fi

# Login to Firebase
echo ""
echo "🔐 Logging into Firebase..."
firebase login

# Deploy to Firebase Hosting
echo ""
echo "🚀 Deploying to Firebase Hosting..."
firebase deploy --only hosting

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "🌐 Your app is now live at:"
    echo "   https://sneakers-688b6.firebaseapp.com"
    echo "   https://sneakers-688b6.web.app"
    echo ""
    echo "📊 View in Firebase Console:"
    echo "   https://console.firebase.google.com/project/sneakers-688b6/hosting"
else
    echo "❌ Deployment failed. Please check the errors above."
    exit 1
fi