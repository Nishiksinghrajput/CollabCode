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
          
          // Store tracking data in Firebase
          if (data.fullData && window.firebase) {
            const trackingPath = data.fullData.firebasePath || `sessions/${sessionCode}/tracking/${Date.now()}_${userId}`;
            try {
              await firebase.database().ref(trackingPath).set(data.fullData);
              console.log('Tracking data stored in Firebase');
            } catch (fbError) {
              console.error('Failed to store tracking in Firebase:', fbError);
            }
          }
          
          // Show security warnings if any
          if (data.tracked.vpnDetected) {
            console.warn('VPN/Proxy detected');
            // Show alert to user if VPN is detected
            if (eventType === 'join') {
              alert('⚠️ VPN/Proxy detected. Your session is being monitored for security.');
            }
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
        if (!window.firebase) {
          return null;
        }

        // Fetch tracking data from Firebase
        const trackingRef = firebase.database().ref(`sessions/${sessionCode}/tracking`);
        const snapshot = await trackingRef.once('value');
        const trackingData = snapshot.val() || {};

        // Process tracking entries
        const entries = Object.values(trackingData);
        const participants = new Map();
        const securityAlerts = [];
        let vpnCount = 0;

        entries.forEach(entry => {
          // Group by user
          if (!participants.has(entry.userId)) {
            participants.set(entry.userId, {
              userName: entry.userName,
              userId: entry.userId,
              type: entry.metadata?.userType || 'unknown',
              location: entry.location ? `${entry.location.city}, ${entry.location.country}` : 'Unknown',
              device: entry.device.browser + ' on ' + entry.device.os,
              ipHash: entry.ip,
              vpn: entry.vpn.isVPN,
              flags: entry.securityFlags || [],
              joinTime: entry.timestamp,
              lastSeen: entry.timestamp
            });

            if (entry.vpn.isVPN) {
              vpnCount++;
            }
          } else {
            // Update last seen
            const participant = participants.get(entry.userId);
            participant.lastSeen = Math.max(participant.lastSeen, entry.timestamp);
          }

          // Collect security alerts
          if (entry.securityFlags && entry.securityFlags.length > 0) {
            entry.securityFlags.forEach(flag => {
              securityAlerts.push({
                ...flag,
                userName: entry.userName,
                timestamp: entry.timestamp
              });
            });
          }
        });

        return {
          totalParticipants: participants.size,
          vpnUsers: vpnCount,
          participants: Array.from(participants.values()),
          securityAlerts: securityAlerts.sort((a, b) => b.timestamp - a.timestamp),
          rawData: entries
        };
      } catch (error) {
        console.error('Failed to get session tracking:', error);
        return null;
      }
    },

    // Display tracking data in the security tab
    displaySecurityTab(sessionCode) {
      this.getSessionTracking(sessionCode).then(data => {
        if (!data) {
          document.getElementById('security-tracking-data').innerHTML = 
            '<p class="loading-message">No tracking data available</p>';
          return;
        }

        // Update summary
        document.getElementById('security-tracking-data').innerHTML = `
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
            <div style="background: rgba(0,255,0,0.1); padding: 10px; border-radius: 5px;">
              <strong>Total Participants:</strong> ${data.totalParticipants}
            </div>
            <div style="background: ${data.vpnUsers > 0 ? 'rgba(255,0,0,0.1)' : 'rgba(0,255,0,0.1)'}; padding: 10px; border-radius: 5px;">
              <strong>VPN Users:</strong> ${data.vpnUsers}
            </div>
            <div style="background: ${data.securityAlerts.length > 0 ? 'rgba(255,255,0,0.1)' : 'rgba(0,255,0,0.1)'}; padding: 10px; border-radius: 5px;">
              <strong>Security Alerts:</strong> ${data.securityAlerts.length}
            </div>
          </div>
        `;

        // Update participants table
        const tbody = document.getElementById('participant-activity-body');
        tbody.innerHTML = data.participants.map(p => `
          <tr>
            <td>${p.userName}</td>
            <td>${p.type}</td>
            <td>${p.location}</td>
            <td>${p.device}</td>
            <td style="font-family: monospace; font-size: 10px;">${p.ipHash.substring(0, 8)}...</td>
            <td>
              ${p.vpn ? '<span class="security-flag vpn">VPN</span>' : ''}
              ${p.flags.length > 0 ? p.flags.map(f => 
                `<span class="security-flag ${f.severity}">${f.type.replace(/_/g, ' ')}</span>`
              ).join('') : '<span style="color: #00ff00;">✓ Clean</span>'}
            </td>
          </tr>
        `).join('');

        // Update security alerts
        const alertsList = document.getElementById('security-alerts-list');
        if (data.securityAlerts.length === 0) {
          alertsList.innerHTML = '<li class="info">No security alerts detected</li>';
        } else {
          alertsList.innerHTML = data.securityAlerts.map(alert => `
            <li class="${alert.severity}">
              <strong>${alert.userName}:</strong> ${alert.detail}
              <br><small>${new Date(alert.timestamp).toLocaleString()}</small>
            </li>
          `).join('');
        }
      });
    }
  };

  // Export to global scope
  window.SessionTracking = SessionTracking;
})();