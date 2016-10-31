// Get Firebase Database reference.
var firepadRef = getDocRef();

// Create ACE
var editor = ace.edit("firepad-container");
editor.setTheme("ace/theme/textmate");
var session = editor.getSession();
session.setUseWrapMode(true);
session.setUseWorker(false);
session.setMode("ace/mode/javascript");

// Create Firepad.
var firepad = Firepad.fromACE(firepadRef, editor, {
  defaultText: '// Welcome!\nfunction computer() {\n  var message = "SETEC ASTRONOMY";\n  console.log(decoded(message));\n}'
});

// Helper to get hash from end of URL or generate a random one.
function getDocRef() {
  var ref = firebase.database().ref();
  var hash = window.location.hash.replace(/#/g, '');
  if (hash) {
    ref = ref.child(hash);
  } else {
    ref = ref.push(); // generate unique location.
    window.location = window.location + '#' + ref.key; // add it as a hash to the URL.
  }
  if (typeof console !== 'undefined') {
    console.log('Firebase data: ', ref.toString());
  }
  return ref;
}
