// Behavioral Tracking Module for Candidate Monitoring
// Tracks: paste events, tab switches, typing patterns, focus changes
// Only tracks candidates, not interviewers

(function() {
  let isTracking = false;
  let userType = null;
  let sessionCode = null;
  let userId = null;
  
  // Tracking state
  let tabSwitchCount = 0;
  let pasteEvents = [];
  let typingMetrics = {
    totalKeystrokes: 0,
    samples: [],
    lastKeystrokeTime: Date.now(),
    suspiciousBursts: 0
  };
  let focusEvents = [];
  let lastActivityTime = Date.now();
  
  // Initialize behavioral tracking
  window.initBehaviorTracking = function(session, user, type) {
    // Only track candidates
    if (type === 'interviewer') {
      console.log('Behavioral tracking skipped for interviewer');
      return;
    }
    
    isTracking = true;
    userType = type;
    sessionCode = session;
    userId = user;
    
    console.log('Behavioral tracking initialized for candidate:', user);
    
    // Start all trackers
    trackTabSwitches();
    trackPasteEvents();
    trackTypingPatterns();
    trackFocusEvents();
    
    // Send periodic summaries
    setInterval(sendBehaviorSummary, 30000); // Every 30 seconds
  };
  
  // 1. Tab Switch Detection
  function trackTabSwitches() {
    let lastSwitchTime = Date.now();
    console.log('Setting up tab switch tracking...');
    
    document.addEventListener('visibilitychange', function() {
      console.log('Visibility changed, hidden:', document.hidden, 'tracking:', isTracking);
      if (!isTracking) return;
      
      const now = Date.now();
      const timeSinceLastSwitch = now - lastSwitchTime;
      
      if (document.hidden) {
        tabSwitchCount++;
        lastSwitchTime = now;
        console.log('Tab switch detected! Count:', tabSwitchCount);
        
        // Log to Firebase
        const eventData = {
          type: 'tab_switch',
          action: 'left',
          count: tabSwitchCount,
          timestamp: now,
          duration_since_last: timeSinceLastSwitch
        };
        
        firebase.database().ref(`sessions/${sessionCode}/behavior/tab_switches`).push(eventData);
        
        // Real-time notification for interviewer
        if (tabSwitchCount > 5) {
          notifyInterviewer('frequent_tab_switching', {
            count: tabSwitchCount,
            severity: tabSwitchCount > 10 ? 'high' : 'medium'
          });
        }
      } else {
        // Returned to tab - watch for paste
        watchForPostSwitchPaste();
      }
    });
    
    // Also track blur/focus
    window.addEventListener('blur', function() {
      if (!isTracking || document.hidden) return;
      focusEvents.push({ type: 'blur', timestamp: Date.now() });
    });
    
    window.addEventListener('focus', function() {
      if (!isTracking) return;
      focusEvents.push({ type: 'focus', timestamp: Date.now() });
    });
  }
  
  // 2. Paste Event Detection
  function trackPasteEvents() {
    console.log('Setting up paste tracking...');
    
    // Listen for ACE editor paste events (sent from firepad.js)
    document.addEventListener('editorPaste', function(e) {
      console.log('Editor paste event received:', e.detail);
      if (!isTracking) return;
      
      const fakeEvent = {
        clipboardData: {
          getData: function() { return e.detail.text; }
        }
      };
      handlePasteEvent(fakeEvent);
    });
    
    // Also track global paste (for paste outside editor)
    document.addEventListener('paste', function(e) {
      console.log('Global paste event detected, tracking:', isTracking);
      if (!isTracking) return;
      handlePasteEvent(e);
    });
  }
  
  function handlePasteEvent(e) {
    const pastedText = e.clipboardData ? e.clipboardData.getData('text') : '';
    const now = Date.now();
    
    // Analyze paste content
    const analysis = {
      timestamp: now,
      size: pastedText.length,
      lines: pastedText.split('\n').length,
      hasCode: detectCodePattern(pastedText),
      afterTabSwitch: (now - getLastTabSwitchTime()) < 3000, // Within 3 seconds
      characteristics: analyzePasteContent(pastedText)
    };
    
    pasteEvents.push(analysis);
    
    // Store significant pastes
    if (analysis.size > 50) {
      firebase.database().ref(`sessions/${sessionCode}/behavior/paste_events`).push({
        ...analysis,
        preview: pastedText.substring(0, 100) + (pastedText.length > 100 ? '...' : '')
      });
      
      // Alert for large pastes
      if (analysis.size > 200 && analysis.hasCode) {
        notifyInterviewer('large_code_paste', {
          size: analysis.size,
          lines: analysis.lines,
          afterTabSwitch: analysis.afterTabSwitch,
          severity: analysis.size > 500 ? 'high' : 'medium'
        });
      }
    }
  }
  
  function detectCodePattern(text) {
    // Common code patterns
    const codePatterns = [
      /function\s+\w+\s*\(/,
      /if\s*\([^)]+\)\s*{/,
      /for\s*\([^)]+\)\s*{/,
      /class\s+\w+/,
      /def\s+\w+\s*\(/,
      /import\s+[\w{}/,
      /const\s+\w+\s*=/,
      /let\s+\w+\s*=/,
      /return\s+/
    ];
    
    return codePatterns.some(pattern => pattern.test(text));
  }
  
  function analyzePasteContent(text) {
    const characteristics = [];
    
    // Check for AI-generated patterns
    if (/Here's|here's a|The following|Step \d+:|Note:|TODO:/.test(text)) {
      characteristics.push('ai_pattern');
    }
    
    // Check for perfect formatting
    if (/^\s{2,}/m.test(text) && text.split('\n').length > 5) {
      characteristics.push('well_formatted');
    }
    
    // Check for comments
    const commentRatio = (text.match(/\/\/|#|\/\*/g) || []).length / text.split('\n').length;
    if (commentRatio > 0.3) {
      characteristics.push('heavily_commented');
    }
    
    return characteristics;
  }
  
  // 3. Typing Pattern Analysis
  function trackTypingPatterns() {
    console.log('Setting up typing pattern tracking...');
    
    let keystrokeBuffer = [];
    let lastEventTime = Date.now();
    
    // Listen for ACE editor change events (sent from firepad.js)
    document.addEventListener('editorChange', function(e) {
      if (!isTracking) return;
      
      const change = e.detail;
      if (change.action === 'setValue') return; // Ignore programmatic changes
      
      const now = Date.now();
      const timeDiff = now - lastEventTime;
      lastEventTime = now;
      
      // Track keystroke timing
      if (change.action === 'insert' || change.action === 'insertText') {
        typingMetrics.totalKeystrokes++;
        
        // Calculate WPM from recent keystrokes
        const textLength = change.text ? change.text.length : 0;
        keystrokeBuffer.push({ time: now, chars: textLength });
        
        // Keep only last 5 seconds of keystrokes
        keystrokeBuffer = keystrokeBuffer.filter(k => now - k.time < 5000);
        
        if (keystrokeBuffer.length > 10) {
          const wpm = calculateWPM(keystrokeBuffer);
          
          // Detect suspicious speeds
          if (wpm > 150) {
            typingMetrics.suspiciousBursts++;
            
            notifyInterviewer('suspicious_typing_speed', {
              wpm: wpm,
              burst: true,
              severity: wpm > 200 ? 'high' : 'medium'
            });
          }
          
          // Sample typing speed
          typingMetrics.samples.push({ wpm, timestamp: now });
        }
      }
      
      // Detect large insertions (potential paste via typing)
      const insertedText = change.text || '';
      if (insertedText.length > 50 && timeDiff < 100) {
        notifyInterviewer('instant_code_appearance', {
          size: insertedText.length,
          timeGap: timeDiff,
          severity: 'high'
        });
      }
    });
  }
  
  function calculateWPM(buffer) {
    if (buffer.length < 2) return 0;
    
    const timeSpan = (buffer[buffer.length - 1].time - buffer[0].time) / 1000 / 60; // minutes
    const totalChars = buffer.reduce((sum, k) => sum + k.chars, 0);
    const words = totalChars / 5; // Average word length
    
    return Math.round(words / timeSpan);
  }
  
  // 4. Focus Event Tracking
  function trackFocusEvents() {
    let inactivityTimer;
    
    // Track mouse/keyboard activity
    ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(eventType => {
      document.addEventListener(eventType, function() {
        if (!isTracking) return;
        
        lastActivityTime = Date.now();
        clearTimeout(inactivityTimer);
        
        // Set inactivity timer
        inactivityTimer = setTimeout(function() {
          const inactiveDuration = Date.now() - lastActivityTime;
          if (inactiveDuration > 60000) { // 1 minute
            notifyInterviewer('candidate_inactive', {
              duration: Math.round(inactiveDuration / 1000),
              severity: 'low'
            });
          }
        }, 60000);
      });
    });
  }
  
  // 5. Watch for paste after tab switch
  function watchForPostSwitchPaste() {
    const watchWindow = 3000; // 3 seconds
    const startWatch = Date.now();
    
    const checkPaste = setInterval(function() {
      if (Date.now() - startWatch > watchWindow) {
        clearInterval(checkPaste);
        return;
      }
      
      // Check if paste occurred
      const recentPaste = pasteEvents.find(p => p.timestamp > startWatch);
      if (recentPaste) {
        clearInterval(checkPaste);
        
        // Flag this pattern
        notifyInterviewer('tab_switch_paste_pattern', {
          pasteSize: recentPaste.size,
          timeGap: recentPaste.timestamp - startWatch,
          severity: 'high'
        });
      }
    }, 100);
  }
  
  // 6. Send behavior summary periodically
  function sendBehaviorSummary() {
    if (!isTracking) return;
    
    const summary = {
      timestamp: Date.now(),
      tabSwitches: tabSwitchCount,
      pasteCount: pasteEvents.length,
      largePastes: pasteEvents.filter(p => p.size > 200).length,
      totalKeystrokes: typingMetrics.totalKeystrokes,
      suspiciousBursts: typingMetrics.suspiciousBursts,
      averageWPM: calculateAverageWPM(),
      inactivityPeriods: calculateInactivityPeriods(),
      riskScore: calculateBehaviorRiskScore()
    };
    
    // Store summary
    firebase.database().ref(`sessions/${sessionCode}/behavior/summaries`).push(summary);
    
    // Update UI if risk is high
    if (summary.riskScore.level === 'HIGH') {
      updateInterviewerDashboard(summary);
    }
  }
  
  function calculateAverageWPM() {
    if (typingMetrics.samples.length === 0) return 0;
    const sum = typingMetrics.samples.reduce((acc, s) => acc + s.wpm, 0);
    return Math.round(sum / typingMetrics.samples.length);
  }
  
  function calculateInactivityPeriods() {
    const periods = [];
    let lastTime = Date.now() - 1800000; // Last 30 minutes
    
    focusEvents.forEach(event => {
      if (event.type === 'blur') {
        lastTime = event.timestamp;
      } else if (event.type === 'focus' && lastTime) {
        const duration = event.timestamp - lastTime;
        if (duration > 30000) { // More than 30 seconds
          periods.push(duration);
        }
      }
    });
    
    return periods.length;
  }
  
  function calculateBehaviorRiskScore() {
    let score = 0;
    const factors = [];
    
    // Tab switching
    if (tabSwitchCount > 10) {
      score += 20;
      factors.push('excessive_tab_switching');
    }
    if (tabSwitchCount > 20) {
      score += 15;
      factors.push('very_high_tab_switches');
    }
    
    // Paste behavior
    const largePastes = pasteEvents.filter(p => p.size > 200).length;
    if (largePastes > 2) {
      score += 25;
      factors.push('multiple_large_pastes');
    }
    
    const aiPastes = pasteEvents.filter(p => p.characteristics.includes('ai_pattern')).length;
    if (aiPastes > 0) {
      score += 30;
      factors.push('ai_pattern_detected');
    }
    
    // Typing patterns
    if (typingMetrics.suspiciousBursts > 3) {
      score += 20;
      factors.push('suspicious_typing_speed');
    }
    
    // Tab switch + paste combo
    const switchPasteCombos = pasteEvents.filter(p => p.afterTabSwitch).length;
    if (switchPasteCombos > 2) {
      score += 25;
      factors.push('tab_switch_paste_pattern');
    }
    
    return {
      score: Math.min(score, 100),
      level: score > 70 ? 'HIGH' : score > 40 ? 'MEDIUM' : 'LOW',
      factors: factors
    };
  }
  
  // 7. Real-time notifications to interviewer
  function notifyInterviewer(eventType, data) {
    // Store notification
    const notification = {
      type: eventType,
      data: data,
      timestamp: Date.now(),
      candidateId: userId
    };
    
    firebase.database().ref(`sessions/${sessionCode}/notifications`).push(notification);
    
    // Update UI indicator
    updateNotificationBadge(data.severity);
    
    // Show toast notification if high severity
    if (data.severity === 'high') {
      showToastNotification(eventType, data);
    }
  }
  
  function updateNotificationBadge(severity) {
    const badge = document.getElementById('behavior-alert-badge');
    if (!badge) return;
    
    const current = parseInt(badge.textContent || '0');
    badge.textContent = current + 1;
    badge.className = `alert-badge ${severity}`;
    badge.style.display = 'inline-block';
  }
  
  function showToastNotification(type, data) {
    const messages = {
      'large_code_paste': `⚠️ Large code paste detected (${data.size} chars)`,
      'suspicious_typing_speed': `⚡ Unusual typing speed: ${data.wpm} WPM`,
      'tab_switch_paste_pattern': '🔄 Tab switch followed by paste',
      'frequent_tab_switching': `👁 Frequent tab switching (${data.count} times)`,
      'instant_code_appearance': '⚡ Code appeared instantly',
      'ai_pattern_detected': '🤖 Possible AI-generated code detected'
    };
    
    const message = messages[type] || 'Suspicious activity detected';
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'behavior-toast';
    toast.innerHTML = `
      <div class="toast-content ${data.severity}">
        <span class="toast-message">${message}</span>
        <button onclick="viewBehaviorDetails('${type}')" class="toast-action">View Details</button>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }
  
  // 8. Update interviewer dashboard
  function updateInterviewerDashboard(summary) {
    const dashboard = document.getElementById('behavior-dashboard');
    if (!dashboard) return;
    
    // Show the dashboard
    dashboard.style.display = 'block';
    
    dashboard.innerHTML = `
      <div class="behavior-summary">
        <h4>Candidate Behavior Analysis</h4>
        <div class="behavior-metrics">
          <div class="metric ${summary.tabSwitches > 10 ? 'warning' : ''}">
            <span class="metric-label">Tab Switches</span>
            <span class="metric-value">${summary.tabSwitches}</span>
          </div>
          <div class="metric ${summary.largePastes > 2 ? 'warning' : ''}">
            <span class="metric-label">Large Pastes</span>
            <span class="metric-value">${summary.largePastes}</span>
          </div>
          <div class="metric ${summary.averageWPM > 120 ? 'warning' : ''}">
            <span class="metric-label">Avg WPM</span>
            <span class="metric-value">${summary.averageWPM}</span>
          </div>
          <div class="metric risk-${summary.riskScore.level.toLowerCase()}">
            <span class="metric-label">Risk Level</span>
            <span class="metric-value">${summary.riskScore.level}</span>
          </div>
        </div>
        ${summary.riskScore.factors.length > 0 ? `
          <div class="risk-factors">
            <strong>Risk Factors:</strong>
            <ul>
              ${summary.riskScore.factors.map(f => `<li>${f.replace(/_/g, ' ')}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
    `;
  }
  
  // 9. Export behavior data for session notes
  window.getBehaviorSummaryForNotes = function() {
    if (!isTracking) return null;
    
    const summary = {
      tabSwitches: tabSwitchCount,
      pasteEvents: pasteEvents.length,
      largePastes: pasteEvents.filter(p => p.size > 200).length,
      aiPatterns: pasteEvents.filter(p => p.characteristics.includes('ai_pattern')).length,
      averageWPM: calculateAverageWPM(),
      suspiciousTyping: typingMetrics.suspiciousBursts,
      riskScore: calculateBehaviorRiskScore(),
      timeline: generateBehaviorTimeline()
    };
    
    return summary;
  };
  
  function generateBehaviorTimeline() {
    const events = [];
    
    // Add tab switches
    tabSwitchCount && events.push({
      time: 'Throughout',
      event: `${tabSwitchCount} tab switches`,
      severity: tabSwitchCount > 10 ? 'high' : 'medium'
    });
    
    // Add major pastes
    pasteEvents.filter(p => p.size > 200).forEach(p => {
      events.push({
        time: new Date(p.timestamp).toLocaleTimeString(),
        event: `Pasted ${p.size} characters${p.afterTabSwitch ? ' (after tab switch)' : ''}`,
        severity: p.size > 500 ? 'high' : 'medium'
      });
    });
    
    // Sort by time
    events.sort((a, b) => a.time.localeCompare(b.time));
    
    return events;
  }
  
  // Utility functions
  function getLastTabSwitchTime() {
    // Find last tab switch time from Firebase or local state
    return lastActivityTime; // Simplified for now
  }
  
  // Initialize on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  function init() {
    console.log('Behavior tracking module loaded');
    
    // Add styles for notifications
    const style = document.createElement('style');
    style.textContent = `
      .behavior-toast {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
      }
      
      .toast-content {
        background: rgba(30, 30, 30, 0.95);
        border-radius: 8px;
        padding: 12px 16px;
        display: flex;
        align-items: center;
        gap: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        border-left: 4px solid;
      }
      
      .toast-content.high {
        border-color: #ff4444;
      }
      
      .toast-content.medium {
        border-color: #ff9800;
      }
      
      .toast-content.low {
        border-color: #4caf50;
      }
      
      .toast-message {
        color: white;
        font-size: 14px;
      }
      
      .toast-action {
        background: rgba(255,255,255,0.1);
        border: 1px solid rgba(255,255,255,0.2);
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
      }
      
      .toast-action:hover {
        background: rgba(255,255,255,0.2);
      }
      
      .behavior-toast.fade-out {
        animation: slideOut 0.3s ease;
      }
      
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
      
      .behavior-metrics {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
        margin: 16px 0;
      }
      
      .metric {
        background: rgba(255,255,255,0.05);
        padding: 8px;
        border-radius: 4px;
        text-align: center;
      }
      
      .metric.warning {
        background: rgba(255,152,0,0.1);
        border: 1px solid rgba(255,152,0,0.3);
      }
      
      .metric-label {
        display: block;
        font-size: 11px;
        color: #999;
        margin-bottom: 4px;
      }
      
      .metric-value {
        display: block;
        font-size: 18px;
        font-weight: bold;
      }
      
      .risk-low .metric-value { color: #4caf50; }
      .risk-medium .metric-value { color: #ff9800; }
      .risk-high .metric-value { color: #ff4444; }
      
      .alert-badge {
        background: #ff4444;
        color: white;
        border-radius: 10px;
        padding: 2px 6px;
        font-size: 10px;
        position: absolute;
        top: -5px;
        right: -5px;
      }
    `;
    document.head.appendChild(style);
  }
})();