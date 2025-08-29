// Main Application Controller
(function() {
  // Initialize the application
  function init() {
    setupLandingPage();
    setupCandidateFlow();
    setupAdminFlow();
  }

  // Setup landing page
  function setupLandingPage() {
    // Candidate button - support both old and new classes
    const candidateBtn = document.querySelector('#candidateCard .role-btn');
    if (candidateBtn) {
      candidateBtn.addEventListener('click', function() {
        document.getElementById('landingModal').style.display = 'none';
        document.getElementById('candidateModal').style.display = 'flex';
      });
    }

    // Admin button - support both old and new classes  
    const adminBtn = document.querySelector('#adminCard .role-btn');
    if (adminBtn) {
      adminBtn.addEventListener('click', function() {
        document.getElementById('landingModal').style.display = 'none';
        document.getElementById('adminLoginModal').style.display = 'flex';
      });
    }
  }

  // Setup candidate flow
  function setupCandidateFlow() {
    const candidateName = document.getElementById('candidateName');
    const candidateSessionCode = document.getElementById('candidateSessionCode');
    const candidateJoinBtn = document.getElementById('candidateJoinBtn');
    const candidateBack = document.getElementById('candidateBack');

    // Back button
    candidateBack.addEventListener('click', function() {
      document.getElementById('candidateModal').style.display = 'none';
      document.getElementById('landingModal').style.display = 'flex';
    });

    // Enable/disable join button
    function updateJoinButton() {
      candidateJoinBtn.disabled = 
        !candidateName.value.trim() || 
        candidateSessionCode.value.length !== 6;
    }

    candidateName.addEventListener('input', updateJoinButton);
    candidateSessionCode.addEventListener('input', function() {
      this.value = this.value.replace(/[^0-9]/g, '').slice(0, 6);
      updateJoinButton();
    });

    // Join session
    candidateJoinBtn.addEventListener('click', async function() {
      const name = candidateName.value.trim();
      const sessionCode = candidateSessionCode.value;

      if (name && sessionCode.length === 6) {
        // Show loading state
        candidateJoinBtn.disabled = true;
        candidateJoinBtn.textContent = 'Validating...';
        
        // Validate session exists before joining (pass true for isCandidate)
        const validation = await validateSession(sessionCode, true);
        
        if (!validation.valid) {
          candidateJoinBtn.disabled = false;
          candidateJoinBtn.textContent = 'Join Session';
          alert(validation.error || 'Invalid session code. Please check with your interviewer.');
          return;
        }
        
        Auth.joinAsCandidate(name);
        window.location.hash = sessionCode;
        startSession(name, sessionCode, false);
      }
    });

    // Enter key support
    candidateSessionCode.addEventListener('keypress', function(e) {
      if (e.key === 'Enter' && !candidateJoinBtn.disabled) {
        candidateJoinBtn.click();
      }
    });
  }

  // Setup admin flow
  function setupAdminFlow() {
    const adminEmail = document.getElementById('adminEmail');
    const adminPassword = document.getElementById('adminPassword');
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    const adminLoginBack = document.getElementById('adminLoginBack');
    const loginError = document.getElementById('loginError');

    // Back button
    adminLoginBack.addEventListener('click', function() {
      document.getElementById('adminLoginModal').style.display = 'none';
      document.getElementById('landingModal').style.display = 'flex';
      loginError.style.display = 'none';
    });

    // Login
    adminLoginBtn.addEventListener('click', async function() {
      const email = adminEmail.value.trim();
      const password = adminPassword.value;

      // Show loading state
      adminLoginBtn.disabled = true;
      adminLoginBtn.textContent = 'Logging in...';
      loginError.style.display = 'none';

      try {
        const result = await Auth.loginAdmin(email, password);
        
        if (result.success) {
          document.getElementById('adminLoginModal').style.display = 'none';
          document.getElementById('adminDashboardModal').style.display = 'flex';
          setupAdminDashboard();
        } else {
          loginError.textContent = result.error;
          loginError.style.display = 'block';
        }
      } catch (error) {
        loginError.textContent = 'Login failed. Please try again.';
        loginError.style.display = 'block';
      } finally {
        // Reset button state
        adminLoginBtn.disabled = false;
        adminLoginBtn.textContent = 'Login';
      }
    });

    // Enter key support
    adminPassword.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        adminLoginBtn.click();
      }
    });
  }

  // Setup admin dashboard
  function setupAdminDashboard() {
    const createSessionBtn = document.getElementById('createSessionBtn');
    const adminSessionCode = document.getElementById('adminSessionCode');
    const adminJoinBtn = document.getElementById('adminJoinBtn');
    const adminLogoutBtn = document.getElementById('adminLogoutBtn');
    const copyCodeBtn = document.getElementById('copyCodeBtn');
    const viewAllSessionsBtn = document.getElementById('viewAllSessionsBtn');
    const closeSessionsModalBtn = document.getElementById('closeSessionsModalBtn');
    
    // View all sessions button
    if (viewAllSessionsBtn) {
      viewAllSessionsBtn.addEventListener('click', function() {
        const modal = document.getElementById('sessionsModal');
        modal.style.display = 'flex';
        
        // Reset selections
        const selectAllCheckbox = document.getElementById('selectAllCheckbox');
        const selectAllBtn = document.getElementById('selectAllBtn');
        if (selectAllCheckbox) selectAllCheckbox.checked = false;
        if (selectAllBtn) selectAllBtn.textContent = 'Select All';
        updateBulkActionButtons();
        
        loadActiveSessions();
        
        // Close on escape key
        const escHandler = function(e) {
          if (e.key === 'Escape') {
            modal.style.display = 'none';
            document.removeEventListener('keydown', escHandler);
            // Clean up the listener
            if (sessionsListener) {
              window.firebase.database().ref('sessions').off('value', sessionsListener);
              sessionsListener = null;
            }
          }
        };
        document.addEventListener('keydown', escHandler);
        
        // Close on click outside
        modal.addEventListener('click', function(e) {
          if (e.target === modal) {
            modal.style.display = 'none';
            // Clean up the listener
            if (sessionsListener) {
              window.firebase.database().ref('sessions').off('value', sessionsListener);
              sessionsListener = null;
            }
          }
        });
      });
    }
    
    // Close sessions modal
    if (closeSessionsModalBtn) {
      closeSessionsModalBtn.addEventListener('click', function() {
        document.getElementById('sessionsModal').style.display = 'none';
        // Clean up the listener when modal is closed
        if (sessionsListener) {
          window.firebase.database().ref('sessions').off('value', sessionsListener);
          sessionsListener = null;
        }
      });
    }

    // Create new session
    createSessionBtn.addEventListener('click', function() {
      // Check if already starting
      if (sessionStarting) {
        console.warn('CREATE SESSION: Already starting a session, ignoring click');
        return;
      }
      
      const sessionCode = Math.floor(100000 + Math.random() * 900000).toString();
      console.log('CREATE SESSION: Generated code:', sessionCode);
      console.trace('CREATE SESSION: Stack trace for debugging');
      
      // Show active session
      document.getElementById('activeSessionCode').textContent = sessionCode;
      document.getElementById('activeSession').style.display = 'block';
      console.log('CREATE SESSION: Set activeSessionCode display to:', sessionCode);
      
      // Hide the dashboard modal immediately
      document.getElementById('adminDashboardModal').style.display = 'none';
      
      // Now set the hash (this might trigger hashchange/load events)
      window.location.hash = sessionCode;
      console.log('CREATE SESSION: Current URL hash:', window.location.hash);
      
      // Start session - DON'T set sessionStarting here, let startSession handle it
      startSession('Interviewer', sessionCode, true);
    });

    // Join existing session
    adminJoinBtn.addEventListener('click', function() {
      const sessionCode = adminSessionCode.value.trim();
      
      if (sessionCode.length === 6) {
        window.location.hash = sessionCode;
        startSession('Interviewer', sessionCode, false);
      }
    });

    // Format session code input
    adminSessionCode.addEventListener('input', function() {
      this.value = this.value.replace(/[^0-9]/g, '').slice(0, 6);
    });

    // Copy session code
    if (copyCodeBtn) {
      copyCodeBtn.addEventListener('click', function() {
        const code = document.getElementById('activeSessionCode').textContent;
        navigator.clipboard.writeText(code).then(function() {
          copyCodeBtn.textContent = '✓ Copied!';
          setTimeout(() => {
            copyCodeBtn.textContent = 'Copy Code';
          }, 2000);
        });
      });
    }

    // Logout
    adminLogoutBtn.addEventListener('click', function() {
      Auth.logout();
      document.getElementById('adminDashboardModal').style.display = 'none';
      document.getElementById('landingModal').style.display = 'flex';
      document.getElementById('activeSession').style.display = 'none';
    });
  }

  // Validate session before joining
  async function validateSession(sessionCode, isCandidate = false) {
    // Wait for Firebase if not ready
    if (!window.firebase || !window.firebase.database) {
      console.log('Waiting for Firebase to validate session...');
      // Wait a bit for Firebase to load
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Try again
      if (!window.firebase || !window.firebase.database) {
        return { valid: false, error: 'Database connection failed. Please refresh and try again.' };
      }
    }
    
    try {
      const snapshot = await window.firebase.database().ref('sessions/' + sessionCode).once('value');
      const sessionData = snapshot.val();
      
      console.log('Validating session:', sessionCode, 'Data:', sessionData);
      
      // For candidates, session MUST exist with proper structure
      if (isCandidate) {
        // Check if session exists and was created by an admin
        if (!sessionData) {
          return { valid: false, error: 'Session code not found. Please verify the code with your interviewer.' };
        }
        
        // Check if session was properly created (has creation metadata)
        if (!sessionData.created || !sessionData.createdBy) {
          return { valid: false, error: 'Invalid session. This session was not created by an interviewer.' };
        }
        
        // Check if session has been archived (older than 2 hours)
        const sessionAge = Date.now() - (sessionData.created || 0);
        const twoHours = 2 * 60 * 60 * 1000;
        if (sessionAge > twoHours) {
          return { valid: false, error: 'This session has expired. Please request a new session code from your interviewer.' };
        }
      }
      
      // Check if session is terminated
      if (sessionData && sessionData.terminated && sessionData.terminated.terminated) {
        return { valid: false, error: 'This interview session has already ended.' };
      }
      
      return { valid: true };
    } catch (error) {
      console.error('Session validation error:', error);
      return { valid: false, error: 'Failed to validate session. Please check your internet connection.' };
    }
  }
  
  // Setup bulk action handlers
  function setupBulkActions() {
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    const selectAllBtn = document.getElementById('selectAllBtn');
    const endSelectedBtn = document.getElementById('endSelectedBtn');
    const endAllSessionsBtn = document.getElementById('endAllSessionsBtn');
    
    // Select All checkbox in header
    if (selectAllCheckbox) {
      selectAllCheckbox.addEventListener('change', function() {
        const checkboxes = document.querySelectorAll('.session-checkbox');
        checkboxes.forEach(cb => cb.checked = this.checked);
        updateBulkActionButtons();
      });
    }
    
    // Select All button
    if (selectAllBtn) {
      selectAllBtn.addEventListener('click', function() {
        const isSelectAll = this.textContent === 'Select All';
        const checkboxes = document.querySelectorAll('.session-checkbox');
        const headerCheckbox = document.getElementById('selectAllCheckbox');
        
        checkboxes.forEach(cb => cb.checked = isSelectAll);
        if (headerCheckbox) headerCheckbox.checked = isSelectAll;
        
        this.textContent = isSelectAll ? 'Select None' : 'Select All';
        updateBulkActionButtons();
      });
    }
    
    // End Selected button
    if (endSelectedBtn) {
      endSelectedBtn.addEventListener('click', function() {
        const selected = document.querySelectorAll('.session-checkbox:checked');
        console.log('End Selected clicked, found checkboxes:', selected.length);
        
        const sessionCodes = Array.from(selected).map(cb => cb.getAttribute('data-code'));
        console.log('Session codes to terminate:', sessionCodes);
        
        if (sessionCodes.length === 0) {
          console.log('No sessions selected');
          return;
        }
        
        const message = sessionCodes.length === 1 
          ? `End session ${sessionCodes[0]}?`
          : `End ${sessionCodes.length} selected sessions?`;
          
        if (confirm(message + ' All participants will be disconnected.')) {
          console.log('User confirmed, terminating sessions...');
          sessionCodes.forEach(code => {
            console.log('Terminating:', code);
            terminateSessionFromDashboard(code);
          });
        } else {
          console.log('User cancelled termination');
        }
      });
    }
    
    // End All Sessions button
    if (endAllSessionsBtn) {
      endAllSessionsBtn.addEventListener('click', function() {
        const checkboxes = document.querySelectorAll('.session-checkbox');
        if (checkboxes.length === 0) {
          alert('No active sessions to end.');
          return;
        }
        
        if (confirm(`End ALL ${checkboxes.length} active sessions? This will disconnect all participants.`)) {
          const sessionCodes = Array.from(checkboxes).map(cb => cb.getAttribute('data-code'));
          sessionCodes.forEach(code => terminateSessionFromDashboard(code));
        }
      });
    }
  }
  
  // Update bulk action buttons state
  function updateBulkActionButtons() {
    const selected = document.querySelectorAll('.session-checkbox:checked');
    const endSelectedBtn = document.getElementById('endSelectedBtn');
    
    if (endSelectedBtn) {
      endSelectedBtn.disabled = selected.length === 0;
      if (selected.length > 0) {
        endSelectedBtn.textContent = `End Selected (${selected.length})`;
      } else {
        endSelectedBtn.textContent = 'End Selected';
      }
    }
  }
  
  // Store the sessions listener reference globally to prevent duplicates
  let sessionsListener = null;
  
  // Load all active sessions for admin
  function loadActiveSessions(isArchived = false) {
    const sessionsTableBody = document.getElementById('sessionsTableBody');
    const noSessionsMessage = document.getElementById('noSessionsMessage');
    const sessionsTable = document.getElementById('sessionsTable');
    
    if (!sessionsTableBody) return;
    
    // Setup bulk actions once
    if (!sessionsTableBody.hasAttribute('data-bulk-setup')) {
      setupBulkActions();
      sessionsTableBody.setAttribute('data-bulk-setup', 'true');
    }
    
    // Setup tab handlers
    const activeTabBtn = document.getElementById('activeTabBtn');
    const archivedTabBtn = document.getElementById('archivedTabBtn');
    const bulkActionsBar = document.getElementById('bulkActionsBar');
    
    if (activeTabBtn && !activeTabBtn.hasAttribute('data-handler')) {
      activeTabBtn.setAttribute('data-handler', 'true');
      activeTabBtn.addEventListener('click', function() {
        this.classList.add('active');
        archivedTabBtn.classList.remove('active');
        bulkActionsBar.style.display = 'flex';
        // Update bulk action buttons for active sessions
        const endSelectedBtn = document.getElementById('endSelectedBtn');
        const deleteAllBtn = document.getElementById('endAllSessionsBtn');
        if (endSelectedBtn) endSelectedBtn.textContent = 'End Selected';
        if (deleteAllBtn) deleteAllBtn.textContent = 'End All Sessions';
        loadActiveSessions();
      });
    }
    
    if (archivedTabBtn && !archivedTabBtn.hasAttribute('data-handler')) {
      archivedTabBtn.setAttribute('data-handler', 'true');
      archivedTabBtn.addEventListener('click', function() {
        this.classList.add('active');
        activeTabBtn.classList.remove('active');
        bulkActionsBar.style.display = 'flex'; // Show bulk actions for archived too
        // Update bulk action buttons for archived sessions (delete instead of end)
        const endSelectedBtn = document.getElementById('endSelectedBtn');
        const deleteAllBtn = document.getElementById('endAllSessionsBtn');
        if (endSelectedBtn) {
          endSelectedBtn.textContent = 'Delete Selected';
          endSelectedBtn.style.background = '#f44336';
        }
        if (deleteAllBtn) {
          deleteAllBtn.textContent = 'Delete All Archived';
          deleteAllBtn.style.background = '#f44336';
        }
        loadActiveSessions(true); // Load archived
      });
    }
    
    // Check current tab
    const isShowingArchived = archivedTabBtn && archivedTabBtn.classList.contains('active');
    
    // Check if Firebase is loaded
    if (!window.firebase || !window.firebase.database) {
      console.log('Waiting for Firebase to load...');
      sessionsTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Connecting to database...</td></tr>';
      setTimeout(() => loadActiveSessions(isArchived), 1500);
      return;
    }
    
    // Double check Firebase database ref is accessible
    try {
      const testRef = window.firebase.database().ref();
    } catch (error) {
      console.error('Firebase database error:', error);
      sessionsTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: red;">Database connection error. Please refresh the page.</td></tr>';
      return;
    }
    
    // Remove existing listener if it exists to prevent duplicates
    if (sessionsListener) {
      window.firebase.database().ref('sessions').off('value', sessionsListener);
      sessionsListener = null;
    }
    
    // Create the listener function
    sessionsListener = function(snapshot) {
      const sessions = snapshot.val() || {};
      sessionsTableBody.innerHTML = '';
      
      const activeSessions = [];
      const archivedSessions = [];
      let totalUsers = 0;
      const twoHours = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
      const now = Date.now();
      
      // Filter sessions into active, archived, and terminated
      Object.keys(sessions).forEach(code => {
        const session = sessions[code];
        
        const sessionAge = now - (session.created || now);
        const userCount = Object.keys(session.users || {}).length;
        
        const sessionInfo = {
          code: code,
          users: session.users || {},
          userCount: userCount,
          created: session.created || now,
          createdBy: session.createdBy || 'Unknown',
          isExpired: sessionAge > twoHours,
          isTerminated: session.terminated && session.terminated.terminated
        };
        
        // Terminated sessions go to archived
        if (session.terminated && session.terminated.terminated) {
          archivedSessions.push(sessionInfo);
        }
        // Archive sessions older than 2 hours
        else if (sessionAge > twoHours) {
          archivedSessions.push(sessionInfo);
          // Auto-mark as archived in Firebase
          if (!session.archived) {
            window.firebase.database().ref('sessions/' + code + '/archived').set({
              archived: true,
              archivedAt: window.firebase.database.ServerValue.TIMESTAMP,
              reason: 'Auto-archived after 2 hours'
            });
          }
        } else {
          activeSessions.push(sessionInfo);
          totalUsers += userCount;
        }
      });
      
      // Update stats
      const activeSessionsCount = document.getElementById('activeSessionsCount');
      const totalUsersCount = document.getElementById('totalUsersCount');
      if (activeSessionsCount) activeSessionsCount.textContent = activeSessions.length;
      if (totalUsersCount) totalUsersCount.textContent = totalUsers;
      
      // Choose which sessions to display based on active tab
      const isShowingArchived = archivedTabBtn && archivedTabBtn.classList.contains('active');
      const sessionsToDisplay = isShowingArchived ? archivedSessions : activeSessions;
      
      if (sessionsToDisplay.length === 0) {
        sessionsTable.style.display = 'none';
        noSessionsMessage.style.display = 'block';
        noSessionsMessage.innerHTML = isShowingArchived
          ? '<p>No archived sessions</p>' 
          : '<p>No active sessions</p>';
        return;
      }
      
      sessionsTable.style.display = 'table';
      noSessionsMessage.style.display = 'none';
      
      // Display each session
      sessionsToDisplay.forEach(session => {
        const row = document.createElement('tr');
        
        // Get the full session data to access notes
        const fullSession = sessions[session.code];
        
        // Separate candidates and interviewers
        const users = Object.values(session.users);
        const candidates = users.filter(user => 
          user.name && !user.name.toLowerCase().includes('interviewer')
        );
        const interviewers = users.filter(user => 
          user.name && user.name.toLowerCase().includes('interviewer')
        );
        
        // Get hire signal from notes if available
        let hireSignal = '';
        if (fullSession && fullSession.interviewerNotes && fullSession.interviewerNotes.recommendation) {
          const rec = fullSession.interviewerNotes.recommendation;
          const recColors = {
            'STRONG_HIRE': '#4caf50',
            'HIRE': '#8bc34a',
            'PROCEED_TO_NEXT_ROUND': '#2196f3',
            'MAYBE': '#ff9800',
            'NO_HIRE': '#f44336'
          };
          const recLabels = {
            'STRONG_HIRE': 'Strong Hire',
            'HIRE': 'Hire',
            'PROCEED_TO_NEXT_ROUND': 'Next Round',
            'MAYBE': 'Maybe',
            'NO_HIRE': 'No Hire'
          };
          hireSignal = `<span style="background: ${recColors[rec] || '#666'}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; margin-left: 8px;">${recLabels[rec] || rec}</span>`;
        }
        
        // Format candidate names with hire signal
        const candidateNames = candidates.map(user => 
          `<div class="participant-name" style="font-weight: bold; color: #4caf50;">${user.name}${hireSignal}</div>`
        ).join('') || `<div style="color: #666;">No candidate yet${hireSignal}</div>`;
        
        // Format all participants
        const allParticipants = users.map(user => {
          const isAdmin = user.name && user.name.toLowerCase().includes('interviewer');
          return `<div class="${isAdmin ? 'participant-admin' : 'participant-name'}">${user.name || 'Anonymous'}</div>`;
        }).join('') || '<div class="participant-name">No users</div>';
        
        // Determine session status
        let status = 'active';
        let statusBadge = '<span class="status-badge status-active">Active</span>';
        
        if (session.isTerminated) {
          status = 'terminated';
          statusBadge = '<span class="status-badge status-terminated" style="background-color: #999;">Ended</span>';
        } else if (session.isExpired) {
          status = 'expired';
          statusBadge = '<span class="status-badge status-expired">Expired</span>';
        } else if (candidates.length > 0 && interviewers.length > 0) {
          status = 'in-progress';
          statusBadge = '<span class="status-badge status-in-progress">In Progress</span>';
        } else if (candidates.length === 0 && interviewers.length > 0) {
          status = 'waiting';
          statusBadge = '<span class="status-badge status-active">Waiting</span>';
        }
        
        // Format time
        const createdTime = new Date(session.created).toLocaleTimeString();
        
        row.innerHTML = `
          <td>
            <input type="checkbox" class="session-checkbox" data-code="${session.code}">
          </td>
          <td class="session-code-cell">${session.code}</td>
          <td>${statusBadge}</td>
          <td>
            <div class="participants-list">
              ${candidateNames}
            </div>
          </td>
          <td>
            <div class="participants-list">
              ${allParticipants}
            </div>
          </td>
          <td class="session-time">${createdTime}</td>
          <td>
            <div class="action-buttons">
              <button class="view-details-btn" data-code="${session.code}">📋 View</button>
              ${isArchived ? 
                `<button class="delete-btn" data-code="${session.code}" style="background: #f44336;">🗑️ Delete</button>` : 
                `<button class="join-btn" data-code="${session.code}" ${session.isExpired || session.isTerminated ? 'disabled' : ''}>Join</button>
                 <button class="terminate-btn" data-code="${session.code}" ${session.isTerminated ? 'disabled' : ''}>End</button>
                 <button class="delete-btn" data-code="${session.code}" style="background: #f44336;">🗑️</button>`
              }
            </div>
          </td>
        `;
        
        // Add checkbox change handler (only for active sessions)
        const checkbox = row.querySelector('.session-checkbox');
        if (checkbox) {
          checkbox.addEventListener('change', updateBulkActionButtons);
        }
        
        sessionsTableBody.appendChild(row);
        
        // Add join button handler
        const joinBtn = row.querySelector('.join-btn');
        if (joinBtn) {
          joinBtn.addEventListener('click', function() {
            const code = this.getAttribute('data-code');
            document.getElementById('sessionsModal').style.display = 'none';
            window.location.hash = code;
            startSession('Interviewer', code, false);
          });
        }
        
        // Add terminate button handler
        const terminateBtn = row.querySelector('.terminate-btn');
        if (terminateBtn) {
          terminateBtn.addEventListener('click', function() {
            const code = this.getAttribute('data-code');
            if (confirm(`End interview session ${code}? All participants will be disconnected.`)) {
              terminateSessionFromDashboard(code);
            }
          });
        }
        
        // Add view details button handler
        const viewDetailsBtn = row.querySelector('.view-details-btn');
        if (viewDetailsBtn) {
          viewDetailsBtn.addEventListener('click', function() {
            const code = this.getAttribute('data-code');
            // Pass the full session data, not just from the filtered sessionInfo
            const fullSessionData = sessions[code];
            console.log('View details clicked for session:', code, fullSessionData);
            viewSessionDetails(code, fullSessionData);
          });
        }
        
        // Add delete button handler
        const deleteBtn = row.querySelector('.delete-btn');
        if (deleteBtn) {
          deleteBtn.addEventListener('click', function() {
            const code = this.getAttribute('data-code');
            if (confirm(`Permanently delete session ${code}? This action cannot be undone.`)) {
              deleteSession(code);
            }
          });
        }
      });
    };
    
    // Attach the listener for real-time updates
    window.firebase.database().ref('sessions').on('value', sessionsListener, function(error) {
      console.error('Firebase listener error:', error);
      sessionsTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: red;">Error loading sessions: ' + error.message + '</td></tr>';
    });
  }
  
  // Terminate session from dashboard
  function terminateSessionFromDashboard(sessionCode) {
    console.log('Terminating session:', sessionCode);
    
    if (!window.firebase || !window.firebase.database) {
      alert('Database connection not ready');
      return;
    }
    
    window.firebase.database().ref('sessions/' + sessionCode + '/terminated').set({
      terminated: true,
      terminatedBy: 'Admin Dashboard',
      terminatedAt: window.firebase.database.ServerValue.TIMESTAMP
    }).then(function() {
      console.log('Session ' + sessionCode + ' terminated successfully');
      // Show feedback
      showNotification('Session ' + sessionCode + ' has been terminated');
    }).catch(function(error) {
      console.error('Error terminating session:', error);
      alert('Failed to terminate session: ' + error.message);
    });
  }
  
  // Show notification helper
  function showNotification(message, isError = false) {
    // Simple notification (you can enhance this)
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `position: fixed; top: 20px; right: 20px; background: ${isError ? '#f44336' : '#4caf50'}; color: white; padding: 10px 20px; border-radius: 4px; z-index: 10000;`;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  }
  
  // Delete session completely from Firebase
  function deleteSession(sessionCode) {
    console.log('Deleting session:', sessionCode);
    
    if (!window.firebase || !window.firebase.database) {
      alert('Database connection not ready');
      return;
    }
    
    window.firebase.database().ref('sessions/' + sessionCode).remove()
      .then(function() {
        console.log('Session ' + sessionCode + ' deleted successfully');
        showNotification('Session ' + sessionCode + ' has been permanently deleted');
      })
      .catch(function(error) {
        console.error('Error deleting session:', error);
        showNotification('Failed to delete session: ' + error.message, true);
      });
  }
  
  // View session details with notes
  function viewSessionDetails(sessionCode, sessionData) {
    console.log('viewSessionDetails called with:', sessionCode, sessionData);
    
    const modal = document.getElementById('sessionDetailsModal');
    if (!modal) {
      console.error('Session details modal not found in DOM');
      // Try to find it with a delay in case DOM isn't ready
      setTimeout(() => {
        const retryModal = document.getElementById('sessionDetailsModal');
        if (retryModal) {
          viewSessionDetails(sessionCode, sessionData);
        } else {
          alert('Session details view is not available. Please refresh the page.');
        }
      }, 100);
      return;
    }
    
    console.log('Modal found, showing it now');
    
    // Make sure modal is visible with high z-index
    modal.style.display = 'flex';
    modal.style.zIndex = '10000';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    
    // Set session code
    const codeElement = document.getElementById('detail-session-code');
    if (codeElement) codeElement.textContent = sessionCode;
    
    // Initialize Slack integration
    if (window.initializeSlackIntegration) {
      window.initializeSlackIntegration(sessionCode, sessionData);
    }
    
    // Load notes
    if (window.firebase) {
      window.firebase.database()
        .ref(`sessions/${sessionCode}/interviewerNotes`)
        .once('value')
        .then(snapshot => {
          const notes = snapshot.val();
          if (notes) {
            // Display recommendation
            if (notes.recommendation) {
              const recDiv = document.getElementById('detail-recommendation');
              if (recDiv) {
                recDiv.textContent = window.formatRecommendation ? window.formatRecommendation(notes.recommendation) : notes.recommendation;
                recDiv.className = 'detail-recommendation ' + (window.getRecommendationClass ? window.getRecommendationClass(notes.recommendation) : '');
              }
            }
            
            // Display rating
            const ratingEl = document.getElementById('display-rating');
            if (ratingEl) {
              if (notes.rating && notes.rating.overall) {
                const stars = '★'.repeat(notes.rating.overall) + '☆'.repeat(5 - notes.rating.overall);
                ratingEl.innerHTML = stars + ` (${notes.rating.overall}/5)`;
              } else {
                ratingEl.textContent = 'Not rated';
              }
            }
            
            // Display tags
            const tagsEl = document.getElementById('display-tags');
            if (tagsEl) {
              if (notes.tags && notes.tags.length > 0) {
                tagsEl.innerHTML = notes.tags.map(tag => 
                  `<span class="tag">${tag.replace(/-/g, ' ')}</span>`
                ).join(' ');
              } else {
                tagsEl.textContent = 'No tags';
              }
            }
            
            // Display notes content
            const notesContentEl = document.getElementById('display-notes-content');
            if (notesContentEl) {
              notesContentEl.textContent = notes.content || 'No notes added';
            }
            
            // Display metadata
            const updatedEl = document.getElementById('display-updated');
            if (updatedEl && notes.updatedAt) {
              updatedEl.textContent = new Date(notes.updatedAt).toLocaleString();
            }
            const authorEl = document.getElementById('display-author');
            if (authorEl) {
              authorEl.textContent = notes.createdBy || 'Unknown';
            }
          } else {
            // No notes yet
            const recDiv = document.getElementById('detail-recommendation');
            if (recDiv) {
              recDiv.textContent = 'No recommendation';
              recDiv.className = 'detail-recommendation';
            }
            const ratingEl = document.getElementById('display-rating');
            if (ratingEl) ratingEl.textContent = 'Not rated';
            const tagsEl = document.getElementById('display-tags');
            if (tagsEl) tagsEl.textContent = 'No tags';
            const notesContentEl = document.getElementById('display-notes-content');
            if (notesContentEl) notesContentEl.textContent = 'No notes added yet';
          }
        }).catch(error => {
          console.error('Error loading notes:', error);
        });
      
      // Load code content
      window.firebase.database()
        .ref(`sessions/${sessionCode}/firepad`)
        .once('value')
        .then(snapshot => {
          const firepadData = snapshot.val();
          // Note: Firepad data is complex, we'd need to parse it properly
          // For now, just indicate if code exists
          const codeTab = document.getElementById('code-tab');
          if (firepadData && firepadData.history) {
            codeTab.innerHTML = '<p style="padding: 20px;">Code content available. Click "Join" to view in editor.</p>';
          } else {
            codeTab.innerHTML = '<p style="padding: 20px;">No code written in this session.</p>';
          }
        });
    }
    
    // Load session info
    if (sessionData) {
      const createdEl = document.getElementById('display-created');
      if (createdEl) {
        const created = new Date(sessionData.created || Date.now());
        createdEl.textContent = created.toLocaleString();
      }
      
      // Calculate duration
      const durationEl = document.getElementById('display-duration');
      if (durationEl) {
        const now = Date.now();
        const created = new Date(sessionData.created || Date.now());
        const duration = Math.floor((now - created.getTime()) / 1000 / 60); // minutes
        durationEl.textContent = `${duration} minutes`;
      }
      
      // Participants
      const participantsEl = document.getElementById('display-participants');
      if (participantsEl) {
        const users = Object.values(sessionData.users || {});
        participantsEl.textContent = users.map(u => u.name).join(', ') || 'None';
      }
      
      // Status
      const statusEl = document.getElementById('display-status');
      if (statusEl) {
        let status = 'Active';
        if (sessionData.terminated) status = 'Terminated';
        else if (sessionData.archived) status = 'Archived';
        statusEl.textContent = status;
      }
    } else {
      console.error('No session data provided to viewSessionDetails');
    }
    
    // Setup tab switching (remove old listeners first)
    const tabs = document.querySelectorAll('.detail-tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Remove any existing listeners by cloning
    tabs.forEach(tab => {
      const newTab = tab.cloneNode(true);
      tab.parentNode.replaceChild(newTab, tab);
    });
    
    // Re-query after cloning
    const newTabs = document.querySelectorAll('.detail-tab');
    newTabs.forEach(tab => {
      tab.addEventListener('click', function() {
        // Remove active class from all tabs
        newTabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(c => c.style.display = 'none');
        
        // Add active to clicked tab
        this.classList.add('active');
        const tabName = this.getAttribute('data-tab');
        const tabContent = document.getElementById(`${tabName}-tab`);
        if (tabContent) tabContent.style.display = 'block';
      });
    });
    
    // Close button - remove old listener first
    const closeBtn = document.getElementById('closeSessionDetailsBtn');
    if (closeBtn) {
      const newCloseBtn = closeBtn.cloneNode(true);
      closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
      newCloseBtn.addEventListener('click', function() {
        modal.style.display = 'none';
      });
    }
    
    // Close on ESC - use a named function to avoid duplicate listeners
    const escHandler = function(e) {
      if (e.key === 'Escape' && modal.style.display === 'flex') {
        modal.style.display = 'none';
      }
    };
    // Remove old listener and add new one
    document.removeEventListener('keydown', escHandler);
    document.addEventListener('keydown', escHandler);
  }

  // Track if session is starting to prevent duplicates
  let sessionStarting = false;
  
  // Start coding session
  async function startSession(userName, sessionCode, isNew) {
    // Prevent duplicate session starts
    if (sessionStarting) {
      console.warn('Session already starting, preventing duplicate');
      return;
    }
    sessionStarting = true;
    
    console.log('START SESSION:', userName, sessionCode, 'isNew:', isNew);
    // Validate session first (for existing sessions)
    if (!isNew) {
      const validation = await validateSession(sessionCode);
      if (!validation.valid) {
        alert(validation.error || 'Invalid session');
        location.reload();
        return;
      }
    }
    
    // Hide all modals
    document.querySelectorAll('.modal').forEach(modal => {
      modal.style.display = 'none';
    });

    // Show main container
    document.getElementById('main-container').style.display = 'flex';

    // Initialize the editor session
    if (typeof initializeSession === 'function') {
      initializeSession({
        userName: userName,
        sessionCode: sessionCode,
        isNew: isNew,
        isAdmin: Auth.isAdmin()
      });
    }
    
    // Reset flag after a delay to allow future navigation
    setTimeout(() => {
      sessionStarting = false;
    }, 2000);
  }

  // Track if this is initial page load
  let isInitialLoad = true;
  
  // Check for existing session on load - ONLY for page refreshes
  window.addEventListener('load', function() {
    console.log('PAGE LOAD EVENT FIRED - isInitialLoad:', isInitialLoad);
    
    // If this is NOT the initial page load, skip (means we navigated after page was already loaded)
    if (!isInitialLoad) {
      console.log('PAGE LOAD: Not initial load, skipping');
      return;
    }
    isInitialLoad = false;
    
    // Don't run if we're already starting a session
    if (sessionStarting) {
      console.log('PAGE LOAD: Session already starting, skipping load handler');
      return;
    }
    
    // Check if we're already in a session (main container visible means session is active)
    const mainContainer = document.getElementById('main-container');
    if (mainContainer && mainContainer.style.display !== 'none') {
      console.log('PAGE LOAD: Already in a session, skipping');
      return;
    }
    
    const session = Auth.getCurrentSession();
    const urlCode = window.location.hash.replace('#', '');
    
    console.log('PAGE LOAD: Session logged in?', session.isLoggedIn, 'URL code:', urlCode);

    // Only auto-join if we have a URL code AND we're logged in (for page refresh scenarios)
    if (session.isLoggedIn && urlCode) {
      console.log('PAGE LOAD: This should only run on page refresh! Resuming session with code from URL:', urlCode);
      console.trace('PAGE LOAD: Stack trace');
      // Resume existing session - this is ONLY for when someone refreshes the page
      startSession(session.userName, urlCode, false);
    } else {
      console.log('PAGE LOAD: Showing landing page');
      // Show landing page
      init();
    }
  });

  // Initialize on DOM ready (but only if not already handling via load event)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      console.log('DOM READY: Checking if should init...');
      const urlCode = window.location.hash.replace('#', '');
      const session = Auth.getCurrentSession();
      
      // Only init if we're not going to handle this in the load event
      if (!session.isLoggedIn || !urlCode) {
        console.log('DOM READY: Calling init()');
        init();
      } else {
        console.log('DOM READY: Skipping init, will handle in load event');
      }
    });
  } else {
    // Document already loaded, check same conditions
    const urlCode = window.location.hash.replace('#', '');
    const session = Auth.getCurrentSession();
    if (!session.isLoggedIn || !urlCode) {
      console.log('IMMEDIATE: Calling init()');
      init();
    }
  }
})();