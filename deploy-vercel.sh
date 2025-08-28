#!/bin/bash

echo "🚀 Deploying to Vercel"
echo "======================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm i -g vercel
fi

# Step 1: Set up environment variables
echo -e "\n${GREEN}Step 1: Setting up environment variables${NC}"

# Generate JWT secret if not exists
if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET=$(openssl rand -hex 32)
    echo -e "${YELLOW}Generated JWT Secret${NC}"
fi

# Password hash for AtomHiring2024!
ADMIN_PASSWORD_HASH='$2a$10$AK4xnyU8Di5rwP7hJRxrv.l0WQv1/PmtwGV/QKPA2o9LsCpMCGOmO'

# Step 2: Create .env file for Vercel
echo -e "\n${GREEN}Step 2: Creating .env.production${NC}"
cat > .env.production << EOF
ADMIN_EMAIL=hiring@atomtickets.com
ADMIN_PASSWORD_HASH=$ADMIN_PASSWORD_HASH
JWT_SECRET=$JWT_SECRET
FIREBASE_PROJECT_ID=sneakers-688b6
EOF

echo -e "${GREEN}✓ Environment file created${NC}"

# Step 3: Deploy to Vercel
echo -e "\n${GREEN}Step 3: Deploying to Vercel${NC}"
echo -e "${YELLOW}Note: You'll be asked to login to Vercel if not already logged in${NC}"

vercel --prod

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Set environment variables in Vercel Dashboard:"
echo "   - Go to: https://vercel.com/dashboard"
echo "   - Select your project"
echo "   - Go to Settings > Environment Variables"
echo "   - Add:"
echo "     ADMIN_PASSWORD_HASH = $ADMIN_PASSWORD_HASH"
echo "     JWT_SECRET = $JWT_SECRET"
echo ""
echo "2. Your app will be available at:"
echo "   - https://your-project.vercel.app"
echo ""
echo -e "${GREEN}Admin Login:${NC}"
echo "   Email: hiring@atomtickets.com"
echo "   Password: AtomHiring2024!"
echo ""
echo -e "${BLUE}✨ Vercel Advantages:${NC}"
echo "   - Free tier includes serverless functions"
echo "   - Automatic HTTPS"
echo "   - Global CDN"
echo "   - GitHub integration"
echo "   - Preview deployments"