// Interview Notes Management System
(function() {
  let notesRef = null;
  let currentSessionCode = null;
  let currentUser = null;
  let autoSaveTimer = null;
  let selectedTags = [];
  let currentRating = 0;

  // Initialize notes system
  window.initializeInterviewNotes = function(sessionCode, user) {
    currentSessionCode = sessionCode;
    currentUser = user;
    
    // Only show notes for interviewers/admins
    if (user && user.isAdmin) {
      document.getElementById('notes-toggle-btn').style.display = 'block';
      setupNotesPanel();
      loadExistingNotes();
    }
  };

  // Setup notes panel event handlers
  function setupNotesPanel() {
    // Toggle notes panel
    const notesToggleBtn = document.getElementById('notes-toggle-btn');
    const notesPanel = document.getElementById('notes-panel');
    const closeNotesBtn = document.getElementById('close-notes');
    const firepadContainer = document.getElementById('firepad-container');
    
    if (notesToggleBtn) {
      notesToggleBtn.addEventListener('click', function() {
        const isVisible = notesPanel.style.display !== 'none';
        if (isVisible) {
          notesPanel.style.display = 'none';
          firepadContainer.classList.remove('with-notes');
          notesToggleBtn.classList.remove('active');
        } else {
          notesPanel.style.display = 'flex';
          firepadContainer.classList.add('with-notes');
          notesToggleBtn.classList.add('active');
        }
      });
    }
    
    if (closeNotesBtn) {
      closeNotesBtn.addEventListener('click', function() {
        notesPanel.style.display = 'none';
        firepadContainer.classList.remove('with-notes');
        notesToggleBtn.classList.remove('active');
      });
    }
    
    // Rating stars
    const ratingStars = document.querySelectorAll('.rating-stars span');
    ratingStars.forEach(star => {
      star.addEventListener('click', function() {
        const rating = parseInt(this.getAttribute('data-rating'));
        setRating(rating);
      });
      
      star.addEventListener('mouseenter', function() {
        const rating = parseInt(this.getAttribute('data-rating'));
        highlightStars(rating);
      });
    });
    
    document.querySelector('.rating-stars').addEventListener('mouseleave', function() {
      highlightStars(currentRating);
    });
    
    // Quick tags
    const tagButtons = document.querySelectorAll('.tag-btn');
    tagButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        const tag = this.getAttribute('data-tag');
        toggleTag(tag, this);
      });
    });
    
    // Auto-save on text change
    const notesText = document.getElementById('interview-notes-text');
    if (notesText) {
      notesText.addEventListener('input', function() {
        scheduleAutoSave();
      });
    }
    
    // Recommendation change
    const recommendationSelect = document.getElementById('notes-recommendation');
    if (recommendationSelect) {
      recommendationSelect.addEventListener('change', function() {
        scheduleAutoSave();
        highlightRecommendation(this.value);
      });
    }
    
    // Manual save button
    const saveBtn = document.getElementById('save-notes-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', function() {
        saveNotes(true);
      });
    }
  }

  // Set rating
  function setRating(rating) {
    currentRating = rating;
    highlightStars(rating);
    scheduleAutoSave();
  }

  // Highlight stars up to rating
  function highlightStars(rating) {
    const stars = document.querySelectorAll('.rating-stars span');
    stars.forEach((star, index) => {
      if (index < rating) {
        star.textContent = '★';
        star.classList.add('filled');
      } else {
        star.textContent = '☆';
        star.classList.remove('filled');
      }
    });
  }

  // Toggle tag selection
  function toggleTag(tag, button) {
    const index = selectedTags.indexOf(tag);
    if (index > -1) {
      selectedTags.splice(index, 1);
      button.classList.remove('selected');
    } else {
      selectedTags.push(tag);
      button.classList.add('selected');
    }
    scheduleAutoSave();
  }

  // Highlight recommendation based on value
  function highlightRecommendation(value) {
    const select = document.getElementById('notes-recommendation');
    select.className = '';
    
    switch(value) {
      case 'STRONG_HIRE':
        select.style.backgroundColor = '#4caf50';
        select.style.color = 'white';
        break;
      case 'HIRE':
        select.style.backgroundColor = '#8bc34a';
        select.style.color = 'white';
        break;
      case 'PROCEED_TO_NEXT_ROUND':
        select.style.backgroundColor = '#2196f3';
        select.style.color = 'white';
        break;
      case 'MAYBE':
        select.style.backgroundColor = '#ff9800';
        select.style.color = 'white';
        break;
      case 'NO_HIRE':
        select.style.backgroundColor = '#f44336';
        select.style.color = 'white';
        break;
      default:
        select.style.backgroundColor = '#1e1e1e';
        select.style.color = '#fff';
    }
  }

  // Schedule auto-save
  function scheduleAutoSave() {
    clearTimeout(autoSaveTimer);
    updateSaveStatus('Typing...');
    
    autoSaveTimer = setTimeout(() => {
      saveNotes(false);
    }, 2000); // Save 2 seconds after user stops typing
  }

  // Save notes to Firebase
  function saveNotes(isManual) {
    if (!currentSessionCode || !window.firebase) return;
    
    const notesText = document.getElementById('interview-notes-text').value;
    const recommendation = document.getElementById('notes-recommendation').value;
    
    updateSaveStatus('Saving...');
    
    const notesData = {
      content: notesText,
      rating: {
        overall: currentRating
      },
      tags: selectedTags,
      recommendation: recommendation,
      updatedAt: firebase.database.ServerValue.TIMESTAMP,
      createdBy: currentUser.email || 'Interviewer'
    };
    
    // Add createdAt if this is the first save
    if (!notesRef) {
      notesData.createdAt = firebase.database.ServerValue.TIMESTAMP;
    }
    
    // Save to Firebase
    firebase.database()
      .ref(`sessions/${currentSessionCode}/interviewerNotes`)
      .update(notesData)
      .then(() => {
        updateSaveStatus(isManual ? 'Saved!' : 'Auto-saved');
        setTimeout(() => updateSaveStatus(''), 3000);
        
        // Track in PostHog
        if (window.posthog) {
          window.posthog.capture('interview_notes_saved', {
            session_code: currentSessionCode,
            has_rating: currentRating > 0,
            has_tags: selectedTags.length > 0,
            has_recommendation: !!recommendation,
            is_manual_save: isManual
          });
        }
      })
      .catch(error => {
        console.error('Error saving notes:', error);
        updateSaveStatus('Error saving');
      });
  }

  // Load existing notes
  function loadExistingNotes() {
    if (!currentSessionCode || !window.firebase) return;
    
    firebase.database()
      .ref(`sessions/${currentSessionCode}/interviewerNotes`)
      .once('value')
      .then(snapshot => {
        const notes = snapshot.val();
        if (notes) {
          // Load text
          if (notes.content) {
            document.getElementById('interview-notes-text').value = notes.content;
          }
          
          // Load rating
          if (notes.rating && notes.rating.overall) {
            setRating(notes.rating.overall);
          }
          
          // Load tags
          if (notes.tags && Array.isArray(notes.tags)) {
            selectedTags = notes.tags;
            notes.tags.forEach(tag => {
              const btn = document.querySelector(`.tag-btn[data-tag="${tag}"]`);
              if (btn) {
                btn.classList.add('selected');
              }
            });
          }
          
          // Load recommendation
          if (notes.recommendation) {
            document.getElementById('notes-recommendation').value = notes.recommendation;
            highlightRecommendation(notes.recommendation);
          }
          
          updateSaveStatus('Notes loaded');
          setTimeout(() => updateSaveStatus(''), 2000);
        }
      })
      .catch(error => {
        console.error('Error loading notes:', error);
      });
  }

  // Update save status indicator
  function updateSaveStatus(status) {
    const statusElement = document.getElementById('notes-save-status');
    if (statusElement) {
      statusElement.textContent = status;
    }
  }

  // View notes in read-only mode (for admin dashboard)
  window.viewSessionNotes = function(sessionCode) {
    if (!window.firebase) return;
    
    return firebase.database()
      .ref(`sessions/${sessionCode}/interviewerNotes`)
      .once('value')
      .then(snapshot => snapshot.val());
  };

  // Format recommendation for display
  window.formatRecommendation = function(recommendation) {
    const labels = {
      'STRONG_HIRE': 'Strong Hire',
      'HIRE': 'Hire',
      'PROCEED_TO_NEXT_ROUND': 'Next Round',
      'MAYBE': 'Maybe',
      'NO_HIRE': 'No Hire'
    };
    return labels[recommendation] || recommendation;
  };

  // Get recommendation badge class
  window.getRecommendationClass = function(recommendation) {
    const classes = {
      'STRONG_HIRE': 'strong-hire',
      'HIRE': 'hire',
      'PROCEED_TO_NEXT_ROUND': 'proceed',
      'MAYBE': 'maybe',
      'NO_HIRE': 'no-hire'
    };
    return classes[recommendation] || '';
  };
})();