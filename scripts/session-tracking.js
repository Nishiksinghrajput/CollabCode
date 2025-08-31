// Session tracking module for IP, device, and security monitoring
(function() {
  const SessionTracking = {
    // Track session event (join, leave, etc.) - ONLY FOR CANDIDATES
    async trackEvent(sessionCode, userId, userName, eventType, metadata = {}) {
      // Skip all tracking for interviewers
      if (metadata?.userType === 'interviewer') {
        console.log('Skipping tracking for interviewer:', userName);
        return { success: true, skipped: true };
      }
      
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
          
          // Log security warnings (don't show alerts)
          if (data.tracked.vpnDetected) {
            console.warn('VPN/Proxy detected for', userName);
            
            // Store VPN detection as a security warning in Firebase
            if (window.firebase && sessionCode) {
              const vpnWarningRef = `sessions/${sessionCode}/security_warnings/vpn_${Date.now()}`;
              firebase.database().ref(vpnWarningRef).set({
                type: 'vpn_detected',
                userId,
                userName,
                userType: metadata?.userType,
                timestamp: Date.now(),
                message: 'VPN/Proxy connection detected'
              });
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
    async checkDuplicateLogin(sessionCode, userId, userName, userType, action = 'login') {
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
            userType,
            action
          })
        });

        const data = await response.json();
        
        if (data.warning === 'multiple_login_detected') {
          // Multiple login detected - show warning but don't block
          console.warn('Multiple login detected:', data);
          
          // Store this as a security event in Firebase
          if (window.firebase && sessionCode) {
            const warningRef = `sessions/${sessionCode}/security_warnings/${Date.now()}`;
            firebase.database().ref(warningRef).set({
              type: 'multiple_login',
              userId,
              userName,
              userType,
              existingLocation: data.existingLocation,
              newLocation: data.newLocation,
              timestamp: Date.now(),
              message: data.message
            });
          }
          
          // Show a subtle notification for candidates only
          if (userType === 'candidate') {
            console.log(`ℹ️ ${data.message}`);
            // Could show a non-blocking toast notification here
          }
        }

        return true; // Always return true - we're not blocking anymore
      } catch (error) {
        console.error('Failed to check duplicate login:', error);
        // Don't block on error
        return true;
      }
    },

    // Send heartbeat to keep session alive
    startHeartbeat(sessionCode, userId, userName, userType) {
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
              userType,
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
            userType,
            action: 'logout'
          })], { type: 'application/json' })
        );
      });
    },

    // Initialize tracking for a session - ONLY FOR CANDIDATES
    async initialize(sessionCode, userType, userName) {
      // Skip all initialization for interviewers
      if (userType === 'interviewer') {
        console.log('Skipping tracking initialization for interviewer:', userName);
        return true; // Always allow interviewers
      }
      
      const userId = `${userType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Store tracking info
      this.currentSession = {
        sessionCode,
        userId,
        userName,
        userType
      };

      // Check for duplicate login (only for candidates)
      const canProceed = await this.checkDuplicateLogin(sessionCode, userId, userName, userType);
      if (!canProceed) {
        return false;
      }

      // Track join event (only for candidates)
      await this.trackEvent(sessionCode, userId, userName, 'join', { userType });

      // Start heartbeat (only for candidates)
      this.startHeartbeat(sessionCode, userId, userName, userType);

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
        
        // Also fetch security warnings
        const warningsRef = firebase.database().ref(`sessions/${sessionCode}/security_warnings`);
        const warningsSnapshot = await warningsRef.once('value');
        const warningsData = warningsSnapshot.val() || {};

        // Process tracking entries
        const entries = Object.values(trackingData);
        const warnings = Object.values(warningsData);
        const participants = new Map();
        const securityAlerts = [];
        let vpnCount = 0;
        let multipleLoginCount = 0;
        let fraudRiskLevel = 'low'; // low, medium, high

        entries.forEach(entry => {
          // Only process candidates
          const isCandidate = entry.metadata?.userType === 'candidate';
          
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
              lastSeen: entry.timestamp,
              fraudIndicators: [] // New field for fraud tracking
            });

            // Count VPN usage for candidates only
            if (isCandidate && entry.vpn.isVPN) {
              vpnCount++;
              participants.get(entry.userId).fraudIndicators.push('VPN_DETECTED');
            }
          } else {
            // Update last seen
            const participant = participants.get(entry.userId);
            participant.lastSeen = Math.max(participant.lastSeen, entry.timestamp);
          }

          // Collect security alerts for candidates
          if (isCandidate && entry.securityFlags && entry.securityFlags.length > 0) {
            entry.securityFlags.forEach(flag => {
              securityAlerts.push({
                ...flag,
                userName: entry.userName,
                timestamp: entry.timestamp,
                userType: 'candidate'
              });
            });
          }
        });

        // Process warnings (multiple logins, VPN detections, etc.)
        warnings.forEach(warning => {
          if (warning.userType === 'candidate') {
            if (warning.type === 'multiple_login') {
              multipleLoginCount++;
              securityAlerts.push({
                type: 'multiple_login',
                severity: 'high',
                detail: `Candidate ${warning.userName} logged in from multiple locations`,
                userName: warning.userName,
                timestamp: warning.timestamp,
                existingLocation: warning.existingLocation,
                newLocation: warning.newLocation
              });
            }
            
            if (warning.type === 'vpn_detected') {
              securityAlerts.push({
                type: 'vpn',
                severity: 'medium',
                detail: `VPN/Proxy detected for candidate ${warning.userName}`,
                userName: warning.userName,
                timestamp: warning.timestamp
              });
            }
          }
        });

        // Calculate fraud risk level based on indicators
        const totalWarnings = vpnCount + multipleLoginCount + (securityAlerts.length > 5 ? 1 : 0);
        if (totalWarnings === 0) {
          fraudRiskLevel = 'low';
        } else if (totalWarnings <= 2) {
          fraudRiskLevel = 'medium';
        } else {
          fraudRiskLevel = 'high';
        }

        return {
          totalParticipants: participants.size,
          vpnUsers: vpnCount,
          multipleLogins: multipleLoginCount,
          fraudRiskLevel: fraudRiskLevel,
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

        // Determine fraud alert color and message
        const fraudColors = {
          low: '#00ff00',
          medium: '#ffaa00',
          high: '#ff0000'
        };
        const fraudBackgrounds = {
          low: 'rgba(0,255,0,0.1)',
          medium: 'rgba(255,170,0,0.2)',
          high: 'rgba(255,0,0,0.3)'
        };
        const fraudMessages = {
          low: '✓ No fraud indicators detected',
          medium: '⚠️ Potential fraud indicators detected',
          high: '🚨 HIGH FRAUD RISK - Multiple suspicious activities'
        };

        // Update summary with FRAUD RISK prominently displayed
        document.getElementById('security-tracking-data').innerHTML = `
          <div style="background: ${fraudBackgrounds[data.fraudRiskLevel]}; 
                      border: 2px solid ${fraudColors[data.fraudRiskLevel]}; 
                      padding: 15px; 
                      border-radius: 8px; 
                      margin-bottom: 15px;
                      text-align: center;">
            <h3 style="color: ${fraudColors[data.fraudRiskLevel]}; margin: 0;">
              FRAUD RISK: ${data.fraudRiskLevel.toUpperCase()}
            </h3>
            <p style="color: #fff; margin: 5px 0;">
              ${fraudMessages[data.fraudRiskLevel]}
            </p>
          </div>
          
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
            <div style="background: rgba(0,255,0,0.1); padding: 10px; border-radius: 5px;">
              <strong>Candidates:</strong> ${data.participants.filter(p => p.type === 'candidate').length}
            </div>
            <div style="background: ${data.vpnUsers > 0 ? 'rgba(255,0,0,0.2)' : 'rgba(0,255,0,0.1)'}; padding: 10px; border-radius: 5px;">
              <strong>VPN Users:</strong> ${data.vpnUsers}
              ${data.vpnUsers > 0 ? '<br><small style="color: #ffaa00;">⚠️ Suspicious</small>' : ''}
            </div>
            <div style="background: ${data.multipleLogins > 0 ? 'rgba(255,0,0,0.2)' : 'rgba(0,255,0,0.1)'}; padding: 10px; border-radius: 5px;">
              <strong>Multiple Logins:</strong> ${data.multipleLogins}
              ${data.multipleLogins > 0 ? '<br><small style="color: #ff6666;">🚨 Fraud Alert</small>' : ''}
            </div>
            <div style="background: ${data.securityAlerts.length > 0 ? 'rgba(255,255,0,0.1)' : 'rgba(0,255,0,0.1)'}; padding: 10px; border-radius: 5px;">
              <strong>Security Alerts:</strong> ${data.securityAlerts.length}
            </div>
          </div>
        `;

        // Update participants table - highlight candidates with issues
        const tbody = document.getElementById('participant-activity-body');
        tbody.innerHTML = data.participants.map(p => {
          const isCandidate = p.type === 'candidate';
          const hasIssues = p.vpn || (p.fraudIndicators && p.fraudIndicators.length > 0);
          const rowStyle = isCandidate && hasIssues ? 
            'background: rgba(255,0,0,0.1); border-left: 3px solid #ff0000;' : '';
          
          return `
          <tr style="${rowStyle}">
            <td>
              ${p.userName}
              ${isCandidate ? '<br><small style="color: #888;">(Candidate)</small>' : ''}
            </td>
            <td>${p.type}</td>
            <td>${p.location}</td>
            <td>${p.device}</td>
            <td style="font-family: monospace; font-size: 10px;">${p.ipHash.substring(0, 8)}...</td>
            <td>
              ${isCandidate && p.vpn ? '<span class="security-flag vpn">VPN</span>' : ''}
              ${isCandidate && p.fraudIndicators && p.fraudIndicators.length > 0 ? 
                '<span class="security-flag suspicious">FRAUD RISK</span>' : ''}
              ${isCandidate && p.flags.length > 0 ? p.flags.map(f => 
                `<span class="security-flag ${f.severity}">${f.type.replace(/_/g, ' ')}</span>`
              ).join('') : ''}
              ${isCandidate && !hasIssues ? '<span style="color: #00ff00;">✓ Clean</span>' : ''}
              ${!isCandidate ? '<span style="color: #666;">Not tracked</span>' : ''}
            </td>
          </tr>
        `}).join('');

        // Update security alerts with detailed fraud information
        const alertsList = document.getElementById('security-alerts-list');
        if (data.securityAlerts.length === 0) {
          alertsList.innerHTML = '<li class="info">✓ No fraud indicators or security alerts detected for candidates</li>';
        } else {
          alertsList.innerHTML = `
            <li style="background: ${fraudBackgrounds[data.fraudRiskLevel]}; 
                       border-left: 4px solid ${fraudColors[data.fraudRiskLevel]}; 
                       padding: 12px; margin-bottom: 10px;">
              <strong style="color: ${fraudColors[data.fraudRiskLevel]};">
                FRAUD ASSESSMENT: ${data.fraudRiskLevel.toUpperCase()} RISK
              </strong>
              <br>
              <small>Based on ${data.securityAlerts.length} security indicator(s) from candidate activity</small>
            </li>
            ${data.securityAlerts.map(alert => {
              const alertStyle = alert.severity === 'high' ? 
                'background: rgba(255,0,0,0.15); border-left-color: #ff0000;' :
                alert.severity === 'medium' ? 
                'background: rgba(255,170,0,0.15); border-left-color: #ffaa00;' :
                'background: rgba(0,100,255,0.1); border-left-color: #0064ff;';
              
              let detailHtml = `<strong>Candidate: ${alert.userName}</strong><br>`;
              
              if (alert.type === 'multiple_login') {
                detailHtml += `
                  <span style="color: #ff6666;">🚨 FRAUD WARNING: Multiple Login Detected</span><br>
                  <small>
                    • Original Location: ${alert.existingLocation || 'Unknown'}<br>
                    • New Location: ${alert.newLocation || 'Unknown'}<br>
                    • Potential account sharing or fraudulent access
                  </small>
                `;
              } else if (alert.type === 'vpn') {
                detailHtml += `
                  <span style="color: #ffaa00;">⚠️ VPN/Proxy Connection Detected</span><br>
                  <small>• Candidate is masking their real location</small>
                `;
              } else {
                detailHtml += `${alert.detail}`;
              }
              
              return `
                <li style="${alertStyle}">
                  ${detailHtml}
                  <br><small style="color: #888;">Detected at: ${new Date(alert.timestamp).toLocaleString()}</small>
                </li>
              `;
            }).join('')}
          `;
        }
        
        // Add detailed tracking information in a fun format
        const detailedInfo = document.getElementById('detailed-tracking-info');
        if (detailedInfo) {
          const candidates = data.participants.filter(p => p.type === 'candidate');
          
          if (candidates.length === 0) {
            detailedInfo.innerHTML = '<p style="color: #666; text-align: center;">No candidate tracking data available</p>';
          } else {
            detailedInfo.innerHTML = candidates.map(candidate => {
              const joinTime = new Date(candidate.joinTime);
              const lastSeen = new Date(candidate.lastSeen);
              const duration = Math.floor((lastSeen - joinTime) / 1000 / 60); // minutes
              
              // Fun device emoji based on device type
              const deviceEmoji = candidate.device.toLowerCase().includes('mobile') ? '📱' :
                                 candidate.device.toLowerCase().includes('tablet') ? '📱' : '💻';
              
              // Location emoji based on country
              const locationEmoji = '🌍';
              
              // VPN status with emoji
              const vpnStatus = candidate.vpn ? 
                '🔒 VPN/Proxy ACTIVE (Location Hidden)' : 
                '✅ Direct Connection (No VPN)';
              
              const vpnColor = candidate.vpn ? '#ff6666' : '#00ff00';
              
              // Create tracking notes
              const trackingNotes = [];
              if (candidate.vpn) {
                trackingNotes.push('⚠️ Using VPN to hide real location');
              }
              if (candidate.fraudIndicators && candidate.fraudIndicators.includes('VPN_DETECTED')) {
                trackingNotes.push('🚨 Potential fraud: Location masking detected');
              }
              
              // Fun session summary
              return `
                <div style="background: rgba(0,0,0,0.3); 
                           border: 1px solid #444; 
                           border-radius: 8px; 
                           padding: 15px; 
                           margin-bottom: 15px;">
                  
                  <h5 style="color: #00ff00; margin: 0 0 10px 0;">
                    👤 Candidate: ${candidate.userName}
                  </h5>
                  
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    
                    <div style="background: rgba(0,100,255,0.1); padding: 8px; border-radius: 4px;">
                      <strong>📅 Login Details:</strong><br>
                      <small>
                        • First Login: ${joinTime.toLocaleTimeString()}<br>
                        • Last Active: ${lastSeen.toLocaleTimeString()}<br>
                        • Session Duration: ${duration} minutes<br>
                        • Session ID: ${candidate.userId.substring(0, 8)}...
                      </small>
                    </div>
                    
                    <div style="background: rgba(0,255,0,0.1); padding: 8px; border-radius: 4px;">
                      <strong>${deviceEmoji} Device Info:</strong><br>
                      <small>
                        • Browser: ${candidate.device}<br>
                        • IP Hash: <code>${candidate.ipHash.substring(0, 12)}...</code><br>
                        • Type: ${deviceEmoji === '📱' ? 'Mobile Device' : 'Desktop/Laptop'}
                      </small>
                    </div>
                    
                    <div style="background: rgba(255,170,0,0.1); padding: 8px; border-radius: 4px;">
                      <strong>${locationEmoji} Location:</strong><br>
                      <small>
                        • Location: ${candidate.location}<br>
                        • Status: <span style="color: ${vpnColor}">${vpnStatus}</span>
                      </small>
                    </div>
                    
                    <div style="background: ${candidate.vpn ? 'rgba(255,0,0,0.1)' : 'rgba(0,255,0,0.1)'}; 
                               padding: 8px; 
                               border-radius: 4px;">
                      <strong>🔐 VPN Detection:</strong><br>
                      <small>
                        ${candidate.vpn ? 
                          `<span style="color: #ff6666;">
                            • VPN/Proxy: DETECTED ⚠️<br>
                            • Real Location: HIDDEN<br>
                            • Trust Level: LOW
                          </span>` : 
                          `<span style="color: #00ff00;">
                            • VPN/Proxy: Not Detected ✓<br>
                            • Location: Verified<br>
                            • Trust Level: HIGH
                          </span>`
                        }
                      </small>
                    </div>
                    
                  </div>
                  
                  ${trackingNotes.length > 0 ? `
                    <div style="background: rgba(255,0,0,0.1); 
                               padding: 10px; 
                               margin-top: 10px; 
                               border-radius: 4px;
                               border-left: 3px solid #ff6666;">
                      <strong>📝 Tracking Notes:</strong><br>
                      ${trackingNotes.map(note => `<small>• ${note}</small>`).join('<br>')}
                    </div>
                  ` : `
                    <div style="background: rgba(0,255,0,0.1); 
                               padding: 10px; 
                               margin-top: 10px; 
                               border-radius: 4px;
                               border-left: 3px solid #00ff00;">
                      <strong>📝 Tracking Notes:</strong><br>
                      <small>• ✅ No suspicious activity detected</small><br>
                      <small>• ✅ Clean session with verified location</small>
                    </div>
                  `}
                  
                </div>
              `;
            }).join('');
          }
        }
      });
    }
  };

  // Export to global scope
  window.SessionTracking = SessionTracking;
})();