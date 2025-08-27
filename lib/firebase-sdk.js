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

// Test Firebase connection
firebase.database().ref('.info/connected').on('value', function(snapshot) {
  if (snapshot.val() === true) {
    console.log('✅ Firebase connected successfully!');
  } else {
    console.log('⚠️ Firebase disconnected');
  }
});
