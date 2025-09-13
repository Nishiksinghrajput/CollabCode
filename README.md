# OpenCollab 🚀

A secure, real-time collaborative coding platform for conducting technical interviews and pair programming sessions. Built with Node.js, Firebase, and vanilla JavaScript for maximum performance and simplicity.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-green)
![Firebase](https://img.shields.io/badge/firebase-realtime-orange)

## ✨ Features

### Core Functionality
- **Real-time Code Collaboration** - Multiple users can edit code simultaneously with live cursor tracking
- **Multi-language Support** - JavaScript, Python, Java, C++, Go, Ruby, and more (16+ languages)
- **Syntax Highlighting** - Powered by ACE Editor for a professional coding experience
- **Live Code Execution** - Run code directly in the browser (JavaScript) or via Piston API
- **Session Management** - Create, join, and manage coding sessions with unique session codes

### Interview Features
- **Candidate Tracking** - Monitor candidate activity, typing patterns, and code changes
- **Session Recording** - Complete history of all code changes and activities
- **Export to Slack** - Share session results and feedback directly to your team
- **Admin Dashboard** - Manage all sessions, view analytics, and track performance
- **Question Templates** - Pre-loaded coding challenges and interview questions

### Security & Privacy
- **JWT Authentication** - Secure admin access with token-based authentication
- **Session Isolation** - Each interview session is completely isolated
- **No Account Required** - Candidates can join sessions without creating accounts
- **Environment Variable Protection** - All sensitive data stored securely

## 🚀 Quick Start

### Prerequisites
- Node.js 16.0.0 or higher
- npm or yarn
- Firebase account (free tier works)
- Vercel account (for deployment, optional)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/OpenCollab.git
cd OpenCollab
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up Firebase**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Realtime Database
   - Get your Firebase configuration from Project Settings
   - Generate a service account key for server-side access

4. **Configure environment variables**
```bash
cp .env.example .env.production
```

Edit `.env.production` with your configuration:
```env
# Admin Credentials
ADMIN_EMAIL=admin@yourcompany.com
ADMIN_PASSWORD_HASH=<generated_hash>
JWT_SECRET=<random_secret_key>

# Firebase Configuration (for server-side)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Optional: Slack Integration
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

5. **Generate admin password hash**
```bash
node generate-password-hash.js "YourSecurePassword123!"
```
Copy the generated hash to your `.env.production` file as `ADMIN_PASSWORD_HASH`

6. **Update Firebase client configuration**
Edit `lib/firebase-sdk.js` with your Firebase project details:
```javascript
var config = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT.firebaseio.com",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  projectId: "YOUR_PROJECT_ID"
};
```

7. **Set up Firebase Security Rules**
In Firebase Console, go to Realtime Database → Rules and use the rules from `database.rules.secure.json`:
```json
{
  "rules": {
    ".read": false,
    ".write": false,
    "sessions": {
      "$sessionId": {
        ".read": true,
        ".write": true,
        ".validate": "newData.hasChildren(['code', 'language', 'activity'])"
      }
    },
    "users": {
      "$userId": {
        ".read": "$userId === auth.uid",
        ".write": "$userId === auth.uid"
      }
    }
  }
}
```

8. **Start the development server**
```bash
npm run dev
# or for Vercel development
vercel dev
```

Visit `http://localhost:3000` to see the application running!

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Deploy**
```bash
vercel
```

3. **Set environment variables in Vercel**
   - Go to your project in Vercel Dashboard
   - Navigate to Settings → Environment Variables
   - Add all variables from your `.env.production` file

### Deploy to Other Platforms

The application can be deployed to any platform that supports Node.js:
- Heroku
- Google Cloud Platform
- AWS Lambda
- DigitalOcean App Platform
- Railway

## 📁 Project Structure

