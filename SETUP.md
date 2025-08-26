# Local Development Setup

## Quick Start (Simplest Method)

### Option 1: Using Python's built-in server (Recommended)
```bash
# Navigate to project directory
cd /Users/archithrapaka/Desktop/gamatech/sneakers

# Python 3
python3 -m http.server 8000

# OR Python 2
python -m SimpleHTTPServer 8000
```

Then open: http://localhost:8000

### Option 2: Using Node.js http-server
```bash
# Install globally (one-time)
npm install -g http-server

# Navigate to project directory
cd /Users/archithrapaka/Desktop/gamatech/sneakers

# Start server
http-server -p 8000
```

Then open: http://localhost:8000

### Option 3: Using PHP
```bash
# Navigate to project directory
cd /Users/archithrapaka/Desktop/gamatech/sneakers

# Start PHP server
php -S localhost:8000
```

Then open: http://localhost:8000

## Features Available

✅ **Working Features:**
- Real-time collaborative editing
- Multiple language syntax highlighting
- User presence indicators
- Theme switching
- Font size adjustment
- Session sharing via URL
- Persistent sessions (via Firebase)
- User name entry

⚠️ **Code Execution Notes:**
- Code execution uses Piston API (https://emkc.org)
- Requires internet connection
- Supports: JavaScript, Python, Java, C++, Go, Rust, etc.
- May be blocked by some firewalls/networks

## Testing the Application

1. **Start local server** (use any method above)
2. **Open browser** to http://localhost:8000
3. **Enter your name** when prompted
4. **Test collaboration:**
   - Open same URL in another tab/browser
   - Enter different name
   - Both users should see each other in the users list
   - Edits sync in real-time

5. **Test code execution:**
   - Select JavaScript from language dropdown
   - Write: `console.log("Hello World")`
   - Click "▶ Run" button
   - Output should appear on the right

6. **Share session:**
   - Click "Share" button
   - Send URL to others
   - They join the same session

## Troubleshooting

**Firebase Connection Issues:**
- Check internet connection
- Firebase free tier has limits (100 concurrent connections)
- Check browser console for errors

**Code Execution Not Working:**
- Piston API might be down
- Network might block external API calls
- CORS issues (use local server, not file://)

**Page Not Loading:**
- Must use HTTP server (not file://)
- Check all file paths are correct
- Clear browser cache

## Project Structure
```
sneakers/
├── index.html           # Main HTML file
├── styles/
│   └── main.css        # All styles
├── scripts/
│   ├── firepad.js      # Main app logic
│   └── code-executor.js # Code execution handler
├── lib/
│   └── firebase-sdk.js # Firebase config
└── images/             # Favicon files
```

## Next Steps

To enhance this further:
1. Add file management (multiple files)
2. Add chat functionality
3. Add video/voice call integration
4. Deploy to production (Firebase Hosting, Netlify, Vercel)
5. Add custom backend for more reliable code execution
6. Add user authentication
7. Add code templates and snippets