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
        
        // Initialize session tracking for candidates (make it async/non-blocking)
        if (window.SessionTracking) {
          // Don't await - let tracking happen in background
          window.SessionTracking.initialize(sessionCode, 'candidate', name);
          // Remove the security check message - just proceed
        }
        
        // Initialize activity monitoring for candidates
        if (window.initActivityMonitor) {
          console.log('Starting activity monitoring for candidate:', name);
          window.initActivityMonitor(sessionCode, name, 'candidate');
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
    const interviewerNameInput = document.getElementById('interviewerName');
    
    // Load saved interviewer name from localStorage
    if (interviewerNameInput) {
      const savedName = localStorage.getItem('interviewerName');
      if (savedName) {
        interviewerNameInput.value = savedName;
      }
      
      // Save name when it changes
      interviewerNameInput.addEventListener('input', function() {
        localStorage.setItem('interviewerName', this.value.trim());
      });
    }
    
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
    createSessionBtn.addEventListener('click', async function() {
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
      
      // Track interviewer creating and joining session
      const currentUser = Auth.getCurrentUser();
      const interviewerName = document.getElementById('interviewerName')?.value.trim();
      const adminName = interviewerName ? 
        `${interviewerName} (${currentUser.email})` : 
        currentUser.email || 'Interviewer';
      
      // Initialize activity monitor in observer mode for interviewer
      if (window.initActivityMonitor) {
        console.log('Starting activity monitor in observer mode for interviewer');
        window.initActivityMonitor(sessionCode, adminName, 'interviewer');
      }
      
      // Start session - DON'T set sessionStarting here, let startSession handle it
      startSession(adminName, sessionCode, true);
    });

    // Join existing session
    adminJoinBtn.addEventListener('click', async function() {
      const sessionCode = adminSessionCode.value.trim();
      
      if (sessionCode.length === 6) {
        // Track interviewer joining session
        const currentUser = Auth.getCurrentUser();
        const interviewerName = document.getElementById('interviewerName')?.value.trim();
        const adminName = interviewerName ? 
          `${interviewerName} (${currentUser.email})` : 
          currentUser.email || 'Interviewer';
        
        // Initialize activity monitor in observer mode for interviewer
        if (window.initActivityMonitor) {
          console.log('Starting activity monitor in observer mode for interviewer');
          window.initActivityMonitor(sessionCode, adminName, 'interviewer');
        }
        
        window.location.hash = sessionCode;
        startSession(adminName, sessionCode, false);
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
    
    // End/Delete Selected button (behavior depends on active tab)
    if (endSelectedBtn) {
      endSelectedBtn.addEventListener('click', function() {
        const selected = document.querySelectorAll('.session-checkbox:checked');
        const archivedTabBtn = document.getElementById('archivedTabBtn');
        const isArchivedTab = archivedTabBtn && archivedTabBtn.classList.contains('active');
        
        console.log('End/Delete Selected clicked, found checkboxes:', selected.length);
        console.log('Is archived tab:', isArchivedTab);
        
        const sessionCodes = Array.from(selected).map(cb => cb.getAttribute('data-code'));
        console.log('Session codes to process:', sessionCodes);
        
        if (sessionCodes.length === 0) {
          console.log('No sessions selected');
          return;
        }
        
        if (isArchivedTab) {
          // In Ended Sessions tab - DELETE permanently
          const message = sessionCodes.length === 1 
            ? `⚠️ PERMANENTLY DELETE session ${sessionCodes[0]}?`
            : `⚠️ PERMANENTLY DELETE ${sessionCodes.length} selected sessions?`;
            
          if (confirm(message + '\n\nThis will remove all data forever and CANNOT be undone!')) {
            if (confirm('FINAL CONFIRMATION: Delete these sessions forever?')) {
              console.log('User confirmed, DELETING sessions...', sessionCodes);
              
              // Delete sessions with staggered timing to ensure Firebase handles them properly
              sessionCodes.forEach((code, index) => {
                setTimeout(() => {
                  console.log(`Deleting session ${index + 1}/${sessionCodes.length}: ${code}`);
                  deleteSession(code);
                }, index * 200); // Stagger by 200ms
              });
              
              showNotification(`Deleting ${sessionCodes.length} session(s)...`);
            }
          }
        } else {
          // In Active tab - just end/terminate sessions
          const message = sessionCodes.length === 1 
            ? `End session ${sessionCodes[0]}?`
            : `End ${sessionCodes.length} selected sessions?`;
            
          if (confirm(message + ' All participants will be disconnected.')) {
            console.log('User confirmed, ending sessions...');
            sessionCodes.forEach(code => {
              console.log('Ending:', code);
              terminateSessionFromDashboard(code);
            });
          }
        }
      });
    }
    
    // End All / Delete All button (behavior depends on active tab)
    if (endAllSessionsBtn) {
      endAllSessionsBtn.addEventListener('click', function() {
        const checkboxes = document.querySelectorAll('.session-checkbox');
        const archivedTabBtn = document.getElementById('archivedTabBtn');
        const isArchivedTab = archivedTabBtn && archivedTabBtn.classList.contains('active');
        
        if (checkboxes.length === 0) {
          alert(isArchivedTab ? 'No ended sessions to delete' : 'No active sessions to end');
          return;
        }
        
        if (isArchivedTab) {
          // In Ended Sessions tab - DELETE ALL permanently
          if (confirm(`⚠️ PERMANENTLY DELETE ALL ${checkboxes.length} ended sessions?\n\nThis will remove all data forever!`)) {
            if (confirm('FINAL CONFIRMATION: Delete ALL ended sessions forever? This CANNOT be undone!')) {
              const sessionCodes = Array.from(checkboxes).map(cb => cb.getAttribute('data-code'));
              console.log('Mass deleting sessions:', sessionCodes);
              
              // Delete all sessions sequentially to ensure they complete
              sessionCodes.forEach((code, index) => {
                setTimeout(() => {
                  console.log(`Deleting session ${index + 1}/${sessionCodes.length}: ${code}`);
                  deleteSession(code);
                }, index * 200); // Stagger deletions by 200ms to avoid overwhelming Firebase
              });
              
              showNotification(`Deleting ${sessionCodes.length} sessions...`);
            }
          }
        } else {
          // In Active tab - end all sessions
          if (confirm(`End ALL ${checkboxes.length} active sessions? This will disconnect all participants.`)) {
            const sessionCodes = Array.from(checkboxes).map(cb => cb.getAttribute('data-code'));
            sessionCodes.forEach(code => terminateSessionFromDashboard(code));
          }
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
        // Update bulk action buttons for active/in-progress sessions
        const endSelectedBtn = document.getElementById('endSelectedBtn');
        const deleteAllBtn = document.getElementById('endAllSessionsBtn');
        if (endSelectedBtn) {
          endSelectedBtn.textContent = 'End Selected';
          endSelectedBtn.style.background = '#ff9800';
        }
        if (deleteAllBtn) {
          deleteAllBtn.textContent = 'End All';
          deleteAllBtn.style.background = '#ff9800';
        }
        loadActiveSessions();
      });
    }
    
    if (archivedTabBtn && !archivedTabBtn.hasAttribute('data-handler')) {
      archivedTabBtn.setAttribute('data-handler', 'true');
      archivedTabBtn.addEventListener('click', function() {
        this.classList.add('active');
        activeTabBtn.classList.remove('active');
        bulkActionsBar.style.display = 'flex'; // Show bulk actions for ended sessions too
        // Update bulk action buttons for ended sessions (delete only)
        const endSelectedBtn = document.getElementById('endSelectedBtn');
        const deleteAllBtn = document.getElementById('endAllSessionsBtn');
        if (endSelectedBtn) {
          endSelectedBtn.textContent = 'Delete Selected';
          endSelectedBtn.style.background = '#f44336';
        }
        if (deleteAllBtn) {
          deleteAllBtn.textContent = 'Delete All Ended';
          deleteAllBtn.style.background = '#f44336';
        }
        loadActiveSessions(true); // Load ended sessions
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
      
      // Filter sessions into active/in-progress and ended
      Object.keys(sessions).forEach(code => {
        const session = sessions[code];
        
        const sessionAge = now - (session.created || now);
        const userCount = Object.keys(session.users || {}).length;
        
        // For ended sessions, use preserved participants if available
        const participants = (session.terminated && session.terminated.terminated && session.preservedParticipants) 
          ? session.preservedParticipants 
          : session.users || {};
          
        const sessionInfo = {
          code: code,
          users: participants,
          userCount: Object.keys(participants).length,
          created: session.created || now,
          createdBy: session.createdBy || 'Unknown',
          isExpired: sessionAge > twoHours,
          isTerminated: session.terminated && session.terminated.terminated
        };
        
        // Ended sessions go to the ended list
        if (session.terminated && session.terminated.terminated) {
          archivedSessions.push(sessionInfo); // Using archivedSessions array for ended sessions
        } else {
          // Active or In Progress sessions
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
          ? '<p>No ended sessions</p>' 
          : '<p>No active or in-progress sessions</p>';
        return;
      }
      
      sessionsTable.style.display = 'table';
      noSessionsMessage.style.display = 'none';
      
      // Display each session
      sessionsToDisplay.forEach(session => {
        const row = document.createElement('tr');
        
        // Get the full session data to access notes
        const fullSession = sessions[session.code];
        
        // Make isShowingArchived available in this scope
        const isArchivedView = isShowingArchived;
        
        // Separate candidates and interviewers
        const users = Object.values(session.users);
        const candidates = users.filter(user => {
          if (!user.name) return false;
          const nameLower = user.name.toLowerCase();
          // Exclude if it contains interviewer patterns, email domains, or admin keywords
          return !nameLower.includes('interviewer') && 
                 !nameLower.includes('@') && 
                 !nameLower.includes('admin') &&
                 !nameLower.includes('.com') &&
                 !nameLower.includes('.io') &&
                 !nameLower.includes('.net');
        });
        const interviewers = users.filter(user => {
          if (!user.name) return false;
          const nameLower = user.name.toLowerCase();
          // Include if it contains interviewer patterns or email domains
          return nameLower.includes('interviewer') || 
                 nameLower.includes('@') || 
                 nameLower.includes('admin') ||
                 nameLower.includes('.com') ||
                 nameLower.includes('.io') ||
                 nameLower.includes('.net');
        });
        
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
        
        // Format candidate names with hire signal (only show candidates)
        const candidateNames = candidates.map(user => 
          `<div class="participant-name" style="font-weight: bold; color: #4caf50;">${user.name}${hireSignal}</div>`
        ).join('') || `<div style="color: #666;">No candidate yet${hireSignal}</div>`;
        
        // Format interviewer names
        const interviewerNames = interviewers.length > 0 ? 
          `<div style="font-size: 11px; color: #888; margin-top: 4px;">Interviewed by: ${interviewers.map(i => i.name).join(', ')}</div>` : '';
        
        // Format all participants with clear separation
        const allParticipants = `
          ${candidates.length > 0 ? `<div style="margin-bottom: 8px;"><strong>Candidates:</strong><br>${candidates.map(c => `<span style="color: #4caf50;">${c.name}</span>`).join(', ')}</div>` : ''}
          ${interviewers.length > 0 ? `<div><strong>Interviewers:</strong><br>${interviewers.map(i => `<span style="color: #667eea;">${i.name}</span>`).join(', ')}</div>` : ''}
          ${users.length === 0 ? '<div style="color: #666;">No participants</div>' : ''}
        `;
        
        // Check for fraud indicators from security warnings
        let fraudBadge = '';
        if (fullSession && fullSession.security_warnings) {
          const warnings = Object.values(fullSession.security_warnings || {});
          const candidateWarnings = warnings.filter(w => w.userType === 'candidate');
          
          if (candidateWarnings.length > 0) {
            const hasVPN = candidateWarnings.some(w => w.type === 'vpn_detected');
            const hasMultipleLogin = candidateWarnings.some(w => w.type === 'multiple_login');
            
            if (hasMultipleLogin) {
              fraudBadge = '<span class="fraud-badge" style="background: #ff0000; color: white; padding: 2px 6px; border-radius: 3px; font-size: 10px; margin-left: 4px;">🚨 FRAUD</span>';
            } else if (hasVPN) {
              fraudBadge = '<span class="fraud-badge" style="background: #ff9800; color: white; padding: 2px 6px; border-radius: 3px; font-size: 10px; margin-left: 4px;">⚠️ VPN</span>';
            }
          }
        }
        
        // Determine session status - Simple progression: Active -> In Progress -> Ended
        let status = 'active';
        let statusBadge = '';
        
        if (session.isTerminated) {
          // Session has ended
          status = 'ended';
          statusBadge = '<span class="status-badge status-ended" style="background-color: #666;">Ended</span>' + fraudBadge;
        } else if (candidates.length > 0 && interviewers.length > 0) {
          // Both candidate and interviewer present - interview in progress
          status = 'in-progress';
          statusBadge = '<span class="status-badge status-in-progress" style="background-color: #2196f3;">In Progress</span>' + fraudBadge;
        } else {
          // Session created but interview not started yet
          status = 'active';
          statusBadge = '<span class="status-badge status-active" style="background-color: #4caf50;">Active</span>' + fraudBadge;
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
              ${interviewerNames}
            </div>
          </td>
          <td>
            <div class="participants-list">
              ${allParticipants}
            </div>
          </td>
          <td class="session-time">${createdTime}</td>
          <td>
            <div class="action-buttons-modern">
              <button class="action-btn view-btn" data-code="${session.code}" title="View Details">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <span>View</span>
              </button>
              
              
              ${isArchivedView ? 
                `<button class="action-btn slack-btn" data-code="${session.code}" title="Export to Slack">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
                  </svg>
                  <span>Slack</span>
                </button>
                
                <button class="action-btn email-btn coming-soon" disabled title="Email Export - Coming Soon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  <span>Email</span>
                  <span class="coming-soon-badge">Soon</span>
                </button>
                
                <button class="action-btn csv-btn coming-soon" disabled title="CSV Export - Coming Soon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  <span>CSV</span>
                  <span class="coming-soon-badge">Soon</span>
                </button>
                
                <button class="action-btn delete-forever-btn" data-code="${session.code}" title="Permanently Delete">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                  <span>Delete Forever</span>
                </button>` : 
                `<button class="action-btn join-btn" data-code="${session.code}" ${session.isExpired || session.isTerminated ? 'disabled' : ''} title="Join Session">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                    <polyline points="10 17 15 12 10 7"></polyline>
                    <line x1="15" y1="12" x2="3" y2="12"></line>
                  </svg>
                  <span>Join</span>
                </button>
                 <button class="action-btn end-btn" data-code="${session.code}" ${session.isTerminated ? 'disabled' : ''} title="End Session">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <rect x="9" y="9" width="6" height="6"></rect>
                  </svg>
                  <span>End</span>
                </button>`
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
            const currentUser = Auth.getCurrentUser();
            const interviewerName = document.getElementById('interviewerName')?.value.trim();
            const adminName = interviewerName ? 
              `${interviewerName} (${currentUser.email})` : 
              currentUser.email || 'Interviewer';
            window.location.hash = code;
            startSession(adminName, code, false);
          });
        }
        
        // Add end button handler
        const terminateBtn = row.querySelector('.terminate-btn');
        if (terminateBtn) {
          terminateBtn.addEventListener('click', function() {
            const code = this.getAttribute('data-code');
            if (confirm(`End session ${code}? This will mark the interview as completed and move it to Ended Sessions.`)) {
              terminateSessionFromDashboard(code);
            }
          });
        }
        
        // Add view button handler
        const viewBtn = row.querySelector('.view-btn');
        if (viewBtn) {
          viewBtn.addEventListener('click', function() {
            const code = this.getAttribute('data-code');
            // Pass the full session data, not just from the filtered sessionInfo
            const fullSessionData = sessions[code];
            console.log('View details clicked for session:', code, fullSessionData);
            viewSessionDetails(code, fullSessionData);
          });
        }
        
        // Add Slack export button handler
        const slackBtn = row.querySelector('.slack-btn');
        if (slackBtn) {
          slackBtn.addEventListener('click', function() {
            const code = this.getAttribute('data-code');
            const fullSessionData = sessions[code];
            console.log('Slack export clicked for session:', code);
            exportSessionToSlack(code, fullSessionData);
          });
        }
        
        // Add delete forever button handler
        const deleteForeverBtn = row.querySelector('.delete-forever-btn');
        if (deleteForeverBtn) {
          deleteForeverBtn.addEventListener('click', function() {
            const code = this.getAttribute('data-code');
            const message = `⚠️ PERMANENTLY DELETE session ${code}?\n\nThis will:\n• Remove ALL session data\n• Delete ALL interview notes\n• Remove from Firebase completely\n• This CANNOT be undone!\n\nAre you absolutely sure?`;
            if (confirm(message)) {
              // Double confirmation for safety
              if (confirm(`FINAL CONFIRMATION: Delete session ${code} forever?`)) {
                deleteSession(code);
              }
            }
          });
        }
        
        // Add end button handler
        const endBtn = row.querySelector('.end-btn');
        if (endBtn) {
          endBtn.addEventListener('click', function() {
            const code = this.getAttribute('data-code');
            if (confirm(`End session ${code}? This will mark the interview as completed and move it to Ended Sessions.`)) {
              terminateSessionFromDashboard(code);
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
  
  // End session - mark as ended (not deleted)
  function terminateSessionFromDashboard(sessionCode) {
    console.log('Ending session:', sessionCode);
    
    if (!window.firebase || !window.firebase.database) {
      alert('Database connection not ready');
      return;
    }
    
    // Track session end with PostHog
    if (window.trackSessionEnd) {
      window.trackSessionEnd('admin_ended');
    }
    
    const sessionRef = window.firebase.database().ref('sessions/' + sessionCode);
    
    // First, preserve the current participants before ending
    sessionRef.child('users').once('value').then(function(snapshot) {
      const currentUsers = snapshot.val() || {};
      
      // Save participants data permanently
      const participantsData = {};
      Object.keys(currentUsers).forEach(userId => {
        const user = currentUsers[userId];
        participantsData[userId] = {
          name: user.name || 'Unknown',
          joinedAt: user.timestamp || Date.now()
        };
      });
      
      // Now terminate the session with preserved participant data
      sessionRef.update({
        terminated: {
          terminated: true,
          terminatedBy: 'Admin Dashboard',
          terminatedAt: window.firebase.database.ServerValue.TIMESTAMP
        },
        preservedParticipants: participantsData
      }).then(function() {
        console.log('Session ' + sessionCode + ' ended successfully with preserved participants');
        // Show feedback
        showNotification('Session ' + sessionCode + ' has been ended');
      }).catch(function(error) {
        console.error('Error ending session:', error);
        alert('Failed to end session: ' + error.message);
      });
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
  
  // Export session to Slack directly from session row
  function exportSessionToSlack(sessionCode, sessionData) {
    console.log('Exporting session to Slack:', sessionCode);
    
    // Load slack integration script if not already loaded
    if (!window.initializeSlackIntegration) {
      const script = document.createElement('script');
      script.src = 'scripts/slack-integration.js';
      script.onload = () => {
        proceedWithSlackExport(sessionCode, sessionData);
      };
      document.body.appendChild(script);
    } else {
      proceedWithSlackExport(sessionCode, sessionData);
    }
  }
  
  function proceedWithSlackExport(sessionCode, sessionData) {
    // Initialize Slack integration
    window.initializeSlackIntegration(sessionCode, sessionData);
    
    // Open the Slack share modal directly
    window.openSlackShareModal();
  }
  
  // Delete ALL sessions from Firebase - NUCLEAR OPTION
  function deleteAllSessions() {
    console.log('DELETING ALL SESSIONS FROM DATABASE');
    
    if (!window.firebase || !window.firebase.database) {
      alert('Database connection not ready');
      return;
    }
    
    // Delete the entire sessions node
    window.firebase.database().ref('sessions').remove()
      .then(function() {
        console.log('ALL SESSIONS DELETED SUCCESSFULLY');
        showNotification('ALL SESSIONS HAVE BEEN DELETED FROM DATABASE');
        
        // Force refresh the sessions list
        setTimeout(() => {
          if (typeof loadActiveSessions === 'function') {
            const archivedTabBtn = document.getElementById('archivedTabBtn');
            const isArchived = archivedTabBtn && archivedTabBtn.classList.contains('active');
            loadActiveSessions(isArchived);
          }
        }, 500);
      })
      .catch(function(error) {
        console.error('Error deleting all sessions:', error);
        alert('Failed to delete all sessions: ' + error.message);
      });
  }
  
  // Make it globally accessible for console use
  window.deleteAllSessions = deleteAllSessions;
  
  // Delete session completely from Firebase - HARD DELETE
  function deleteSession(sessionCode) {
    console.log('HARD DELETING session:', sessionCode);
    
    if (!window.firebase || !window.firebase.database) {
      alert('Database connection not ready');
      return;
    }
    
    // First, try to read the session to confirm it exists
    window.firebase.database().ref('sessions/' + sessionCode).once('value')
      .then(function(snapshot) {
        if (!snapshot.exists()) {
          console.log('Session does not exist:', sessionCode);
          showNotification('Session ' + sessionCode + ' does not exist', true);
          return;
        }
        
        console.log('Session exists, proceeding with HARD DELETE');
        
        // Now perform the actual deletion
        return window.firebase.database().ref('sessions/' + sessionCode).remove();
      })
      .then(function(result) {
        if (result !== undefined) { // Only show success if we actually deleted
          console.log('Session ' + sessionCode + ' HARD DELETED successfully');
          showNotification('Session ' + sessionCode + ' has been PERMANENTLY DELETED from database');
          
          // Force refresh the sessions list after a short delay
          setTimeout(() => {
            if (typeof loadActiveSessions === 'function') {
              const archivedTabBtn = document.getElementById('archivedTabBtn');
              const isArchived = archivedTabBtn && archivedTabBtn.classList.contains('active');
              loadActiveSessions(isArchived);
            }
          }, 500);
        }
      })
      .catch(function(error) {
        console.error('Error HARD DELETING session:', error);
        console.error('Error details:', error.code, error.message);
        
        if (error.code === 'PERMISSION_DENIED') {
          showNotification('Permission denied. Update Firebase rules to allow deletion.', true);
          alert('Cannot delete: Permission denied.\n\nPlease update Firebase rules:\nAdd ".write": true at the sessions root level');
        } else {
          showNotification('Failed to delete session: ' + error.message, true);
        }
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
      
      // Participants - use preserved participants for ended sessions
      const participantsEl = document.getElementById('display-participants');
      if (participantsEl) {
        let users;
        if (sessionData.terminated && sessionData.terminated.terminated && sessionData.preservedParticipants) {
          // For ended sessions, use preserved participants
          users = Object.values(sessionData.preservedParticipants || {});
        } else {
          // For active sessions, use current users
          users = Object.values(sessionData.users || {});
        }
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
        if (tabContent) {
          tabContent.style.display = 'block';
          
          // If security tab, load tracking data
          if (tabName === 'security' && window.SessionTracking) {
            const sessionCode = document.getElementById('detail-session-code').textContent;
            window.SessionTracking.displaySecurityTab(sessionCode);
          }
        }
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

    // Show main container - force it visible
    const mainContainer = document.getElementById('main-container');
    if (mainContainer) {
      mainContainer.style.display = 'flex';
      mainContainer.style.visibility = 'visible';
      mainContainer.style.opacity = '1';
      console.log('Main container shown, display:', mainContainer.style.display);
    } else {
      console.error('CRITICAL: main-container element not found in DOM!');
      alert('Error: Unable to load editor interface. Please refresh the page.');
      return;
    }

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
  // Load movie posters for landing page background
  function loadMoviePosters() {
    const postersGrid = document.getElementById('moviePostersGrid');
    if (!postersGrid) return;
    
    // Create a timeout promise to prevent hanging
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 5000)
    );
    
    // Fetch movies from Atomtickets API with timeout
    // Use a proxy endpoint to hide the actual API URL
    const apiEndpoint = window.MOVIE_API_ENDPOINT || '/api/movies' || 'data:application/json,{"productions":[]}';
    
    Promise.race([
      fetch(apiEndpoint),
      timeoutPromise
    ])
      .then(response => {
        if (!response.ok) throw new Error('API response not ok');
        return response.json();
      })
      .then(data => {
        if (!data?.productions || !Array.isArray(data.productions) || data.productions.length === 0) {
          throw new Error('No productions data');
        }
        
        // Create poster tiles for first 30 movies
        const movies = data.productions.slice(0, 30);
        const postersHTML = movies.map((movie, index) => {
          const posterUrl = movie.coverImages?.LARGE || movie.coverImages?.SMALL || '';
          const title = movie.title || '';
          const rating = movie.mpaaRating || 'NR';
          const releaseDate = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : '';
          const shareLink = movie.shareLink || '#';
          
          // Skip if no poster image
          if (!posterUrl) {
            return `<div class="movie-poster-tile fallback" style="background: hsl(${index * 12}, 70%, 50%); animation-delay: ${(index % 10) * 0.1}s"></div>`;
          }
          
          // Add animation delay for staggered appearance
          const delay = (index % 10) * 0.1;
          
          return `
            <a href="${shareLink}" target="_blank" rel="noopener" class="movie-poster-tile" style="animation-delay: ${delay}s">
              <img src="${posterUrl}" alt="${title}" loading="lazy" onerror="this.parentElement.style.background='hsl(${index * 12}, 70%, 50%)'">
              <div class="poster-overlay">
                <div class="poster-title">${title}</div>
                <div class="poster-meta">
                  <span class="poster-rating">${rating}</span>
                  <span class="poster-year">${releaseDate}</span>
                </div>
              </div>
            </a>
          `;
        }).join('');
        
        postersGrid.innerHTML = postersHTML;
        
        // Clone for infinite scroll effect
        postersGrid.innerHTML += postersHTML;
      })
      .catch(error => {
        console.log('Using fallback movie poster grid:', error.message);
        // Create a beautiful fallback gradient grid
        const fallbackTiles = [
          { color: '#FF6B6B', title: 'Action' },
          { color: '#4ECDC4', title: 'Comedy' },
          { color: '#45B7D1', title: 'Drama' },
          { color: '#96CEB4', title: 'Thriller' },
          { color: '#FFEAA7', title: 'Romance' },
          { color: '#DDA0DD', title: 'Sci-Fi' },
          { color: '#98D8C8', title: 'Horror' },
          { color: '#FFD700', title: 'Adventure' },
          { color: '#FF69B4', title: 'Fantasy' },
          { color: '#00CED1', title: 'Mystery' }
        ];
        
        const fallbackHTML = Array(30).fill(0).map((_, i) => {
          const tile = fallbackTiles[i % fallbackTiles.length];
          return `
            <div class="movie-poster-tile fallback" style="background: linear-gradient(135deg, ${tile.color} 0%, ${tile.color}88 100%); animation-delay: ${(i % 10) * 0.1}s">
              <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: white; font-weight: 600; font-size: 14px; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                ${tile.title}
              </div>
            </div>
          `;
        }).join('');
        
        postersGrid.innerHTML = fallbackHTML + fallbackHTML;
      });
  }
  
  // Call on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadMoviePosters);
  } else {
    loadMoviePosters();
  }
})();