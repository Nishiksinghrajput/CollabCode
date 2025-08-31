# How I Vibecoded a $0 Interview Platform in a Weekend and My Team Can't Stop Using It

*A CTO's journey from subscription fatigue to building the perfect technical interview platform with AI*

## The Breaking Point

As CTO of a rapidly growing startup, I'd tried them all. CodePair ($499/month). CoderPad ($599/month). HackerRank ($1000+/month). Each promised to revolutionize our technical interviews. Each disappointed in unique ways.

The final straw came during a Principal Engineer interview. Our $599/month platform crashed mid-algorithm discussion. The candidate graciously switched to screen share, but I was done. That Friday evening, armed with Cursor IDE and Claude 3.5 Sonnet, I decided to build our own.

By Monday morning, we had a fully functional platform. By Wednesday, we'd interviewed 10 candidates. Six months later, we've conducted 400+ interviews, saved $6,000, and my team literally sends me thank you messages for building it.

This is the story of how vibecoding changed everything.

## What We Actually Needed (And Built)

Our engineering team interviews 20-30 candidates monthly. Here's what we needed:

### Core Features (Built in Hour 1-4)
- **Real-time collaborative editing** with syntax highlighting
- **Code execution** in 15+ languages (Python, JavaScript, Java, Go, etc.)
- **Six-digit session codes** - no signup required for candidates
- **Instant session creation** - one click, you're interviewing

### The Game Changers (Hour 4-12)
- **Live code execution with output streaming** - Watch candidates run their code in real-time
- **Interviewer-only notes panel** - Take notes invisible to candidates
- **Structured feedback system** - Rating (1-5 stars), tags, and hire recommendations
- **Session recording** - Every keystroke saved for later review

### The Delighters (Hour 12-24)
- **Fraud detection** - Automatically flags VPN usage and multiple login attempts
- **Slack integration** - One-click export of session notes to our hiring channel
- **Beautiful UI** - Glassmorphism, smooth animations, dark theme
- **Movie poster backgrounds** - Fun touches using our Atomtickets API

### The Advanced Features (Week 2 Additions)
- **Bulk session management** - Select multiple sessions, bulk delete/archive
- **Security dashboard** - See IP addresses, devices, locations (candidates only)
- **Interview analytics** - Success rates, average duration, common patterns
- **Question templates** - Pre-loaded coding challenges by difficulty

## The Vibecoding Process: How AI Changed Everything

### Day 1: Foundation Through Conversation

**9 AM - The Setup**
```
Me: "Create a real-time collaborative coding platform using Firebase and Firepad. 
     Add CodeMirror with syntax highlighting for Python, JavaScript, Java, Go, Ruby.
     Use Vercel for hosting. Six-digit session codes. Beautiful dark theme."

Claude: [Generates complete working application in 400 lines]
```

**10 AM - Code Execution**
```
Me: "Add code execution. Use Judge0 API for multiple languages. 
     Stream output in real-time. Show compilation errors clearly.
     Add a run button with loading state."

Claude: [Implements complete execution system with error handling]
```

**2 PM - The Interview Flow**
```
Me: "Add interviewer notes. Markdown support. Auto-save every keystroke.
     Include rating system: 1-5 stars, hire/no-hire recommendation.
     Tags for 'algorithms', 'system design', 'communication', etc."

Claude: [Creates complete note-taking system with Firebase persistence]
```

### Day 2: Production Polish

**Saturday Morning - Security**
```
Me: "Add fraud detection. Track IPs using Vercel edge functions.
     Detect VPN using datacenter IP ranges. Don't block, just flag.
     Show warnings in a security tab. Make it non-invasive."

Claude: [Builds comprehensive security system without external APIs]
```

**Saturday Afternoon - The Wow Factor**
```
Me: "Make it beautiful. Glassmorphism effects. Smooth transitions.
     Add our Atomtickets movie poster API for dynamic backgrounds.
     Professional but playful. Make engineers smile when they see it."

Claude: [Transforms UI into something that looks $100k expensive]
```

## The Technical Deep Dive: What's Under the Hood

### Real-Time Collaboration + Execution
```javascript
// The magic: Firepad for editing, Judge0 for execution
const firepadRef = firebase.database().ref(`sessions/${sessionCode}/code`);
const firepad = Firepad.fromCodeMirror(firepadRef, codeMirror);

// Code execution with output streaming
async function executeCode() {
  const response = await fetch('/api/execute', {
    method: 'POST',
    body: JSON.stringify({
      source_code: codeMirror.getValue(),
      language_id: getLanguageId(currentLanguage),
      stdin: testCases
    })
  });
  
  // Stream output to candidates and interviewers in real-time
  const reader = response.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    updateOutput(new TextDecoder().decode(value));
  }
}
```

### The Fraud Detection That Actually Works
```javascript
// Vercel Edge Function - /api/track-session.js
export default async function handler(req, res) {
  const ip = req.headers['x-forwarded-for'];
  const geo = geoip.lookup(ip); // Offline geolocation
  
  // VPN Detection
  const vpnIndicators = {
    datacenterIP: DATACENTER_RANGES.some(range => ip.startsWith(range)),
    multipleProxyHeaders: countProxyHeaders(req.headers) > 2,
    hostingProvider: geo?.org?.includes('hosting')
  };
  
  if (Object.values(vpnIndicators).some(Boolean)) {
    await firebase.database()
      .ref(`sessions/${sessionCode}/security_warnings`)
      .push({
        type: 'vpn_detected',
        timestamp: Date.now(),
        confidence: calculateConfidence(vpnIndicators)
      });
  }
}
```

