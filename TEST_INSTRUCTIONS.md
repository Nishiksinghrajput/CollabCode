# Testing Session Sharing - Step by Step

## 1. First, Test Firebase Connection

Open http://localhost:8000/debug.html

You should see:
- ✅ Firebase connected!
- ✅ Write successful!
- ✅ Read successful!
- ✅ Session write successful!

If you see any ❌ errors, Firebase connection is the issue.

## 2. Test Main Application

### Browser Tab 1 (Creator):
1. Open http://localhost:8000
2. Open Developer Console (F12 or Cmd+Option+I)
3. Enter name: "Alice"
4. Click "Create New Session"

**Check Console - You should see:**
```
🔥 Initializing Firebase with config: https://sneakers-688b6.firebaseio.com
✅ Firebase connected successfully!
=== SESSION DEBUG ===
CREATING new session: 345678
Firebase refs: {...}
Current user: {name: "Alice", ...}
=====================
Setting up presence for user: Alice
✅ User presence set successfully
Users in session: 1 {user_abc123: {name: "Alice", ...}}
🟢 Firepad READY! Session 345678 is active
```

**Note the 6-digit code shown** (e.g., `345678`)

### Browser Tab 2 (Joiner):
1. Open new Incognito/Private window
2. Go to http://localhost:8000
3. Open Developer Console
4. Enter name: "Bob"
5. Enter the 6-digit code from Tab 1
6. Click "Join Session"

**Check Console - You should see:**
```
🔥 Initializing Firebase with config: https://sneakers-688b6.firebaseio.com
✅ Firebase connected successfully!
=== SESSION DEBUG ===
JOINING existing session: 345678
Firebase refs: {...}
Current user: {name: "Bob", ...}
=====================
Setting up presence for user: Bob
✅ User presence set successfully
Users in session: 2 {user_abc123: {...}, user_xyz789: {...}}
🟢 Firepad READY! Session 345678 is active
Session content length: [should show content if Alice typed anything]
```

## 3. What You Should See When Working:

### Visual Indicators:
- **Top bar shows:** "Session Code: **345678**" (same on both)
- **User count:** "2 users online"
- **User badges:** Both "Alice" and "Bob" shown
- **Notification:** Alice sees "👋 Bob joined the session"

### In Both Consoles:
- `Users in session: 2` with both users listed
- No error messages
- Firebase connection confirmed

## 4. Common Issues & Fixes:

### Issue: "Firebase NOT connected"
**Fix:** Check internet connection, Firebase might be blocked

### Issue: No console logs appearing
**Fix:** Make sure you're on http://localhost:8000, not file://

### Issue: Session not syncing
**Look for these errors in console:**
- `PERMISSION_DENIED` - Firebase rules issue
- `Failed to set user presence` - Write permission issue
- Network errors - Firewall/connectivity issue

### Issue: Users don't see each other
**Check:**
1. Both using same 6-digit code?
2. Both show "Connected" at bottom?
3. Console shows "Users in session: 2"?

## 5. Quick Test Commands

Run these in Browser Console to test Firebase directly:

```javascript
// Test Firebase connection
firebase.database().ref('.info/connected').once('value').then(s => console.log('Connected:', s.val()))

// Test write permission
firebase.database().ref('test').set({test: true}).then(() => console.log('Write OK')).catch(e => console.log('Write failed:', e))

// Check current session users
firebase.database().ref('sessions/[YOUR-CODE]/users').once('value').then(s => console.log('Users:', s.val()))
```

## 6. If Nothing Works:

1. Clear browser cache and localStorage:
```javascript
localStorage.clear();
location.reload();
```

2. Try a simple test session code: `111111`
   - Both users use this exact code
   - Should connect to same session

3. Check Firebase Dashboard:
   - The Firebase project might have hit quotas
   - Database rules might have changed

Report what you see in the console - that will help identify the issue!