// Activity Monitoring Module - Simple and Reliable
// Uses built-in browser APIs that actually work

(function() {
  let monitoring = false;
  let sessionCode = null;
  let userId = null;
  let userType = null;
  
  // Metrics
  let metrics = {
    tabSwitches: 0,
    idlePeriods: 0,
    focusLost: 0,
    totalIdleTime: 0,
    lastActiveTime: Date.now(),
    sessionStart: Date.now(),
    suspiciousPatterns: []
  };
  
  // Initialize monitoring
  window.initActivityMonitor = function(session, user, type) {
    // Only monitor candidates
    if (type === 'interviewer') {
      console.log('Activity monitoring skipped for interviewer');
      return;
    }
    
    monitoring = true;
    sessionCode = session;
    userId = user;
    userType = type;
    metrics.sessionStart = Date.now();
    
    console.log('Activity monitoring started for:', user);
    
    // Start monitoring
    setupVisibilityTracking();
    setupIdleDetection();
    setupActivityTracking();
    reportMetricsPeriodically();
  };
  
  // 1. VISIBILITY API - This actually works!
  function setupVisibilityTracking() {
    let hiddenTime = null;
    
    document.addEventListener('visibilitychange', function() {
      if (!monitoring) return;
      
      if (document.hidden) {
        // Tab became hidden
        hiddenTime = Date.now();
        metrics.tabSwitches++;
        
        console.log('Tab hidden - Total switches:', metrics.tabSwitches);
        
        // Log to Firebase
        logEvent('tab_hidden', {
          count: metrics.tabSwitches,
          timestamp: hiddenTime
        });
        
        // Alert if excessive
        if (metrics.tabSwitches > 5 && metrics.tabSwitches % 5 === 0) {
          showAlert('frequent_tab_switching', {
            count: metrics.tabSwitches
          });
        }
      } else {
        // Tab became visible
        if (hiddenTime) {
          const awayDuration = Date.now() - hiddenTime;
          console.log('Returned to tab after:', Math.round(awayDuration / 1000), 'seconds');
          
          // Log suspicious pattern
          if (awayDuration < 5000) { // Less than 5 seconds
            metrics.suspiciousPatterns.push({
              type: 'quick_tab_switch',
              duration: awayDuration,
              timestamp: Date.now()
            });
            
            // Check if paste happens soon after
            watchForPostSwitchActivity();
          }
        }
      }
    });
  }
  
  // 2. IDLE DETECTION - Using mouse/keyboard activity
  function setupIdleDetection() {
    let idleTimer = null;
    let isIdle = false;
    const IDLE_THRESHOLD = 60000; // 1 minute
    
    function resetIdleTimer() {
      if (!monitoring) return;
      
      clearTimeout(idleTimer);
      
      if (isIdle) {
        isIdle = false;
        const idleDuration = Date.now() - metrics.lastActiveTime;
        metrics.totalIdleTime += idleDuration;
        console.log('Activity resumed after idle:', Math.round(idleDuration / 1000), 'seconds');
      }
      
      metrics.lastActiveTime = Date.now();
      
      idleTimer = setTimeout(function() {
        isIdle = true;
        metrics.idlePeriods++;
        console.log('User idle detected');
        
        logEvent('idle_detected', {
          idlePeriods: metrics.idlePeriods,
          timestamp: Date.now()
        });
      }, IDLE_THRESHOLD);
    }
    
    // Track activity
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, resetIdleTimer, true);
    });
    
    // Start timer
    resetIdleTimer();
  }
  
  // 3. ACTIVITY PATTERNS - Track suspicious behaviors
  function setupActivityTracking() {
    let recentActivity = [];
    const PATTERN_WINDOW = 10000; // 10 seconds
    
    // Track copy events (we can detect ctrl+c/cmd+c)
    document.addEventListener('copy', function(e) {
      if (!monitoring) return;
      
      console.log('Copy event detected');
      recentActivity.push({
        type: 'copy',
        timestamp: Date.now()
      });
      
      logEvent('copy_detected', {
        timestamp: Date.now()
      });
    });
    
    // Track paste events (this works in the document context)
    document.addEventListener('paste', function(e) {
      if (!monitoring) return;
      
      const pasteSize = e.clipboardData ? 
        e.clipboardData.getData('text').length : 0;
      
      console.log('Paste event detected, size:', pasteSize);
      
      recentActivity.push({
        type: 'paste',
        size: pasteSize,
        timestamp: Date.now()
      });
      
      // Check for suspicious patterns
      const recentTabSwitch = metrics.suspiciousPatterns.find(p => 
        p.type === 'quick_tab_switch' && 
        Date.now() - p.timestamp < 3000
      );
      
      if (recentTabSwitch && pasteSize > 50) {
        console.warn('SUSPICIOUS: Large paste after tab switch');
        metrics.suspiciousPatterns.push({
          type: 'switch_and_paste',
          pasteSize: pasteSize,
          timestamp: Date.now()
        });
        
        showAlert('suspicious_paste_pattern', {
          size: pasteSize,
          afterTabSwitch: true
        });
      }
      
      logEvent('paste_detected', {
        size: pasteSize,
        afterTabSwitch: !!recentTabSwitch,
        timestamp: Date.now()
      });
    });
    
    // Track focus/blur
    window.addEventListener('focus', function() {
      if (!monitoring) return;
      console.log('Window focused');
      recentActivity.push({
        type: 'focus',
        timestamp: Date.now()
      });
    });
    
    window.addEventListener('blur', function() {
      if (!monitoring) return;
      metrics.focusLost++;
      console.log('Window blurred');
      recentActivity.push({
        type: 'blur',
        timestamp: Date.now()
      });
    });
    
    // Clean old activity periodically
    setInterval(function() {
      const cutoff = Date.now() - PATTERN_WINDOW;
      recentActivity = recentActivity.filter(a => a.timestamp > cutoff);
    }, 5000);
  }
  
  // 4. Watch for activity after tab switch
  function watchForPostSwitchActivity() {
    const watchDuration = 3000; // 3 seconds
    const startTime = Date.now();
    
    const checkInterval = setInterval(function() {
      if (Date.now() - startTime > watchDuration) {
        clearInterval(checkInterval);
        return;
      }
      
      // This will be caught by the paste event listener
    }, 100);
  }
  
  // 5. Log events to Firebase
  function logEvent(eventType, data) {
    if (!monitoring || !window.firebase) return;
    
    try {
      const eventData = {
        type: eventType,
        userId: userId,
        userType: userType,
        ...data,
        timestamp: Date.now()
      };
      
      firebase.database()
        .ref(`sessions/${sessionCode}/activity_log`)
        .push(eventData);
    } catch (error) {
      console.error('Failed to log event:', error);
    }
  }
  
  // 6. Show alerts to interviewer
  function showAlert(alertType, data) {
    if (!monitoring) return;
    
    const messages = {
      'frequent_tab_switching': `⚠️ Candidate has switched tabs ${data.count} times`,
      'suspicious_paste_pattern': `🚨 Large paste detected after tab switch (${data.size} chars)`,
      'extended_idle': `💤 Candidate has been idle for extended period`
    };
    
    const message = messages[alertType] || 'Suspicious activity detected';
    
    // Log alert
    logEvent('alert_triggered', {
      alertType: alertType,
      message: message,
      data: data
    });
    
    // Update UI if we have access to it
    if (window.updateBehaviorAlert) {
      window.updateBehaviorAlert(message, data);
    }
    
    console.warn('ALERT:', message);
  }
  
  // 7. Report metrics periodically
  function reportMetricsPeriodically() {
    setInterval(function() {
      if (!monitoring) return;
      
      const sessionDuration = Date.now() - metrics.sessionStart;
      const summary = {
        sessionDuration: Math.round(sessionDuration / 1000), // seconds
        tabSwitches: metrics.tabSwitches,
        idlePeriods: metrics.idlePeriods,
        totalIdleTime: Math.round(metrics.totalIdleTime / 1000), // seconds
        focusLostCount: metrics.focusLost,
        suspiciousPatterns: metrics.suspiciousPatterns.length,
        activityScore: calculateActivityScore()
      };
      
      console.log('Activity Summary:', summary);
      
      // Store summary
      if (window.firebase) {
        firebase.database()
          .ref(`sessions/${sessionCode}/activity_summary`)
          .set(summary);
      }
      
      // Update interviewer dashboard
      if (window.updateActivityDashboard) {
        window.updateActivityDashboard(summary);
      }
    }, 30000); // Every 30 seconds
  }
  
  // 8. Calculate activity score
  function calculateActivityScore() {
    let score = 100; // Start with perfect score
    
    // Deduct for tab switches
    score -= Math.min(metrics.tabSwitches * 5, 30); // Max -30
    
    // Deduct for idle time
    const idlePercent = (metrics.totalIdleTime / (Date.now() - metrics.sessionStart)) * 100;
    score -= Math.min(idlePercent * 0.5, 20); // Max -20
    
    // Deduct for suspicious patterns
    score -= metrics.suspiciousPatterns.length * 10; // -10 per pattern
    
    return Math.max(0, Math.round(score));
  }
  
  // 9. Get summary for export
  window.getActivitySummary = function() {
    if (!monitoring) return null;
    
    return {
      tabSwitches: metrics.tabSwitches,
      idlePeriods: metrics.idlePeriods,
      totalIdleSeconds: Math.round(metrics.totalIdleTime / 1000),
      suspiciousPatterns: metrics.suspiciousPatterns,
      activityScore: calculateActivityScore(),
      sessionDurationMinutes: Math.round((Date.now() - metrics.sessionStart) / 60000)
    };
  };
  
  // 10. Update interviewer UI
  window.updateActivityDashboard = function(summary) {
    const dashboard = document.getElementById('activity-dashboard');
    if (!dashboard) return;
    
    dashboard.style.display = 'block';
    dashboard.innerHTML = `
      <div class="activity-summary">
        <h4>Candidate Activity Monitor</h4>
        <div class="activity-metrics">
          <div class="metric">
            <span class="label">Tab Switches</span>
            <span class="value ${summary.tabSwitches > 10 ? 'warning' : ''}">${summary.tabSwitches}</span>
          </div>
          <div class="metric">
            <span class="label">Idle Periods</span>
            <span class="value">${summary.idlePeriods}</span>
          </div>
          <div class="metric">
            <span class="label">Activity Score</span>
            <span class="value ${summary.activityScore < 70 ? 'warning' : ''}">${summary.activityScore}%</span>
          </div>
          <div class="metric">
            <span class="label">Session Time</span>
            <span class="value">${summary.sessionDurationMinutes} min</span>
          </div>
        </div>
        ${summary.suspiciousPatterns > 0 ? `
          <div class="warning-message">
            ⚠️ ${summary.suspiciousPatterns} suspicious patterns detected
          </div>
        ` : ''}
      </div>
    `;
  };
  
  console.log('Activity Monitor module loaded - using reliable browser APIs');
})();