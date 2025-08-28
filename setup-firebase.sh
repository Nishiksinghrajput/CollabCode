#!/bin/bash

echo "🔥 Firebase Deployment Setup"
echo "============================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}Firebase CLI not installed!${NC}"
    echo "Installing Firebase CLI..."
    npm install -g firebase-tools
fi

# Step 1: Create public directory structure
echo -e "\n${GREEN}Step 1: Creating public directory structure...${NC}"
mkdir -p public/scripts
mkdir -p public/styles
mkdir -p public/lib
mkdir -p public/images

# Step 2: Copy files to public directory
echo -e "\n${GREEN}Step 2: Copying files to public directory...${NC}"

# Copy HTML files
cp index.html public/
cp 404.html public/ 2>/dev/null || echo "404.html not found, skipping..."

# Copy scripts (excluding sensitive files)
cp scripts/firepad.js public/scripts/
cp scripts/app.js public/scripts/
cp scripts/auth-secure.js public/scripts/
cp scripts/code-executor.js public/scripts/
cp scripts/simple-templates.js public/scripts/
cp scripts/custom-dialogs.js public/scripts/

# Don't copy the insecure auth.js
if [ -f scripts/auth.js ]; then
    echo -e "${YELLOW}⚠️  Excluding insecure auth.js from deployment${NC}"
fi

# Copy styles
cp -r styles/* public/styles/

# Copy lib
cp -r lib/* public/lib/

# Copy images
cp -r images/* public/images/ 2>/dev/null || echo "No images to copy"

# Step 3: Update index.html in public to use secure auth
echo -e "\n${GREEN}Step 3: Updating index.html to use secure authentication...${NC}"
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' 's/scripts\/auth.js/scripts\/auth-secure.js/g' public/index.html
else
    # Linux
    sed -i 's/scripts\/auth.js/scripts\/auth-secure.js/g' public/index.html
fi

# Step 4: Install Functions dependencies
echo -e "\n${GREEN}Step 4: Installing Firebase Functions dependencies...${NC}"
cd functions
npm install
cd ..

# Step 5: Firebase login
echo -e "\n${GREEN}Step 5: Firebase Authentication...${NC}"
firebase login

# Step 6: Initialize Firebase project
echo -e "\n${GREEN}Step 6: Initializing Firebase project...${NC}"
echo -e "${YELLOW}Select your existing Firebase project or create a new one${NC}"
firebase use --add

# Step 7: Set Firebase Functions config
echo -e "\n${GREEN}Step 7: Setting up Firebase Functions configuration...${NC}"

# Get admin password
echo -e "${BLUE}Enter admin password for the application:${NC}"
read -s ADMIN_PASSWORD
echo

# Hash the password
ADMIN_PASSWORD_HASH=$(node -e "
const bcrypt = require('bcryptjs');
console.log(bcrypt.hashSync('$ADMIN_PASSWORD', 10));
")

# Generate JWT secret
JWT_SECRET=$(openssl rand -hex 32)

echo -e "${GREEN}Setting Firebase Functions config...${NC}"

# Set Firebase Functions environment config
firebase functions:config:set \
    jwt.secret="$JWT_SECRET" \
    admin.email="hiring@atomtickets.com" \
    admin.password_hash="$ADMIN_PASSWORD_HASH"

echo -e "${GREEN}✓ Functions config set${NC}"

# Step 8: Deploy database rules
echo -e "\n${GREEN}Step 8: Deploying secure database rules...${NC}"
firebase deploy --only database

# Step 9: Create deployment script
echo -e "\n${GREEN}Step 9: Creating deployment script...${NC}"
cat > deploy-to-firebase.sh << 'EOF'
#!/bin/bash
echo "🚀 Deploying to Firebase..."

# Update public directory with latest changes
cp index.html public/
cp -r scripts/* public/scripts/
cp -r styles/* public/styles/

# Remove insecure files
rm -f public/scripts/auth.js

# Deploy everything
firebase deploy --only hosting,functions,database

echo "✅ Deployment complete!"
echo "View your app at: https://$(firebase apps:info | grep -o '[a-z0-9-]*\.web\.app')"
EOF

chmod +x deploy-to-firebase.sh

# Step 10: Initial deployment
echo -e "\n${GREEN}Step 10: Ready to deploy!${NC}"
echo -e "${YELLOW}Run the following command to deploy:${NC}"
echo -e "${BLUE}./deploy-to-firebase.sh${NC}"
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Firebase Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Important URLs:${NC}"
echo "  Firebase Console: https://console.firebase.google.com"
echo "  Your app will be at: https://YOUR-PROJECT.web.app"
echo ""
echo -e "${YELLOW}Admin Login:${NC}"
echo "  Email: hiring@atomtickets.com"
echo "  Password: [The password you just entered]"
echo ""
echo -e "${YELLOW}Test locally with:${NC}"
echo "  firebase emulators:start"
echo ""
echo -e "${YELLOW}Deploy with:${NC}"
echo "  ./deploy-to-firebase.sh"
echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"