```
OpenCollab/
├── api/                    # Serverless API endpoints
│   ├── auth/              # Authentication endpoints
│   │   ├── login.js      # Admin login
│   │   ├── verify.js     # Token verification
│   │   └── logout.js     # Session termination
│   ├── sessions/          # Session management
│   │   └── create.js     # Create new sessions
│   └── activity/          # Activity tracking
│       └── save.js       # Save user activity
├── scripts/               # Client-side JavaScript
│   ├── app.js            # Main application logic
│   ├── auth-api.js       # Authentication handling
│   ├── firepad.js        # Collaboration engine
│   └── language-templates.js # Code templates
├── styles/                # CSS styles
├── lib/                   # Libraries and SDKs
│   └── firebase-sdk.js   # Firebase configuration
├── index.html            # Main application page
├── admin.html            # Admin dashboard
└── package.json          # Dependencies and scripts
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ADMIN_EMAIL` | Admin login email | Yes |
| `ADMIN_PASSWORD_HASH` | Bcrypt hash of admin password | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `FIREBASE_PROJECT_ID` | Your Firebase project ID | Yes |
| `FIREBASE_CLIENT_EMAIL` | Firebase service account email | Yes |
| `FIREBASE_PRIVATE_KEY` | Firebase service account private key | Yes |
| `SLACK_WEBHOOK_URL` | Slack webhook for notifications | No |
| `SENDGRID_API_KEY` | SendGrid API key for emails | No |

### Customization

- **Branding**: Update the title and branding in `index.html` and `admin.html`
- **Themes**: Add new editor themes in `scripts/app.js`
- **Languages**: Add new language support in `scripts/language-templates.js`
- **Code Execution**: Configure Piston API or other execution services

## 🛡️ Security Best Practices

1. **Environment Variables**
   - Never commit `.env` files
   - Use strong, unique passwords
   - Rotate JWT secrets regularly

2. **Firebase Security**
   - Use strict database rules
   - Enable Firebase App Check for additional security
   - Monitor usage in Firebase Console

3. **Production Deployment**
   - Always use HTTPS
   - Enable CORS properly
   - Implement rate limiting
   - Monitor for suspicious activity

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Write clean, documented code
- Follow existing code style
- Add tests for new features
- Update documentation as needed

## 📊 API Documentation

### Authentication Endpoints

**POST /api/auth/login**
```json
{
  "email": "admin@company.com",
  "password": "password123"
}
```

**GET /api/auth/verify**
Headers: `Authorization: Bearer <token>`

**POST /api/auth/logout**
Headers: `Authorization: Bearer <token>`

### Session Management

**POST /api/sessions/create**
Headers: `Authorization: Bearer <token>`

Returns:
```json
{
  "success": true,
  "sessionId": "ABC123",
  "created": 1234567890
}
```

## 🐛 Troubleshooting

### Common Issues

**Login not working?**
- Check environment variables are set correctly
- Verify password hash matches
- Check browser console for errors

**Firebase not syncing?**
- Verify Firebase configuration is correct
- Check database rules allow access
- Ensure Firebase project is active

**Code execution failing?**
- Check Piston API is accessible
- Verify language is supported
- Check for rate limiting

## 📈 Performance Optimization

- Uses WebSocket connections for real-time updates
- Implements debouncing for code changes
- Lazy loads language templates
- Caches Firebase connections
- Optimizes bundle sizes

## 🚧 Roadmap

- [ ] Video/Audio calling integration
- [ ] AI-powered code suggestions
- [ ] More language execution environments
- [ ] Custom theme editor
- [ ] Team collaboration features
- [ ] Advanced analytics dashboard
- [ ] Mobile app support
- [ ] IDE plugins

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [ACE Editor](https://ace.c9.io/) for code editing
- Real-time sync powered by [Firebase](https://firebase.google.com/)
- Code execution via [Piston API](https://github.com/engineer-man/piston)
- Inspired by the need for better technical interview tools

## 💬 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/OpenCollab/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/OpenCollab/discussions)
- **Email**: support@yourcompany.com

---

Made with ❤️ by the OpenCollab community