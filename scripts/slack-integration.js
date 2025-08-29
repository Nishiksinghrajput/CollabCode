// Slack Integration for Interview Feedback
(function() {
  let currentSessionData = null;
  let currentSessionCode = null;
  
  // Initialize Slack integration
  window.initializeSlackIntegration = function(sessionCode, sessionData) {
    console.log('Initializing Slack integration for session:', sessionCode);
    currentSessionCode = sessionCode;
    currentSessionData = sessionData;
    
    // Setup Slack share button
    const shareBtn = document.getElementById('shareToSlackBtn');
    if (shareBtn) {
      console.log('Found Slack share button, setting up click handler');
      const newShareBtn = shareBtn.cloneNode(true);
      shareBtn.parentNode.replaceChild(newShareBtn, shareBtn);
      
      newShareBtn.addEventListener('click', function() {
        console.log('Slack button clicked');
        openSlackShareModal();
      });
    } else {
      console.error('Slack share button not found in DOM');
    }
  };
  
  // Open Slack share modal
  function openSlackShareModal() {
    console.log('Opening Slack share modal');
    const modal = document.getElementById('slackConfigModal');
    if (!modal) {
      console.error('Slack config modal not found in DOM');
      alert('Slack sharing is not available. Please refresh the page.');
      return;
    }
    
    // Load saved webhook URL
    const savedWebhook = localStorage.getItem('slackWebhookUrl');
    const webhookInput = document.getElementById('slackWebhookUrl');
    if (webhookInput && savedWebhook) {
      webhookInput.value = savedWebhook;
    }
    
    // Generate preview
    updateSlackPreview();
    
    // Show modal
    modal.style.display = 'flex';
    
    // Setup event handlers
    setupSlackModalHandlers();
  }
  
  // Setup modal event handlers
  function setupSlackModalHandlers() {
    const closeBtn = document.getElementById('closeSlackConfigBtn');
    const cancelBtn = document.getElementById('cancelSlackShare');
    const sendBtn = document.getElementById('sendToSlack');
    const webhookInput = document.getElementById('slackWebhookUrl');
    
    // Close handlers
    if (closeBtn) {
      const newCloseBtn = closeBtn.cloneNode(true);
      closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
      newCloseBtn.addEventListener('click', closeSlackModal);
    }
    
    if (cancelBtn) {
      const newCancelBtn = cancelBtn.cloneNode(true);
      cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
      newCancelBtn.addEventListener('click', closeSlackModal);
    }
    
    // Send to Slack
    if (sendBtn) {
      const newSendBtn = sendBtn.cloneNode(true);
      sendBtn.parentNode.replaceChild(newSendBtn, sendBtn);
      newSendBtn.addEventListener('click', sendToSlack);
    }
    
    // Update preview on webhook change
    if (webhookInput) {
      webhookInput.addEventListener('input', function() {
        localStorage.setItem('slackWebhookUrl', this.value);
      });
    }
  }
  
  // Update Slack message preview
  function updateSlackPreview() {
    const previewContent = document.getElementById('slackPreviewContent');
    if (!previewContent) return;
    
    // Get session data from Firebase if needed
    if (currentSessionData && window.firebase) {
      window.firebase.database()
        .ref(`sessions/${currentSessionCode}/interviewerNotes`)
        .once('value')
        .then(snapshot => {
          const notes = snapshot.val();
          const message = formatSlackMessage(notes);
          previewContent.innerHTML = message.preview;
        })
        .catch(error => {
          console.error('Error loading notes for Slack:', error);
          previewContent.innerHTML = '<div style="color: #f44336;">Error loading session data</div>';
        });
    }
  }
  
  // Format message for Slack
  function formatSlackMessage(notes) {
    const candidateName = getCandidateName();
    const recommendation = notes?.recommendation || 'No recommendation';
    const rating = notes?.rating?.overall || 0;
    const notesContent = notes?.content || 'No notes';
    const tags = notes?.tags || [];
    
    // Color based on recommendation
    const colors = {
      'STRONG_HIRE': '#4caf50',
      'HIRE': '#8bc34a',
      'PROCEED_TO_NEXT_ROUND': '#2196f3',
      'MAYBE': '#ff9800',
      'NO_HIRE': '#f44336'
    };
    
    const labels = {
      'STRONG_HIRE': '✅ Strong Hire',
      'HIRE': '✅ Hire',
      'PROCEED_TO_NEXT_ROUND': '➡️ Next Round',
      'MAYBE': '🤔 Maybe',
      'NO_HIRE': '❌ No Hire'
    };
    
    const color = colors[recommendation] || '#666666';
    const label = labels[recommendation] || recommendation;
    
    // Create preview HTML
    const preview = `
      <div><strong>👤 Candidate:</strong> ${candidateName}</div>
      <div><strong>📊 Recommendation:</strong> ${label}</div>
      <div><strong>⭐ Rating:</strong> ${'★'.repeat(rating)}${'☆'.repeat(5-rating)} (${rating}/5)</div>
      <div><strong>🏷️ Tags:</strong> ${tags.length > 0 ? tags.join(', ') : 'None'}</div>
      <div><strong>📝 Notes:</strong> ${notesContent.substring(0, 200)}${notesContent.length > 200 ? '...' : ''}</div>
      <div style="margin-top: 10px; color: #888;">Session: ${currentSessionCode}</div>
    `;
    
    // Create Slack payload
    const slackPayload = {
      text: `Interview Feedback for ${candidateName}`,
      attachments: [{
        color: color,
        title: `Interview Session: ${currentSessionCode}`,
        fields: [
          {
            title: "Candidate",
            value: candidateName,
            short: true
          },
          {
            title: "Recommendation",
            value: label,
            short: true
          },
          {
            title: "Rating",
            value: '⭐'.repeat(rating) + ` (${rating}/5)`,
            short: true
          },
          {
            title: "Session Code",
            value: currentSessionCode,
            short: true
          },
          {
            title: "Tags",
            value: tags.length > 0 ? tags.join(', ') : 'None',
            short: false
          },
          {
            title: "Interview Notes",
            value: notesContent,
            short: false
          }
        ],
        footer: "Interview Platform",
        footer_icon: "https://platform.slack-edge.com/img/default_application_icon.png",
        ts: Math.floor(Date.now() / 1000)
      }]
    };
    
    return {
      preview: preview,
      payload: slackPayload
    };
  }
  
  // Get candidate name from session data
  function getCandidateName() {
    if (!currentSessionData || !currentSessionData.users) return 'Unknown Candidate';
    
    const users = Object.values(currentSessionData.users);
    const candidate = users.find(user => 
      user.name && !user.name.toLowerCase().includes('interviewer')
    );
    
    return candidate?.name || 'Unknown Candidate';
  }
  
  // Send to Slack
  async function sendToSlack() {
    const webhookUrl = document.getElementById('slackWebhookUrl').value;
    
    if (!webhookUrl) {
      alert('Please enter a Slack webhook URL');
      return;
    }
    
    // Validate webhook URL
    if (!webhookUrl.startsWith('https://hooks.slack.com/')) {
      alert('Invalid webhook URL. It should start with https://hooks.slack.com/');
      return;
    }
    
    const sendBtn = document.getElementById('sendToSlack');
    if (sendBtn) {
      sendBtn.disabled = true;
      sendBtn.textContent = 'Sending...';
    }
    
    try {
      // Get the latest notes
      const snapshot = await window.firebase.database()
        .ref(`sessions/${currentSessionCode}/interviewerNotes`)
        .once('value');
      
      const notes = snapshot.val();
      const message = formatSlackMessage(notes);
      
      // Send to Slack via webhook
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message.payload)
      });
      
      if (response.ok) {
        showNotification('Successfully shared to Slack!', false);
        closeSlackModal();
      } else {
        throw new Error('Failed to send to Slack');
      }
    } catch (error) {
      console.error('Error sending to Slack:', error);
      showNotification('Failed to send to Slack. Please check your webhook URL.', true);
    } finally {
      if (sendBtn) {
        sendBtn.disabled = false;
        sendBtn.textContent = 'Send to Slack';
      }
    }
  }
  
  // Close Slack modal
  function closeSlackModal() {
    const modal = document.getElementById('slackConfigModal');
    if (modal) {
      modal.style.display = 'none';
    }
  }
  
  // Show notification
  function showNotification(message, isError = false) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${isError ? '#f44336' : '#4caf50'};
      color: white;
      padding: 12px 20px;
      border-radius: 4px;
      z-index: 100000;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 4000);
  }
  
  // Make functions globally available
  window.openSlackShareModal = openSlackShareModal;
  window.sendToSlack = sendToSlack;
})();