// Initialize Firebase
var config = {
  apiKey: "AIzaSyDaTXD54QykZ7IIT8Ji9mZBqxhijRKLd3U",
  authDomain: "sneakers-688b6.firebaseapp.com",
  databaseURL: "https://sneakers-688b6.firebaseio.com",
  storageBucket: "sneakers-688b6.appspot.com",
  messagingSenderId: "553327129273"
};

console.log('🔥 Initializing Firebase with config:', config.databaseURL);
firebase.initializeApp(config);

// Performance optimizations for real-time sync
firebase.database().goOnline();

// Enable disk persistence for offline support (improves perceived performance)
// Note: This only works on web if using newer SDK
try {
  // Force WebSocket connection for lower latency
  if (firebase.database && firebase.database.INTERNAL) {
    firebase.database.INTERNAL.forceWebSockets();
  }
} catch(e) {
  console.log('Using default Firebase transport');
}

// Test Firebase connection with latency measurement
const startTime = Date.now();
firebase.database().ref('.info/connected').on('value', function(snapshot) {
  const latency = Date.now() - startTime;
  if (snapshot.val() === true) {
    console.log(`✅ Firebase connected successfully! (${latency}ms)`);
  } else {
    console.log('⚠️ Firebase disconnected');
  }
});

// Measure server time offset for better sync
firebase.database().ref('.info/serverTimeOffset').on('value', function(snapshot) {
  const offset = snapshot.val();
  console.log('Server time offset:', offset + 'ms');
});
