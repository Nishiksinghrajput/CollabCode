// Session tracking module for IP, device, and security monitoring
(function() {
  const SessionTracking = {
    // Track session event (join, leave, etc.)
    async trackEvent(sessionCode, userId, userName, eventType, metadata = {}) {
      try {
        // Get client-side metadata
        const clientMetadata = {
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          language: navigator.language,
          platform: navigator.platform,
          cookieEnabled: navigator.cookieEnabled,
          onLine: navigator.onLine,
          ...metadata
        };

        // Send tracking data to API
        const response = await fetch('/api/track-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionCode,
            userId,
            userName,
            eventType,
            metadata: clientMetadata
          })
        });

        const data = await response.json();
        
        if (data.success) {
          console.log('Session tracked:', data.tracked);
          
          // Show security warnings if any
          if (data.tracked.vpnDetected) {
            console.warn('VPN/Proxy detected');
          }
          
          if (data.tracked.securityFlags > 0) {
            console.warn(`${data.tracked.securityFlags} security flag(s) detected`);
          }
        }

        return data;
      } catch (error) {
        console.error('Failed to track session:', error);
        return { success: false, error: error.message };
      }
    },

    // Check for duplicate login
    async checkDuplicateLogin(sessionCode, userId, userName, action = 'login') {
      try {
        const response = await fetch('/api/check-duplicate-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionCode,
            userId,
            userName,
            action
          })
        });

        const data = await response.json();
        
        if (response.status === 403) {
          // Multiple login detected
          const message = `${data.message}\n\nLast active: ${data.lastActivity}\nLocation: ${data.existingLocation}\nDevice: ${data.existingDevice}`;
          alert(message);
          return false;
        }

        return true;
      } catch (error) {
        console.error('Failed to check duplicate login:', error);
        // Don't block on error
        return true;
      }
    },

    // Send heartbeat to keep session alive
    startHeartbeat(sessionCode, userId, userName) {
      // Send heartbeat every 2 minutes
      const heartbeatInterval = setInterval(async () => {
        try {
          await fetch('/api/check-duplicate-login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sessionCode,
              userId,
              userName,
              action: 'heartbeat'
            })
          });
        } catch (error) {
          console.error('Heartbeat failed:', error);
        }
      }, 2 * 60 * 1000);

      // Store interval ID for cleanup
      window.sessionHeartbeat = heartbeatInterval;

      // Clean up on page unload
      window.addEventListener('beforeunload', () => {
        clearInterval(heartbeatInterval);
        
        // Send logout event
        navigator.sendBeacon('/api/check-duplicate-login', 
          new Blob([JSON.stringify({
            sessionCode,
            userId,
            userName,
            action: 'logout'
          })], { type: 'application/json' })
        );
      });
    },

    // Initialize tracking for a session
    async initialize(sessionCode, userType, userName) {
      const userId = `${userType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Store tracking info
      this.currentSession = {
        sessionCode,
        userId,
        userName,
        userType
      };

      // Check for duplicate login
      const canProceed = await this.checkDuplicateLogin(sessionCode, userId, userName);
      if (!canProceed) {
        return false;
      }

      // Track join event
      await this.trackEvent(sessionCode, userId, userName, 'join', { userType });

      // Start heartbeat
      this.startHeartbeat(sessionCode, userId, userName);

      return true;
    },

    // Track when user leaves
    async trackLeave() {
      if (this.currentSession) {
        await this.trackEvent(
          this.currentSession.sessionCode,
          this.currentSession.userId,
          this.currentSession.userName,
          'leave'
        );
      }
    },

    // Get tracking summary for a session
    async getSessionTracking(sessionCode) {
      try {
        // This would fetch from Firebase or your database
        // For now, return mock data
        return {
          totalParticipants: 0,
          vpnUsers: 0,
          locations: [],
          devices: [],
          securityFlags: []
        };
      } catch (error) {
        console.error('Failed to get session tracking:', error);
        return null;
      }
    }
  };

  // Export to global scope
  window.SessionTracking = SessionTracking;
})();