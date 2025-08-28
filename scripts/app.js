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
    // Candidate button
    document.querySelector('.candidate-btn').addEventListener('click', function() {
      document.getElementById('landingModal').style.display = 'none';
      document.getElementById('candidateModal').style.display = 'flex';
    });

    // Admin button
    document.querySelector('.admin-btn').addEventListener('click', function() {
      document.getElementById('landingModal').style.display = 'none';
      document.getElementById('adminLoginModal').style.display = 'flex';
    });
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
    adminLoginBtn.addEventListener('click', function() {
      const email = adminEmail.value.trim();
      const password = adminPassword.value;

      const result = Auth.loginAdmin(email, password);
      
      if (result.success) {
        document.getElementById('adminLoginModal').style.display = 'none';
        document.getElementById('adminDashboardModal').style.display = 'flex';
        setupAdminDashboard();
      } else {
        loginError.textContent = result.error;
        loginError.style.display = 'block';
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
          }
        };
        document.addEventListener('keydown', escHandler);
        
        // Close on click outside
        modal.addEventListener('click', function(e) {
          if (e.target === modal) {
            modal.style.display = 'none';
          }
        });
      });
    }
    
    // Close sessions modal
    if (closeSessionsModalBtn) {
      closeSessionsModalBtn.addEventListener('click', function() {
        document.getElementById('sessionsModal').style.display = 'none';
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
  
  // Load all active sessions for admin
  function loadActiveSessions(showArchived = false) {
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
        loadActiveSessions();
      });
    }
    
    if (archivedTabBtn && !archivedTabBtn.hasAttribute('data-handler')) {
      archivedTabBtn.setAttribute('data-handler', 'true');
      archivedTabBtn.addEventListener('click', function() {
        this.classList.add('active');
        activeTabBtn.classList.remove('active');
        bulkActionsBar.style.display = 'none';
        loadActiveSessions(true); // Load archived
      });
    }
    
    // Check current tab
    const isShowingArchived = archivedTabBtn && archivedTabBtn.classList.contains('active');
    
    // Check if Firebase is loaded
    if (!window.firebase || !window.firebase.database) {
      console.log('Waiting for Firebase to load...');
      sessionsTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Connecting to database...</td></tr>';
      setTimeout(() => loadActiveSessions(isShowingArchived), 1500);
      return;
    }
    
    // Listen for all sessions
    window.firebase.database().ref('sessions').on('value', function(snapshot) {
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
        
        // Skip terminated sessions
        if (session.terminated && session.terminated.terminated) {
          return;
        }
        
        const sessionAge = now - (session.created || now);
        const userCount = Object.keys(session.users || {}).length;
        
        const sessionInfo = {
          code: code,
          users: session.users || {},
          userCount: userCount,
          created: session.created || now,
          createdBy: session.createdBy || 'Unknown',
          isExpired: sessionAge > twoHours
        };
        
        // Archive sessions older than 2 hours
        if (sessionAge > twoHours) {
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
      
      if (activeSessions.length === 0) {
        sessionsTable.style.display = 'none';
        noSessionsMessage.style.display = 'block';
        return;
      }
      
      sessionsTable.style.display = 'table';
      noSessionsMessage.style.display = 'none';
      
      // Choose which sessions to display
      const sessionsToDisplay = (archivedTabBtn && archivedTabBtn.classList.contains('active')) ? archivedSessions : activeSessions;
      
      if (sessionsToDisplay.length === 0) {
        sessionsTable.style.display = 'none';
        noSessionsMessage.style.display = 'block';
        noSessionsMessage.innerHTML = (archivedTabBtn && archivedTabBtn.classList.contains('active'))
          ? '<p>No archived sessions</p>' 
          : '<p>No active sessions</p>';
        return;
      }
      
      sessionsTable.style.display = 'table';
      noSessionsMessage.style.display = 'none';
      
      // Display each session
      sessionsToDisplay.forEach(session => {
        const row = document.createElement('tr');
        
        // Separate candidates and interviewers
        const users = Object.values(session.users);
        const candidates = users.filter(user => 
          user.name && !user.name.toLowerCase().includes('interviewer')
        );
        const interviewers = users.filter(user => 
          user.name && user.name.toLowerCase().includes('interviewer')
        );
        
        // Format candidate names (primary focus)
        const candidateNames = candidates.map(user => 
          `<div class="participant-name" style="font-weight: bold; color: #4caf50;">${user.name}</div>`
        ).join('') || '<div style="color: #666;">No candidate yet</div>';
        
        // Format all participants
        const allParticipants = users.map(user => {
          const isAdmin = user.name && user.name.toLowerCase().includes('interviewer');
          return `<div class="${isAdmin ? 'participant-admin' : 'participant-name'}">${user.name || 'Anonymous'}</div>`;
        }).join('') || '<div class="participant-name">No users</div>';
        
        // Determine session status
        let status = 'active';
        let statusBadge = '<span class="status-badge status-active">Active</span>';
        
        if (session.isExpired) {
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
            ${showArchived ? '' : '<input type="checkbox" class="session-checkbox" data-code="' + session.code + '">'}
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
              ${showArchived ? 
                '<span style="color: #666;">Archived</span>' : 
                `<button class="join-btn" data-code="${session.code}" ${session.isExpired ? 'disabled' : ''}>Join</button>
                 <button class="terminate-btn" data-code="${session.code}">End</button>`
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
      });
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
  function showNotification(message) {
    // Simple notification (you can enhance this)
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #4caf50; color: white; padding: 10px 20px; border-radius: 4px; z-index: 10000;';
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
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