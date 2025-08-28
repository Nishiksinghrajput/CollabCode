#!/bin/bash

# Heroku Deployment Script
echo "🚀 Deploying to Heroku..."

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo "❌ Heroku CLI not found. Please install it first:"
    echo "   brew tap heroku/brew && brew install heroku"
    exit 1
fi

# App name
APP_NAME="sneakers-secure-app"

# Create Heroku app if it doesn't exist
if ! heroku apps:info --app $APP_NAME &> /dev/null; then
    echo "📱 Creating Heroku app..."
    heroku create $APP_NAME
fi

# Set environment variables
echo "🔐 Setting environment variables..."

# Generate secure secrets if not provided
SESSION_SECRET=${SESSION_SECRET:-$(openssl rand -hex 32)}
JWT_SECRET=${JWT_SECRET:-$(openssl rand -hex 32)}

# Set config vars
heroku config:set \
    NODE_ENV=production \
    SESSION_SECRET=$SESSION_SECRET \
    JWT_SECRET=$JWT_SECRET \
    ADMIN_EMAIL=$ADMIN_EMAIL \
    ADMIN_PASSWORD_HASH=$ADMIN_PASSWORD_HASH \
    FIREBASE_PROJECT_ID=$FIREBASE_PROJECT_ID \
    FIREBASE_PRIVATE_KEY="$FIREBASE_PRIVATE_KEY" \
    FIREBASE_CLIENT_EMAIL=$FIREBASE_CLIENT_EMAIL \
    --app $APP_NAME

# Add buildpack
heroku buildpacks:set heroku/nodejs --app $APP_NAME

# Deploy
echo "📦 Deploying application..."
git add .
git commit -m "Deploy secure version"
git push heroku main

# Open app
echo "✅ Deployment complete!"
heroku open --app $APP_NAME