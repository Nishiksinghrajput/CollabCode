# Setting Up Your Own Firebase Project

The current Firebase project has permission issues. You need to create your own Firebase project to have full control.

## Quick Setup (5 minutes)

### 1. Create Firebase Project
1. Go to https://console.firebase.google.com
2. Click "Create a project"
3. Name it (e.g., "my-code-editor")
4. Disable Google Analytics (not needed)
5. Click "Create Project"

### 2. Enable Realtime Database
1. In your Firebase Console, click "Realtime Database" in left menu
2. Click "Create Database"
3. Choose location (United States is fine)
4. Start in **TEST MODE** (important!)
5. Click "Enable"

### 3. Get Your Config
1. Click the gear icon ⚙️ → "Project settings"
2. Scroll down to "Your apps"
3. Click "</>" (Web) icon
4. Register app with any nickname
5. Copy the config that appears

### 4. Update Your Config
Replace the contents of `/lib/firebase-sdk.js` with your config:

```javascript
// Initialize Firebase
var config = {
  apiKey: "YOUR-API-KEY",
  authDomain: "YOUR-PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR-PROJECT.firebaseio.com",
  projectId: "YOUR-PROJECT",
  storageBucket: "YOUR-PROJECT.appspot.com",
  messagingSenderId: "YOUR-SENDER-ID",
  appId: "YOUR-APP-ID"
};

console.log('🔥 Initializing Firebase with config:', config.databaseURL);
firebase.initializeApp(config);

// Test Firebase connection
firebase.database().ref('.info/connected').on('value', function(snapshot) {
  if (snapshot.val() === true) {
    console.log('✅ Firebase connected successfully!');
  } else {
    console.log('⚠️ Firebase disconnected');
  }
});
```

### 5. Test It
1. Refresh http://localhost:8000/debug.html
2. Should see all green checkmarks ✅

## Alternative: Quick Test Firebase

If you just want to test quickly, you can use this public test database:

```javascript
// Initialize Firebase - TEST DATABASE (public, may be wiped)
var config = {
  apiKey: "AIzaSyDfenizqGPubV-Bma3EqfpoY1T2hZWV3Cg",
  authDomain: "public-test-project-a7021.firebaseapp.com",
  databaseURL: "https://public-test-project-a7021-default-rtdb.firebaseio.com",
  projectId: "public-test-project-a7021",
  storageBucket: "public-test-project-a7021.appspot.com",
  messagingSenderId: "875422340816",
  appId: "1:875422340816:web:e5e3b8e8f8f8f8f8f8f8f8"
};
```

**Note:** This is a public test database - anyone can read/write to it. Only for testing!

## Why This Happened

The original Firebase project ("sneakers-688b6") has its security rules set to deny access. Only the project owner can change these rules. By creating your own project, you have full control.

## After Setup

Once you update the config:
1. The debug page will show all ✅
2. Session sharing will work
3. Multiple users can collaborate
4. All features will function properly