# Testing Session Sharing

## How to Test Session Sharing

### Step 1: Start the Server
```bash
cd /Users/archithrapaka/Desktop/gamatech/sneakers
python3 -m http.server 8000
```

### Step 2: Create First Session
1. Open **Browser Tab 1**: http://localhost:8000
2. Enter name: "User 1"
3. Click "Start Coding"
4. **Note the URL** - it should now have a hash like:
   `http://localhost:8000/#-NrX3K9J8xY2Z3A4B5C6`

### Step 3: Share the Session
1. Click the **"Share"** button
2. The URL will be copied to clipboard
3. You should see a notification: "✓ URL copied to clipboard!"

### Step 4: Join from Another Browser
1. Open **Browser Tab 2** (or different browser/incognito)
2. Paste the URL with the hash
3. Enter name: "User 2"
4. Click "Start Coding"

### Step 5: Verify Collaboration
You should see:
- ✅ Both users listed in the top-right corner
- ✅ "User 1" badge in Tab 1, "User 2" badge in Tab 2
- ✅ Both users see each other in the users list
- ✅ When User 1 types, User 2 sees it immediately
- ✅ When User 2 types, User 1 sees it immediately
- ✅ Language changes sync between both users
- ✅ Theme changes sync between both users

### Step 6: Check Browser Console
Open Developer Tools (F12) and check Console tab:

**Tab 1 should show:**
```
Created new session: -NrX3K9J8xY2Z3A4B5C6
Firebase refs initialized: {...}
Firepad is ready! Session active.
Sharing session URL: http://localhost:8000/#-NrX3K9J8xY2Z3A4B5C6
```

**Tab 2 should show:**
```
Joining existing session: -NrX3K9J8xY2Z3A4B5C6
Firebase refs initialized: {...}
Firepad is ready! Session active.
```

## Troubleshooting

### Session Not Sharing?

1. **Check the URL hash**
   - URL must have `#` followed by session ID
   - Example: `http://localhost:8000/#-NrX3K9J8xY2Z3A4B5C6`
   - Without hash = new session
   - With hash = join existing session

2. **Check Firebase Connection**
   - Look at bottom status bar
   - Should show "Connected" in green
   - If "Disconnected" in red, check internet

3. **Clear Browser Data**
   ```javascript
   // Run in console to reset
   localStorage.clear();
   location.hash = '';
   location.reload();
   ```

4. **Test with Simple URL**
   - Manually create a session ID
   - Go to: `http://localhost:8000/#test123`
   - Share: `http://localhost:8000/#test123`
   - Both users should connect to same session

### Common Issues

**Issue: Each user creates new session**
- Make sure you're copying the FULL URL including the hash
- Don't just share `localhost:8000` - include the `#sessionid`

**Issue: Users don't see each other**
- Check both have entered names
- Check both show "Connected" status
- Try refreshing both tabs

**Issue: Changes not syncing**
- Check Firebase quotas (free tier: 100 connections)
- Check network connectivity
- Try a different session ID

## Advanced Testing

### Test Persistence
1. Create session, write code
2. Close all tabs
3. Reopen with same URL
4. Code should still be there

### Test Multiple Users
1. Open 3-4 tabs with same URL
2. All should see each other
3. Changes sync to all

### Test Recovery
1. Disconnect internet
2. Make changes (won't sync)
3. Reconnect internet
4. Changes should sync

## Firebase Dashboard
Monitor real-time activity:
1. Go to: https://console.firebase.google.com
2. Sign in with the project owner's account
3. Select "sneakers-688b6" project
4. Go to Realtime Database
5. Watch data update live as users type