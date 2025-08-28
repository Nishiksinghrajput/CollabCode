#!/bin/bash

echo "🔒 Secure Sneakers Setup Script"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Install dependencies
echo -e "\n${GREEN}Step 1: Installing dependencies...${NC}"
npm install

# Step 2: Generate secure secrets
echo -e "\n${GREEN}Step 2: Generating secure secrets...${NC}"
SESSION_SECRET=$(openssl rand -hex 32)
JWT_SECRET=$(openssl rand -hex 32)

# Step 3: Hash admin password
echo -e "\n${GREEN}Step 3: Setting up admin password...${NC}"
read -s -p "Enter new admin password: " ADMIN_PASSWORD
echo
read -s -p "Confirm admin password: " ADMIN_PASSWORD_CONFIRM
echo

if [ "$ADMIN_PASSWORD" != "$ADMIN_PASSWORD_CONFIRM" ]; then
    echo -e "${RED}Passwords don't match!${NC}"
    exit 1
fi

# Hash the password using Node.js
ADMIN_PASSWORD_HASH=$(node -e "
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('$ADMIN_PASSWORD', 10);
console.log(hash);
")

# Step 4: Create .env file
echo -e "\n${GREEN}Step 4: Creating .env file...${NC}"
cat > .env << EOF
# Server Configuration
PORT=3000
NODE_ENV=development

# Session Secret (Auto-generated)
SESSION_SECRET=$SESSION_SECRET

# JWT Secret (Auto-generated)
JWT_SECRET=$JWT_SECRET

# Admin Credentials
ADMIN_EMAIL=hiring@atomtickets.com
ADMIN_PASSWORD_HASH=$ADMIN_PASSWORD_HASH

# Firebase Admin SDK (You need to fill these from Firebase Console)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Settings
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080

# Security Headers
HSTS_MAX_AGE=31536000
EOF

echo -e "${GREEN}✓ .env file created${NC}"

# Step 5: Update Firebase rules
echo -e "\n${GREEN}Step 5: Firebase Security${NC}"
echo -e "${YELLOW}IMPORTANT: Update your Firebase Database Rules:${NC}"
echo "1. Go to Firebase Console > Database > Rules"
echo "2. Replace with contents of database.rules.secure.json"
echo "3. Click 'Publish'"

# Step 6: Update client code
echo -e "\n${GREEN}Step 6: Updating client code...${NC}"

# Replace auth.js with auth-secure.js in index.html
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' 's/auth.js/auth-secure.js/g' index.html
else
    # Linux
    sed -i 's/auth.js/auth-secure.js/g' index.html
fi

echo -e "${GREEN}✓ Client code updated${NC}"

# Step 7: Instructions
echo -e "\n${GREEN}============================================${NC}"
echo -e "${GREEN}Setup Complete! Next steps:${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "1. Update Firebase credentials in .env file:"
echo "   - Go to Firebase Console > Project Settings > Service Accounts"
echo "   - Generate new private key"
echo "   - Update FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL in .env"
echo ""
echo "2. Update Firebase Database Rules:"
echo "   - Copy contents of database.rules.secure.json"
echo "   - Paste in Firebase Console > Database > Rules"
echo ""
echo "3. Start the secure server:"
echo -e "   ${YELLOW}npm start${NC}"
echo ""
echo "4. Access the application:"
echo -e "   ${YELLOW}http://localhost:3000${NC}"
echo ""
echo -e "${GREEN}Admin Login:${NC}"
echo "   Email: hiring@atomtickets.com"
echo "   Password: [The password you just set]"
echo ""
echo -e "${YELLOW}⚠️  Security Notes:${NC}"
echo "   - Never commit .env file to git"
echo "   - Use HTTPS in production"
echo "   - Regularly update dependencies"
echo "   - Monitor for security vulnerabilities"
echo ""
echo -e "${GREEN}✅ Your app is now secure!${NC}"