### The Slack Integration Everyone Loves
```javascript
// One-click interview summary to Slack
function exportToSlack(sessionData) {
  const blocks = [
    {
      type: "header",
      text: { text: `Interview: ${sessionData.candidateName}` }
    },
    {
      type: "section",
      fields: [
        { text: `*Rating:* ${sessionData.rating}/5 ${getStars(sessionData.rating)}` },
        { text: `*Recommendation:* ${sessionData.recommendation}` },
        { text: `*Duration:* ${sessionData.duration} minutes` }
      ]
    },
    {
      type: "section",
      text: { text: `*Notes:*\n${sessionData.notes}` }
    }
  ];
  
  // Senior engineers get special formatting
  if (sessionData.recommendation === 'STRONG_HIRE') {
    blocks.push({
      type: "section",
      text: { text: "🎉 *Strong Hire Alert!* 🎉" }
    });
  }
}
```

## The Numbers: 6 Months Later

### Usage Stats
- **Total interviews conducted:** 427
- **Unique candidates:** 156  
- **Average session duration:** 47 minutes
- **Peak concurrent sessions:** 12
- **Total downtime:** 0 hours
- **Bugs reported by team:** 3 (all fixed same day)

### Financial Impact
- **Monthly savings:** $599 (vs CodePad)
- **Total saved:** $3,594
- **Development time:** 48 hours
- **ROI:** 7,488% (and growing)

### Team Satisfaction
- **NPS from engineering team:** 94
- **Quote from Senior Engineer:** "This is better than any paid tool we've used"
- **Quote from Recruiter:** "Candidates love how fast it loads"
- **Quote from me:** "I should have built this years ago"

## The Features That Make Engineers Love It

### 1. Instant Everything
No loading screens. No account creation. Generate code → Share link → Start coding. The entire flow takes under 5 seconds.

### 2. Code Execution That Just Works
```python
# Candidate writes code
def fibonacci(n):
    if n <= 1: return n
    return fibonacci(n-1) + fibonacci(n-2)

# Clicks run
# Sees output immediately: 
# Test 1: ✓ Passed
# Test 2: ✓ Passed  
# Performance: 0.23ms
```

### 3. The Security Dashboard
Every session shows:
- Candidate location and device
- VPN/proxy detection with confidence score
- Multiple login attempts
- All without being creepy or invasive

### 4. Interview Intelligence
After each session:
- Auto-generated summary
- Code replay (watch the solution evolve)
- Time spent on each problem
- Comparison with other candidates

## The Unexpected Benefits

### We Interview More
The friction is so low that engineers actually volunteer to interview. No training required, no account setup, just a link.

### Candidates Perform Better
No signup anxiety. No unfamiliar UI. Just a clean editor and clear instructions. Our offer acceptance rate increased 15%.

### We Iterate Faster
Interviewer: "Can we add Python type hints support?"
Me: "Give me 5 minutes"
*5 minutes later*
Me: "Deployed. Refresh your page."

## The Vibecoding Advantage

Building this platform traditionally would have taken months. With vibecoding:
- **Architecture decisions:** Described in English, implemented in code
- **Complex features:** Explained once, built correctly
- **Bug fixes:** "The cursor jumps when typing fast" → Fixed
- **UI polish:** "Make it look like Stripe but for coding" → Done

## Why Every Engineering Team Should Build Their Own

1. **You control the features:** Need something specific? Build it in minutes.
2. **Zero vendor lock-in:** Your data, your rules, your platform.
3. **Team morale:** Engineers love using tools built by engineers.
4. **Cost:** Firebase + Vercel free tier = $0/month for most teams.
5. **Learning:** Your team understands the entire stack.

## The Code That Powers 400+ Interviews

```javascript
// The entire session state management
const SessionManager = {
  create: () => generateSixDigitCode(),
  join: (code, name) => firebase.database().ref(`sessions/${code}/users`).push({ name }),
  execute: (code, language) => fetch('/api/execute', { method: 'POST', body: { code, language }}),
  export: (session) => postToSlack(formatInterview(session)),
  end: (code) => firebase.database().ref(`sessions/${code}`).update({ ended: true })
};

// That's it. That's the core.
```

## What's Next

We're adding:
- **AI-powered question generation** based on job requirements
- **Video calling** via WebRTC (still free)
- **Whiteboard mode** for system design
- **Take-home project management**
- **Candidate scoring ML model**

Each feature takes hours, not weeks, thanks to vibecoding.

## The Lesson

As CTOs, we often overthink build vs buy. We assume building is expensive, time-consuming, and risky. But with modern AI tools, the equation has flipped. Building is often faster, cheaper, and better than buying.

Our interview platform isn't just a tool—it's a statement. It says we can build anything we need. It says we're not dependent on vendors. It says we believe in our own abilities.

And every time a candidate compliments how smooth our interview process is, or an engineer thanks me for building it, I'm reminded that the best solutions are often the ones we build ourselves.

The age of vibecoding is here. The question isn't whether you should build your own tools—it's which one you'll build first.

---

*P.S. - My team named it "Sneakers" because "it helps candidates run their code." I'm still not sure if they're joking.*

**Want to build your own?** The entire codebase is 2,000 lines. With Claude and Cursor, you can build it in a weekend. Your team will thank you.