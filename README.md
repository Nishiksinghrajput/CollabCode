# 🚀 Collaborative Code Interview Platform

A real-time collaborative code editor designed for technical interviews, pair programming, and code teaching sessions. Built with Firebase for instant synchronization and supports 16+ programming languages with live code execution.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Languages](https://img.shields.io/badge/languages-16+-orange.svg)

## ✨ Features

### Core Functionality
- **🔄 Real-time Collaboration** - See changes instantly as users type
- **🌍 16+ Language Support** - JavaScript, Python, Java, C++, Go, Rust, and more
- **▶️ Live Code Execution** - Run code directly in the browser
- **🎨 Multiple Themes** - 8 editor themes including Monokai, GitHub, Solarized
- **👥 User Presence** - See who's online with live indicators
- **📱 Responsive Design** - Works on desktop and mobile devices

### Interview Features
- **🔐 Role-based Access** - Separate flows for interviewers and candidates
- **🔢 6-Digit Session Codes** - Easy to share session identifiers
- **👋 Join/Leave Notifications** - Get notified when users enter or leave
- **💾 Persistent Sessions** - Code remains even after all users leave
- **📊 Live User Count** - See how many users are in the session

## 🚀 Quick Start

### Prerequisites
- Python 3.x (for local server)
- Modern web browser (Chrome, Firefox, Edge, Safari)
- Internet connection (for Firebase sync)

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/collaborative-code-editor.git
cd collaborative-code-editor
```

2. **Start the server**
```bash
python3 -m http.server 8000
```

3. **Open in browser**
```
http://localhost:8000
```

## 👤 User Roles

### For Interviewers

1. Click **"I'm an Interviewer"**
2. Login with credentials:
   - Email: `hiring@atomtickets.com`
   - Password: `AtomHiring2024!`
3. Create a new session (generates 6-digit code)
4. Share the code with candidates
5. Start the interview!

### For Candidates

1. Click **"I'm a Candidate"**
2. Enter your full name
3. Enter the 6-digit session code from your interviewer
4. Click "Join Session"
5. Start coding!

## 🛠️ Technical Architecture

### Frontend Stack
- **Editor**: ACE Editor v1.33.2
- **Real-time Sync**: Firepad v1.5.10
- **Styling**: Custom CSS with dark theme
- **Languages**: 16+ with syntax highlighting

### Backend Services
- **Database**: Firebase Realtime Database
- **Code Execution**: Piston API (sandboxed execution)
- **Hosting**: Static files (can be hosted anywhere)

### Performance Optimizations
- WebSocket connections for low latency
- Reduced sync intervals (100ms)
- Optimized editor rendering
- Connection pooling
- Visual sync indicators

## 📁 Project Structure

```
sneakers/
├── index.html              # Main application HTML
├── styles/
│   └── main.css           # All styling and themes
├── scripts/
│   ├── app.js             # Main application controller
│   ├── auth.js            # Authentication module
│   ├── firepad.js         # Collaboration logic
│   ├── code-executor.js   # Code execution handler
│   └── realtime-optimizer.js # Performance optimizations
├── lib/
│   └── firebase-sdk.js    # Firebase configuration
└── images/                # Favicons and assets
```

## 🔧 Configuration

### Setting Up Your Own Firebase

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Realtime Database
3. Set rules to allow read/write (for development):
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```
4. Update `lib/firebase-sdk.js` with your config

### Customizing Admin Credentials

Edit `scripts/auth.js`:
```javascript
const ADMIN_CREDENTIALS = {
  email: 'your-email@company.com',
  password: 'YourSecurePassword123!'
};
```

## 🎯 Use Cases

- **Technical Interviews** - Evaluate candidates with real coding challenges
- **Pair Programming** - Collaborate on code in real-time
- **Code Teaching** - Teach programming with live examples
- **Team Debugging** - Debug issues together remotely
- **Code Reviews** - Review and discuss code interactively

## 🔐 Security Considerations

- Admin credentials are stored client-side (for demo purposes)
- For production, implement proper backend authentication
- Firebase rules should be configured for your security needs
- Consider adding rate limiting for code execution
- Sanitize all user inputs

## 📈 Performance Tips

- Use Chrome or Edge for best WebSocket support
- Ensure good internet connection (<100ms latency ideal)
- Close unnecessary browser tabs
- Use a closer Firebase region for lower latency

## 🐛 Troubleshooting

### Session Not Syncing?
- Check internet connection
- Verify Firebase is connected (bottom status bar)
- Clear browser cache and reload
- Check browser console for errors

### Code Not Running?
- Some languages may not be available
- Check if Piston API is accessible
- Verify no network blocking

### High Latency?
- Check Firebase connection status in console
- Consider using a Firebase project in your region
- Reduce number of active users in session

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [ACE Editor](https://ace.c9.io/) - The amazing code editor
- [Firebase](https://firebase.google.com/) - Real-time database
- [Firepad](https://firepad.io/) - Collaborative text editing
- [Piston](https://github.com/engineer-man/piston) - Code execution engine

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact the development team

---

**Built with ❤️ for better technical interviews**