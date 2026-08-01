// ==========================================
// FIREBASE CONFIGURATION - MODULAR SDK (v9+)
// ==========================================
// CDN-based setup for Phone OTP Authentication
// Zero-cost Spark plan implementation
// ==========================================

// Import Firebase modules from CDN
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { 
    getAuth, 
    RecaptchaVerifier, 
    signInWithPhoneNumber,
    GoogleAuthProvider,
    signInWithPopup
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

// ==========================================
// YOUR FIREBASE PROJECT CREDENTIALS
// Replace with your actual Firebase project config
// Get from: Firebase Console > Project Settings > General
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyAEPN4MM--17vnbkW2aTcQUz6bv-UlP0MM",
  authDomain: "bookora-ca0fa.firebaseapp.com",
  projectId: "bookora-ca0fa",
  storageBucket: "bookora-ca0fa.firebasestorage.app",
  messagingSenderId: "678168293157",
  appId: "1:678168293157:web:73bf40afaff6ba92e7b4cc"
};

// ==========================================
// INITIALIZE FIREBASE
// ==========================================
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// For localhost development - allows reCAPTCHA on 127.0.0.1
// Remove in production or use your actual domain
if (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') {
    auth.settings.appVerificationDisabledForTesting = false; // Keep reCAPTCHA enabled even on localhost
}

// ==========================================
// EXPORT FOR USE IN OTHER MODULES
// ==========================================
export { 
    auth,
    RecaptchaVerifier, 
    signInWithPhoneNumber,
    GoogleAuthProvider,
    signInWithPopup
};

console.log('✅ Firebase Modular SDK initialized successfully');
