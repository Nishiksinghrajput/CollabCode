# Atomtickets Collaborative Coding Interview Platform

## 🚀 Quick Access
- **Live Platform**: https://sneakers.atomtickets.com
- **Login**: hiring@atomtickets.com
- **Password**: AtomHiring2024!

## 📋 Table of Contents
- [Overview](#overview)
- [Key Features](#key-features)
- [Getting Started](#getting-started)
- [For Interviewers](#for-interviewers)
- [For Candidates](#for-candidates)
- [Session Management](#session-management)
- [Interview Notes & Feedback](#interview-notes--feedback)
- [Slack Integration](#slack-integration)
- [Security & Monitoring](#security--monitoring)

## Overview

A real-time collaborative coding platform designed for technical interviews at Atomtickets. Multiple participants can write, edit, and execute code together while interviewers take structured notes and provide hiring recommendations.

## 🌟 Key Features

### Core Functionality
- **Real-time Collaboration**: Multiple participants code together with instant synchronization
- **Multi-language Support**: JavaScript, Python, Java, C++, Go, Ruby, and more
- **Live Code Execution**: Run code directly in the browser with output display
- **Session Management**: Create, join, end, and delete interview sessions
- **Structured Feedback**: Rate candidates, add tags, and write detailed notes
- **Hiring Signals**: Clear visual indicators (Strong Hire, Hire, Next Round, Maybe, No Hire)

### Interview Management
- **Session Status Tracking**: Active → In Progress → Ended
- **Bulk Operations**: End or delete multiple sessions at once
- **Historical Data**: View past interviews with complete feedback
- **Participant Monitoring**: See who's connected in real-time
- **Fraud Detection**: Alerts when >2 people in a single session

### Integrations
- **Slack Sharing**: Share interview feedback directly to Slack channels
- **Session Replays**: Track candidate actions during the interview
- **Analytics**: PostHog integration for usage tracking

## 🎯 Getting Started

### For Interviewers

#### 1. Login as Admin
1. Navigate to https://sneakers.atomtickets.com
2. Click **"I'm an Interviewer"**
3. Enter credentials:
   - Email: `hiring@atomtickets.com`
   - Password: `AtomHiring2024!`

#### 2. Create a New Session
1. Click **"Create New Session"** in the admin dashboard
2. A 6-digit session code is generated automatically
3. Share this code with your candidate

#### 3. Join the Session
1. Click **"Join"** next to your session
2. You'll enter the collaborative coding environment
3. The editor supports syntax highlighting and auto-completion

#### 4. During the Interview

**Taking Notes (Right Panel)**
- Click the **📝 Notes** button to open the notes panel
- **Rate the candidate**: Click 1-5 stars
- **Add quick tags**: Communication, Problem Solving, Code Quality, etc.
- **Write detailed notes**: Free-form text area
- **Select recommendation**: Strong Hire, Hire, Next Round, Maybe, No Hire
- **Auto-save**: Notes save automatically as you type
- Click **"Save Notes"** for manual save

**Code Collaboration**
- Write code together in real-time
- Run code using the **▶ Run** button
- View output in the bottom panel
- Change languages from the dropdown menu

#### 5. End the Interview
1. Click **"End Interview"** button (admin only)
2. Session moves to "Ended Sessions" tab
3. All participants are notified
4. Session data and notes are preserved

### For Candidates

#### 1. Join a Session
1. Navigate to https://sneakers.atomtickets.com
2. Click **"I'm a Candidate"**
3. Enter:
   - Your name
   - 6-digit session code from interviewer
4. Click **"Join Session"**

#### 2. During the Interview
- Write and edit code in real-time
- See interviewer's cursor and changes
- Run code and view output
- Communicate through external video call

## 📊 Session Management

### View All Sessions
1. From admin dashboard, click **"View All Active Sessions"**
2. Two tabs available:
   - **Active/In Progress**: Ongoing interviews
   - **Ended Sessions**: Completed interviews

### Session Information Display
Each session shows:
- **Status Badge**: Active (green), In Progress (blue), Ended (gray)
- **Session Code**: 6-digit identifier
- **Candidate Name**: With hiring signal badge if notes exist
- **Participants**: All connected users
- **Time**: Session creation time
- **Actions**: View, Join, End, Delete

### Bulk Operations
- **Select sessions**: Use checkboxes
- **End Selected**: Ends multiple active sessions
- **Delete Selected**: Permanently removes from database
- **Delete All**: Nuclear option (use `deleteAllSessions()` in console)

## 💭 Interview Notes & Feedback

### Accessing Notes
1. Click **📋 View** on any session
2. Notes tab shows:
   - Overall rating (1-5 stars)
   - Selected tags
   - Written feedback
   - Hiring recommendation
   - Last updated time

### Hiring Signals
Color-coded recommendations appear as badges:
- 🟢 **Strong Hire**: Exceptional candidate
- 🟢 **Hire**: Good fit for the role
- 🔵 **Next Round**: Proceed to next interview
- 🟠 **Maybe**: Borderline, needs discussion
- 🔴 **No Hire**: Not a fit

## 🔔 Slack Integration

### Setup (First Time)
1. Get webhook URL from Slack:
   - Go to https://api.slack.com/messaging/webhooks
   - Create app or use existing
   - Add "Incoming Webhooks"
   - Generate webhook for your channel

### Share to Slack
1. Click **📋 View** on a session
2. Click the **Slack button** in modal header
3. Paste webhook URL (saved for future use)
4. Preview the formatted message
5. Click **"Send to Slack"**

### Slack Message Includes
- Candidate name
- Hiring recommendation with color
- Star rating
- Tags applied
- Full interview notes
- Session code for reference

## 🔒 Security & Monitoring

### Access Control
- Interviewers need credentials
- Candidates need valid session code
- Sessions auto-expire after 2 hours
- Firebase security rules enforce permissions

### Fraud Prevention
- Real-time participant count
- Alert when >2 users in session
- Session replay tracking
- All actions logged

### Data Management
- **End**: Marks as completed, preserves data
- **Delete**: Permanent removal from database
- Double confirmation for deletions
- Bulk operations require confirmation

## 🛠️ Troubleshooting

### Common Issues

**Can't join session**
- Verify 6-digit code is correct
- Check session hasn't ended
- Ensure session exists in database

**Notes not saving**
- Check internet connection
- Verify you're logged in as interviewer
- Try manual save button
- Refresh page if needed

**Slack not working**
- Verify webhook URL is correct
- Check browser console for errors
- Ensure popup blockers are disabled
- Try regenerating webhook

**Code not running**
- Check language is selected correctly
- Verify code has no syntax errors
- Some languages have execution limits
- Try simpler test code first

## 📈 Best Practices

### For Effective Interviews
1. Create session 5 minutes before interview
2. Test audio/video separately (not built-in)
3. Have backup questions ready
4. Take notes during natural pauses
5. Save recommendation immediately after

### For Session Management
1. End sessions promptly after interviews
2. Delete old test sessions regularly
3. Review ended sessions weekly
4. Export important feedback to Slack
5. Use tags consistently across team

## 🆘 Support

For issues or questions:
- Technical issues: Check browser console (F12)
- Database issues: Verify Firebase rules are updated
- Feature requests: Document use case clearly
- Emergency: Use `deleteAllSessions()` to clear database

---

*Built with ❤️ for Atomtickets Engineering Team*