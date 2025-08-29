// PostHog Enhanced Tracking for Interview Sessions
(function() {
  // Session tracking state
  let currentSessionId = null;
  let sessionStartTime = null;
  let lastActivityTime = null;
  
  // Initialize PostHog tracking for a session
  window.initializeSessionTracking = function(sessionCode, userRole, userName) {
    currentSessionId = sessionCode;
    sessionStartTime = Date.now();
    lastActivityTime = Date.now();
    
    // Create session group in PostHog
    if (window.posthog) {
      // Set up session as a group
      window.posthog.group('session', sessionCode, {
        created_at: new Date().toISOString(),
        status: 'active',
        interviewer_present: userRole === 'interviewer',
        candidate_present: userRole === 'candidate'
      });
      
      // Identify the user
      const userId = `${sessionCode}_${userName}_${Date.now()}`;
      window.posthog.identify(userId, {
        name: userName,
        role: userRole,
        session_id: sessionCode
      });
      
      // Capture session join event with comprehensive data
      captureSessionJoin(sessionCode, userRole, userName);
      
      // Start monitoring
      startActivityMonitoring();
      startFraudDetection();
    }
  };
  
  // Capture detailed session join event
  function captureSessionJoin(sessionCode, userRole, userName) {
    const eventData = {
      // Session identification
      session_id: sessionCode,
      user_name: userName,
      user_role: userRole,
      
      // Timestamp data
      joined_at: new Date().toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timezone_offset: new Date().getTimezoneOffset(),
      local_time: new Date().toLocaleString(),
      
      // Browser & Device Info
      user_agent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      languages: navigator.languages?.join(','),
      screen_resolution: `${screen.width}x${screen.height}`,
      screen_color_depth: screen.colorDepth,
      screen_pixel_ratio: window.devicePixelRatio,
      viewport_size: `${window.innerWidth}x${window.innerHeight}`,
      
      // Browser capabilities
      cookies_enabled: navigator.cookieEnabled,
      online: navigator.onLine,
      do_not_track: navigator.doNotTrack,
      max_touch_points: navigator.maxTouchPoints,
      hardware_concurrency: navigator.hardwareConcurrency,
      device_memory: navigator.deviceMemory,
      
      // Connection info
      connection_type: navigator.connection?.effectiveType,
      connection_downlink: navigator.connection?.downlink,
      connection_rtt: navigator.connection?.rtt,
      connection_save_data: navigator.connection?.saveData,
      
      // WebGL & Canvas fingerprinting
      webgl_vendor: getWebGLInfo().vendor,
      webgl_renderer: getWebGLInfo().renderer,
      canvas_fingerprint: getCanvasFingerprint(),
      
      // Location hints (PostHog will add GeoIP data)
      referrer: document.referrer,
      page_url: window.location.href,
      
      // Behavioral indicators
      has_dev_tools: detectDevTools(),
      has_touch: 'ontouchstart' in window,
      has_webcam: navigator.mediaDevices ? 'available' : 'unavailable',
      
      // Additional context
      entry_type: performance.navigation.type,
      page_load_time: performance.timing.loadEventEnd - performance.timing.navigationStart,
      dns_time: performance.timing.domainLookupEnd - performance.timing.domainLookupStart,
      tcp_time: performance.timing.connectEnd - performance.timing.connectStart
    };
    
    // Track as both event and person property
    window.posthog.capture('session_joined', eventData);
    
    // Set person properties for this session (using setPersonProperties for newer SDK)
    window.posthog.setPersonProperties({
      last_session_id: sessionCode,
      last_join_time: new Date().toISOString(),
      total_sessions: (window.posthog.get_property('total_sessions') || 0) + 1
    });
  }
  
  // Get WebGL information for device fingerprinting
  function getWebGLInfo() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          return {
            vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
            renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
          };
        }
      }
    } catch (e) {
      console.error('WebGL detection failed:', e);
    }
    return { vendor: 'unknown', renderer: 'unknown' };
  }
  
  // Generate canvas fingerprint
  function getCanvasFingerprint() {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('Canvas fingerprint', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('Canvas fingerprint', 4, 17);
      return canvas.toDataURL().slice(-50);
    } catch (e) {
      return 'unavailable';
    }
  }
  
  // Detect if developer tools are open
  function detectDevTools() {
    const threshold = 160;
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;
    return widthThreshold || heightThreshold;
  }
  
  // Monitor user activity
  function startActivityMonitoring() {
    // Track code changes
    document.addEventListener('keydown', throttle(function(e) {
      if (currentSessionId) {
        lastActivityTime = Date.now();
        
        // Track specific key patterns
        if (e.ctrlKey || e.metaKey) {
          if (e.key === 'c') trackEvent('code_copied');
          if (e.key === 'v') trackEvent('code_pasted');
          if (e.key === 'z') trackEvent('code_undo');
          if (e.key === 's') trackEvent('attempted_save');
        }
      }
    }, 1000));
    
    // Track focus/blur (tab switches)
    document.addEventListener('visibilitychange', function() {
      if (currentSessionId) {
        trackEvent(document.hidden ? 'tab_hidden' : 'tab_visible', {
          hidden_duration: document.hidden ? 0 : Date.now() - lastActivityTime
        });
      }
    });
    
    // Track copy/paste events
    document.addEventListener('copy', () => trackEvent('content_copied'));
    document.addEventListener('paste', () => trackEvent('content_pasted'));
    
    // Track idle time
    setInterval(function() {
      if (currentSessionId) {
        const idleTime = Date.now() - lastActivityTime;
        if (idleTime > 60000) { // 1 minute idle
          trackEvent('user_idle', { idle_duration: idleTime });
        }
      }
    }, 30000); // Check every 30 seconds
  }
  
  // Fraud detection monitoring
  function startFraudDetection() {
    // Check for multiple tabs
    const tabId = Math.random().toString(36).substr(2, 9);
    localStorage.setItem(`tab_${currentSessionId}`, tabId);
    
    setInterval(function() {
      const tabs = Object.keys(localStorage)
        .filter(key => key.startsWith(`tab_${currentSessionId}`));
      
      if (tabs.length > 1) {
        trackEvent('multiple_tabs_detected', { tab_count: tabs.length });
      }
    }, 5000);
    
    // Monitor for VPN/Proxy indicators
    checkVPNIndicators();
    
    // Monitor clipboard availability changes
    if (!navigator.clipboard) {
      trackEvent('clipboard_blocked');
    }
  }
  
  // Check for VPN/Proxy indicators
  async function checkVPNIndicators() {
    try {
      // Check WebRTC IP leak
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      
      pc.createDataChannel('');
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      pc.onicecandidate = function(event) {
        if (event.candidate) {
          const ipRegex = /([0-9]{1,3}\.){3}[0-9]{1,3}/;
          const ipMatch = event.candidate.candidate.match(ipRegex);
          if (ipMatch) {
            trackEvent('webrtc_ip_detected', { 
              ip: ipMatch[0],
              is_private: ipMatch[0].startsWith('10.') || 
                         ipMatch[0].startsWith('192.168.') ||
                         ipMatch[0].startsWith('172.')
            });
          }
        }
      };
    } catch (e) {
      trackEvent('webrtc_blocked', { error: e.message });
    }
  }
  
  // Track specific events
  function trackEvent(eventName, properties = {}) {
    if (window.posthog && currentSessionId) {
      window.posthog.capture(eventName, {
        session_id: currentSessionId,
        timestamp: new Date().toISOString(),
        session_duration: Date.now() - sessionStartTime,
        ...properties
      });
    }
  }
  
  // Utility: Throttle function calls
  function throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
  
  // Track code execution
  window.trackCodeExecution = function(language, code, output, success) {
    trackEvent('code_executed', {
      language: language,
      code_length: code.length,
      output_length: output.length,
      execution_success: success,
      has_error: output.toLowerCase().includes('error'),
      line_count: code.split('\n').length
    });
  };
  
  // Track session end
  window.trackSessionEnd = function(reason) {
    if (currentSessionId) {
      trackEvent('session_ended', {
        reason: reason,
        total_duration: Date.now() - sessionStartTime,
        last_activity: Date.now() - lastActivityTime
      });
      
      // Update session group status
      window.posthog.group('session', currentSessionId, {
        status: 'ended',
        ended_at: new Date().toISOString(),
        duration: Date.now() - sessionStartTime
      });
      
      // Clean up
      localStorage.removeItem(`tab_${currentSessionId}`);
      currentSessionId = null;
    }
  };
  
  // Track interview notes and feedback
  window.trackInterviewFeedback = function(sessionCode, rating, recommendation, tags) {
    trackEvent('interview_feedback_saved', {
      session_id: sessionCode,
      rating: rating,
      recommendation: recommendation,
      tags: tags.join(','),
      has_notes: true
    });
    
    // Update session group with feedback
    window.posthog.group('session', sessionCode, {
      has_feedback: true,
      rating: rating,
      recommendation: recommendation,
      tags: tags
    });
  };
  
  // Track Slack share
  window.trackSlackShare = function(sessionCode, success) {
    trackEvent('feedback_shared_to_slack', {
      session_id: sessionCode,
      success: success
    });
  };
  
  // Make functions available globally
  window.SessionTracking = {
    initialize: initializeSessionTracking,
    trackEvent: trackEvent,
    trackCodeExecution: trackCodeExecution,
    trackSessionEnd: trackSessionEnd,
    trackInterviewFeedback: trackInterviewFeedback,
    trackSlackShare: trackSlackShare
  };
})();