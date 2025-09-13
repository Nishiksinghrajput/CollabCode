#!/usr/bin/env node

/**
 * Password Hash Generator for Sneakers Admin
 * 
 * This script generates a bcrypt hash for admin passwords
 * The hash is what gets stored in Vercel environment variables
 * 
 * Usage:
 *   node generate-password-hash.js "YourNewPassword123!"
 */

const bcrypt = require('bcryptjs');

// Get password from command line argument
const password = process.argv[2];

if (!password) {
  console.log('❌ Please provide a password as an argument');
  console.log('Usage: node generate-password-hash.js "YourPassword123!"');
  process.exit(1);
}

// Validate password strength
if (password.length < 8) {
  console.log('❌ Password must be at least 8 characters');
  process.exit(1);
}

if (!/[A-Z]/.test(password)) {
  console.log('❌ Password must contain at least one uppercase letter');
  process.exit(1);
}

if (!/[a-z]/.test(password)) {
  console.log('❌ Password must contain at least one lowercase letter');
  process.exit(1);
}

if (!/[0-9]/.test(password)) {
  console.log('❌ Password must contain at least one number');
  process.exit(1);
}

if (!/[!@#$%^&*]/.test(password)) {
  console.log('❌ Password must contain at least one special character (!@#$%^&*)');
  process.exit(1);
}

console.log('🔐 Generating secure hash for password...\n');

// Generate hash with bcrypt
// Salt rounds = 10 (good balance of security and speed)
bcrypt.hash(password, 10)
  .then(hash => {
    console.log('✅ Password hash generated successfully!\n');
    console.log('========================================');
    console.log('ADMIN_PASSWORD_HASH:');
    console.log(hash);
    console.log('========================================\n');
    
    console.log('📝 Next steps:');
    console.log('1. Copy the hash above');
    console.log('2. Go to Vercel Dashboard → sneakers-atom → Settings → Environment Variables');
    console.log('3. Update ADMIN_PASSWORD_HASH with the new hash');
    console.log('4. Redeploy for changes to take effect\n');
    
    console.log('🔒 How it works:');
    console.log('- bcrypt adds a random salt to the password');
    console.log('- The password is hashed 10 times (2^10 = 1024 iterations)');
    console.log('- The result is a one-way hash that cannot be reversed');
    console.log('- When logging in, bcrypt compares the entered password with this hash');
    console.log('- Even if someone gets the hash, they cannot recover the original password\n');
    
    console.log('Remember to set your ADMIN_EMAIL environment variable');
  })
  .catch(err => {
    console.error('❌ Error generating hash:', err);
    process.exit(1);
  });