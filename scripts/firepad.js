(function() {
  // Variables
  let firepad, editor, session;
  let currentUser = null;
  let usersRef, sessionRef, firepadRef;
  let languageModes = {};
  let currentSessionCode = null;
  let previousUsers = {};
  
  // Language mode mappings
  const languageConfig = {
    javascript: { mode: 'ace/mode/javascript', ext: 'js' },
    python: { mode: 'ace/mode/python', ext: 'py' },
    java: { mode: 'ace/mode/java', ext: 'java' },
    c_cpp: { mode: 'ace/mode/c_cpp', ext: 'cpp' },
    csharp: { mode: 'ace/mode/csharp', ext: 'cs' },
    php: { mode: 'ace/mode/php', ext: 'php' },
    ruby: { mode: 'ace/mode/ruby', ext: 'rb' },
    go: { mode: 'ace/mode/golang', ext: 'go' },
    rust: { mode: 'ace/mode/rust', ext: 'rs' },
    typescript: { mode: 'ace/mode/typescript', ext: 'ts' },
    swift: { mode: 'ace/mode/swift', ext: 'swift' },
    kotlin: { mode: 'ace/mode/kotlin', ext: 'kt' },
    html: { mode: 'ace/mode/html', ext: 'html' },
    css: { mode: 'ace/mode/css', ext: 'css' },
    sql: { mode: 'ace/mode/sql', ext: 'sql' },
    markdown: { mode: 'ace/mode/markdown', ext: 'md' }
  };

  // Default code examples for each language
  const defaultCode = {
    javascript: '// Welcome to Collaborative Code Editor!\n\nfunction greet(name) {\n  console.log(`Hello, ${name}!`);\n}\n\ngreet("World");',
    python: '# Welcome to Collaborative Code Editor!\n\ndef greet(name):\n    print(f"Hello, {name}!")\n\ngreet("World")',
    java: '// Welcome to Collaborative Code Editor!\n\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
    c_cpp: '// Welcome to Collaborative Code Editor!\n\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}',
    csharp: '// Welcome to Collaborative Code Editor!\n\nusing System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, World!");\n    }\n}',
    php: '<?php\n// Welcome to Collaborative Code Editor!\n\nfunction greet($name) {\n    echo "Hello, $name!";\n}\n\ngreet("World");\n?>',
    ruby: '# Welcome to Collaborative Code Editor!\n\ndef greet(name)\n  puts "Hello, #{name}!"\nend\n\ngreet("World")',
    go: '// Welcome to Collaborative Code Editor!\n\npackage main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}',
    rust: '// Welcome to Collaborative Code Editor!\n\nfn main() {\n    println!("Hello, World!");\n}',
    typescript: '// Welcome to Collaborative Code Editor!\n\nfunction greet(name: string): void {\n  console.log(`Hello, ${name}!`);\n}\n\ngreet("World");',
    swift: '// Welcome to Collaborative Code Editor!\n\nimport Foundation\n\nfunc greet(_ name: String) {\n    print("Hello, \\(name)!")\n}\n\ngreet("World")',
    kotlin: '// Welcome to Collaborative Code Editor!\n\nfun main() {\n    println("Hello, World!")\n}',
    html: '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <title>Welcome</title>\n</head>\n<body>\n    <h1>Hello, World!</h1>\n</body>\n</html>',
    css: '/* Welcome to Collaborative Code Editor! */\n\nbody {\n    font-family: Arial, sans-serif;\n    background: #f0f0f0;\n    color: #333;\n}\n\nh1 {\n    color: #007acc;\n}',
    sql: '-- Welcome to Collaborative Code Editor!\n\nCREATE TABLE users (\n    id INT PRIMARY KEY,\n    name VARCHAR(100),\n    email VARCHAR(100)\n);\n\nSELECT * FROM users;',
    markdown: '# Welcome to Collaborative Code Editor!\n\n## Features\n\n- Real-time collaboration\n- Multiple language support\n- Syntax highlighting\n- Live presence indicators\n\n### Getting Started\n\n1. Share the session code with your team\n2. Start coding together!\n3. See changes in real-time'
  };

  // Initialize the application (called from app.js)
  window.initializeSession = function(options) {
    const { userName, sessionCode, isNew, isAdmin } = options;
    
    console.log('=== INITIALIZING SESSION ===');
    console.log('User:', userName, 'Code:', sessionCode, 'New:', isNew, 'Admin:', isAdmin);
    
    currentSessionCode = sessionCode;
    currentUser = {
      name: userName,
      id: generateUserId(),
      color: generateUserColor(),
      isAdmin: isAdmin
    };
    
    // Initialize editor and Firebase
    initializeEditor();
    initializeFirebase(isNew);
    setupEventListeners();
    
    // Update UI to show admin features if applicable
    if (isAdmin) {
      const sessionInfo = document.getElementById('session-info');
      if (sessionInfo) {
        sessionInfo.innerHTML += ' <span style="color: #4caf50">(Admin)</span>';
      }
    }
  }

  // Generate 6-digit session code
  function generateSessionCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Get session code from URL
  function getSessionCodeFromURL() {
    const hash = window.location.hash.replace('#', '');
    if (hash && /^\d{6}$/.test(hash)) {
      return hash;
    }
    return null;
  }


  // Initialize ACE Editor
  function initializeEditor() {
    // Create ACE editor
    editor = ace.edit("firepad-container");
    editor.setTheme("ace/theme/monokai");
    
    session = editor.getSession();
    session.setUseWrapMode(true);
    session.setUseWorker(false);
    session.setMode("ace/mode/javascript");
    
    // Enable autocomplete
    editor.setOptions({
      enableBasicAutocompletion: true,
      enableSnippets: true,
      enableLiveAutocompletion: true,
      fontSize: "14px",
      showPrintMargin: false
    });

    // Update cursor position
    editor.on('changeSelection', updateCursorPosition);
  }

  // Initialize Firebase and Firepad
  function initializeFirebase(isNew) {
    // Use session code for Firebase reference
    const ref = firebase.database().ref('sessions').child(currentSessionCode);
    firepadRef = ref.child('firepad');
    sessionRef = ref;
    usersRef = ref.child('users');

    console.log('=== SESSION DEBUG ===');
    console.log(isNew ? 'CREATING new session:' : 'JOINING existing session:', currentSessionCode);
    console.log('Firebase refs:', {
      sessionRef: sessionRef.toString(),
      firepadRef: firepadRef.toString(),
      usersRef: usersRef.toString()
    });
    console.log('Current user:', currentUser);
    console.log('=====================');

    // Initialize Firepad
    const currentLanguage = 'javascript';
    
    console.log('Creating Firepad instance...');
    try {
      firepad = Firepad.fromACE(firepadRef, editor, {
        defaultText: defaultCode[currentLanguage],
        userId: currentUser.id
      });
      
      console.log('✅ Firepad instance created');
      
      // Log when Firepad is ready
      firepad.on('ready', function() {
        console.log('🟢 Firepad READY! Session', currentSessionCode, 'is active');
        
        // Check if there's existing content
        const content = editor.getValue();
        console.log('Session content length:', content.length);
        
        if (!isNew) {
          // Announce joining for existing session
          showUserNotification(`You joined session ${currentSessionCode}`, 'join');
        }
      });
      
      // Setup presence system
      setupPresence();

      // Setup session info
      setupSessionInfo();

      // Sync language and theme settings
      syncSettings();

      // Load language modes dynamically
      loadLanguageModes();
      
    } catch (error) {
      console.error('❌ Failed to create Firepad:', error);
    }
  }

  // Setup user presence
  let presenceSetup = false;
  function setupPresence() {
    // Prevent duplicate setup
    if (presenceSetup) {
      console.log('Presence already setup, skipping...');
      return;
    }
    presenceSetup = true;
    
    const userRef = usersRef.child(currentUser.id);
    
    console.log('Setting up presence for user:', currentUser.name);
    
    // Set user data
    userRef.set({
      name: currentUser.name,
      color: currentUser.color,
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      joinedAt: firebase.database.ServerValue.TIMESTAMP
    }).then(() => {
      console.log('✅ User presence set successfully');
    }).catch(err => {
      console.error('❌ Failed to set user presence:', err);
    });

    // Remove user on disconnect
    userRef.onDisconnect().remove();

    // Remove any existing listeners first
    usersRef.off('value');
    
    // Listen for user changes
    usersRef.on('value', function(snapshot) {
      const users = snapshot.val() || {};
      console.log('Users in session:', Object.keys(users).length);
      updateUsersList(users);
      detectUserChanges(users);
      updateUserCount(users);
    }, function(error) {
      console.error('❌ Error listening to users:', error);
    });

    // Monitor connection status
    const connectedRef = firebase.database().ref('.info/connected');
    connectedRef.on('value', function(snapshot) {
      const isConnected = snapshot.val();
      updateConnectionStatus(isConnected);
    });
  }

  // Detect user joins/leaves
  let isFirstUserUpdate = true;
  function detectUserChanges(currentUsers) {
    // Skip the first update to avoid false notifications
    if (isFirstUserUpdate) {
      isFirstUserUpdate = false;
      previousUsers = {...currentUsers};
      return;
    }
    
    const currentIds = Object.keys(currentUsers);
    const previousIds = Object.keys(previousUsers);
    
    // Check for new users (only if we had previous users to compare)
    if (previousIds.length > 0) {
      currentIds.forEach(userId => {
        if (!previousIds.includes(userId) && userId !== currentUser.id) {
          const user = currentUsers[userId];
          showUserNotification(`${user.name} joined the session`, 'join');
          playNotificationSound('join');
        }
      });
    }
    
    // Check for users who left
    previousIds.forEach(userId => {
      if (!currentIds.includes(userId) && userId !== currentUser.id) {
        const user = previousUsers[userId];
        if (user) {
          showUserNotification(`${user.name} left the session`, 'leave');
          playNotificationSound('leave');
        }
      }
    });
    
    previousUsers = {...currentUsers};
  }

  // Show user notification
  let notificationQueue = [];
  let isShowingNotification = false;
  
  function showUserNotification(message, type) {
    // Add to queue
    notificationQueue.push({ message, type });
    
    // Process queue if not already processing
    if (!isShowingNotification) {
      processNotificationQueue();
    }
  }
  
  function processNotificationQueue() {
    if (notificationQueue.length === 0) {
      isShowingNotification = false;
      return;
    }
    
    isShowingNotification = true;
    const { message, type } = notificationQueue.shift();
    
    // Remove any existing notifications
    const existing = document.querySelector('.user-notification');
    if (existing) {
      existing.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `user-notification ${type}`;
    notification.innerHTML = `
      <span class="icon">${type === 'join' ? '👋' : '👋'}</span>
      <span>${message}</span>
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => {
        notification.remove();
        // Process next notification
        setTimeout(() => processNotificationQueue(), 100);
      }, 300);
    }, 2000);
  }

  // Play notification sound (optional)
  function playNotificationSound(type) {
    // You can add sound effects here if desired
    // const audio = new Audio(type === 'join' ? 'join.mp3' : 'leave.mp3');
    // audio.play().catch(() => {});
  }

  // Update users list display
  function updateUsersList(users) {
    const usersList = document.getElementById('users-list');
    usersList.innerHTML = '';

    if (!users) return;

    Object.keys(users).forEach(userId => {
      const user = users[userId];
      const badge = document.createElement('div');
      badge.className = 'user-badge';
      if (userId === currentUser.id) {
        badge.className += ' current-user';
      }
      badge.textContent = user.name;
      badge.style.borderLeft = `3px solid ${user.color}`;
      usersList.appendChild(badge);
    });
  }

  // Update user count
  function updateUserCount(users) {
    const count = Object.keys(users).length;
    const userCountEl = document.getElementById('user-count');
    userCountEl.textContent = `${count} ${count === 1 ? 'user' : 'users'} online`;
  }

  // Update connection status
  function updateConnectionStatus(connected) {
    const status = document.getElementById('connection-status');
    if (connected) {
      status.textContent = 'Connected';
      status.className = 'connected';
    } else {
      status.textContent = 'Disconnected';
      status.className = 'disconnected';
    }
  }

  // Setup session info
  function setupSessionInfo() {
    const sessionInfo = document.getElementById('session-info');
    sessionInfo.innerHTML = `Session Code: <strong>${currentSessionCode}</strong>`;
  }

  // Sync settings across users
  function syncSettings() {
    const settingsRef = sessionRef.child('settings');
    
    // Language selector
    const languageSelector = document.getElementById('language-selector');
    languageSelector.addEventListener('change', function() {
      const language = this.value;
      settingsRef.child('language').set(language);
      changeLanguage(language);
    });

    // Theme selector
    const themeSelector = document.getElementById('theme-selector');
    themeSelector.addEventListener('change', function() {
      const theme = this.value;
      settingsRef.child('theme').set(theme);
      editor.setTheme(`ace/theme/${theme}`);
    });

    // Font size selector
    const fontSizeSelector = document.getElementById('fontSize-selector');
    fontSizeSelector.addEventListener('change', function() {
      const fontSize = this.value + 'px';
      editor.setFontSize(fontSize);
    });

    // Listen for settings changes
    settingsRef.on('value', function(snapshot) {
      const settings = snapshot.val();
      if (settings) {
        if (settings.language && languageSelector.value !== settings.language) {
          languageSelector.value = settings.language;
          changeLanguage(settings.language);
        }
        if (settings.theme && themeSelector.value !== settings.theme) {
          themeSelector.value = settings.theme;
          editor.setTheme(`ace/theme/${settings.theme}`);
        }
      }
    });
  }

  // Change editor language
  function changeLanguage(language) {
    const config = languageConfig[language];
    if (config) {
      // Load mode if not already loaded
      if (!languageModes[language]) {
        const script = document.createElement('script');
        script.src = `https://cdnjs.cloudflare.com/ajax/libs/ace/1.33.2/mode-${language}.js`;
        script.onload = function() {
          languageModes[language] = true;
          session.setMode(config.mode);
        };
        document.head.appendChild(script);
      } else {
        session.setMode(config.mode);
      }
    }
  }

  // Load common language modes
  function loadLanguageModes() {
    const commonLanguages = ['python', 'java', 'c_cpp', 'typescript', 'html', 'css'];
    commonLanguages.forEach(lang => {
      const script = document.createElement('script');
      script.src = `https://cdnjs.cloudflare.com/ajax/libs/ace/1.33.2/mode-${lang}.js`;
      script.onload = function() {
        languageModes[lang] = true;
      };
      document.head.appendChild(script);
    });
  }

  // Setup event listeners
  function setupEventListeners() {
    // Share button
    document.getElementById('share-btn').addEventListener('click', function() {
      shareSession();
    });

    // Run button
    document.getElementById('run-btn').addEventListener('click', function() {
      runCode();
    });

    // Output panel controls
    document.getElementById('clear-output').addEventListener('click', function() {
      clearOutput();
    });

    document.getElementById('close-output').addEventListener('click', function() {
      hideOutput();
    });
  }

  // Share session
  function shareSession() {
    const shareMessage = `Join my coding session!\n\nSession Code: ${currentSessionCode}\n\nGo to: ${window.location.origin}\nEnter code: ${currentSessionCode}`;
    
    // Try to copy the session code
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(currentSessionCode).then(function() {
        showNotification(`✓ Session code ${currentSessionCode} copied! Share it with others to collaborate.`);
        console.log('Session code copied:', currentSessionCode);
      }).catch(function(err) {
        console.error('Failed to copy:', err);
        showShareDialog();
      });
    } else {
      copyToClipboardFallback(currentSessionCode);
    }
  }

  // Fallback method to copy to clipboard
  function copyToClipboardFallback(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
      document.execCommand('copy');
      showNotification(`✓ Session code ${text} copied! Share it with others to collaborate.`);
      console.log('Session code copied using fallback');
    } catch (err) {
      console.error('Fallback copy failed:', err);
      showShareDialog();
    }
    
    document.body.removeChild(textarea);
  }

  // Show share dialog
  function showShareDialog() {
    const message = `Share this session code with others:\n\n${currentSessionCode}\n\n(Code has been selected for easy copying)`;
    prompt(message, currentSessionCode);
  }

  // Show notification
  function showNotification(message) {
    // Remove any existing notifications
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
      position: fixed;
      top: 70px;
      right: 20px;
      background: #4caf50;
      color: white;
      padding: 14px 20px;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10001;
      font-size: 14px;
      max-width: 400px;
      animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 4000);
  }

  // Update cursor position display
  function updateCursorPosition() {
    const position = editor.getCursorPosition();
    const display = document.getElementById('cursor-position');
    display.textContent = `Line ${position.row + 1}, Column ${position.column + 1}`;
  }

  // Generate unique user ID
  function generateUserId() {
    return 'user_' + Math.random().toString(36).substr(2, 9);
  }

  // Generate random color for user
  function generateUserColor() {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#FFD700', '#FF69B4', '#00CED1'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // Run code execution
  async function runCode() {
    const runBtn = document.getElementById('run-btn');
    const language = document.getElementById('language-selector').value;
    const code = editor.getValue();
    const input = document.getElementById('stdin-input').value;

    // Check if language supports execution
    if (!CodeExecutor.isSupported(language)) {
      showOutput(`Language '${language}' does not support execution yet.`, 'error');
      return;
    }

    // Show output panel
    showOutput('Running...', 'info');
    runBtn.disabled = true;
    runBtn.textContent = 'Running...';

    try {
      const result = await CodeExecutor.execute(language, code, input);
      
      if (result.success) {
        let output = result.output || '(No output)';
        if (result.executionTime) {
          output += `\n\nExecution time: ${result.executionTime}ms`;
        }
        showOutput(output, 'success');
      } else {
        showOutput(result.error || 'Execution failed', 'error');
      }
    } catch (error) {
      showOutput(`Error: ${error.message}`, 'error');
    } finally {
      runBtn.disabled = false;
      runBtn.textContent = '▶ Run';
    }
  }

  // Show output panel
  function showOutput(text, type = 'normal') {
    const outputPanel = document.getElementById('output-panel');
    const outputText = document.getElementById('output-text');
    
    outputPanel.style.display = 'flex';
    outputText.textContent = text;
    outputText.className = type;

    // Show input section for languages that might need it
    const language = document.getElementById('language-selector').value;
    const inputSection = document.getElementById('input-section');
    if (['python', 'java', 'c_cpp', 'javascript'].includes(language)) {
      inputSection.style.display = 'block';
    }
  }

  // Clear output
  function clearOutput() {
    const outputText = document.getElementById('output-text');
    outputText.textContent = '';
    outputText.className = '';
  }

  // Hide output panel
  function hideOutput() {
    const outputPanel = document.getElementById('output-panel');
    outputPanel.style.display = 'none';
  }

  // Application is now initialized from app.js
})();