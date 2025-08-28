/**
 * Secure Authentication Module
 * Replaces auth.js with secure API-based authentication
 */

(function() {
  'use strict';

  const API_BASE = window.location.origin + '/api';
  
  // Store auth state in memory (not localStorage for security)
  let authState = {
    isLoggedIn: false,
    isAdmin: false,
    userName: null,
    token: null
  };

  // Secure API request helper
  async function apiRequest(endpoint, options = {}) {
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      credentials: 'include' // Include cookies
    };

    // Add auth token if available
    if (authState.token) {
      defaultOptions.headers['Authorization'] = `Bearer ${authState.token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...defaultOptions,
      ...options
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Login as admin
  async function loginAdmin(email, password) {
    try {
      const result = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      if (result.success) {
        authState = {
          isLoggedIn: true,
          isAdmin: true,
          userName: 'Interviewer',
          token: result.token
        };
        
        // Store in sessionStorage (not localStorage) for this session only
        sessionStorage.setItem('authToken', result.token);
        
        return { success: true };
      }
      
      return { success: false, error: 'Invalid credentials' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  }

  // Join as candidate
  async function joinAsCandidate(name, sessionCode) {
    try {
      const result = await apiRequest('/sessions/validate', {
        method: 'POST',
        body: JSON.stringify({ 
          sessionId: sessionCode, 
          userName: name 
        })
      });

      if (result.valid) {
        authState = {
          isLoggedIn: true,
          isAdmin: false,
          userName: name,
          token: result.token
        };
        
        sessionStorage.setItem('authToken', result.token);
        sessionStorage.setItem('userName', name);
        
        return { success: true };
      }
      
      return { success: false, error: 'Invalid session' };
    } catch (error) {
      console.error('Join error:', error);
      return { success: false, error: error.message };
    }
  }

  // Logout
  async function logout() {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    authState = {
      isLoggedIn: false,
      isAdmin: false,
      userName: null,
      token: null
    };
    
    sessionStorage.clear();
  }

  // Get current session
  function getCurrentSession() {
    // Try to restore from sessionStorage on page load
    if (!authState.token) {
      const token = sessionStorage.getItem('authToken');
      const userName = sessionStorage.getItem('userName');
      
      if (token) {
        authState.token = token;
        authState.userName = userName || 'User';
        authState.isLoggedIn = true;
        
        // Verify token with server
        verifySession();
      }
    }
    
    return authState;
  }

  // Verify session with server
  async function verifySession() {
    try {
      const result = await apiRequest('/auth/verify');
      if (result.valid) {
        authState.isLoggedIn = true;
        authState.isAdmin = result.user.isAdmin || false;
      } else {
        logout();
      }
    } catch (error) {
      console.error('Session verification failed:', error);
      logout();
    }
  }

  // Check if user is admin
  function isAdmin() {
    return authState.isAdmin;
  }

  // Create new session (admin only)
  async function createSession() {
    if (!authState.isAdmin) {
      throw new Error('Admin access required');
    }

    try {
      const result = await apiRequest('/sessions/create', {
        method: 'POST'
      });

      if (result.success) {
        return result.sessionId;
      }
      
      throw new Error('Failed to create session');
    } catch (error) {
      console.error('Create session error:', error);
      throw error;
    }
  }

  // Get all sessions (admin only)
  async function getAllSessions() {
    if (!authState.isAdmin) {
      throw new Error('Admin access required');
    }

    try {
      const result = await apiRequest('/sessions');
      return result.sessions;
    } catch (error) {
      console.error('Get sessions error:', error);
      throw error;
    }
  }

  // Terminate session (admin only)
  async function terminateSession(sessionId) {
    if (!authState.isAdmin) {
      throw new Error('Admin access required');
    }

    try {
      const result = await apiRequest(`/sessions/${sessionId}/terminate`, {
        method: 'POST'
      });
      
      return result.success;
    } catch (error) {
      console.error('Terminate session error:', error);
      throw error;
    }
  }

  // Replace the old Auth object with secure version
  window.AuthSecure = {
    loginAdmin,
    joinAsCandidate,
    logout,
    getCurrentSession,
    isAdmin,
    createSession,
    getAllSessions,
    terminateSession,
    verifySession
  };

  // Override the old Auth if it exists
  if (window.Auth) {
    console.warn('Replacing insecure Auth with AuthSecure');
    window.Auth = window.AuthSecure;
  }

})();