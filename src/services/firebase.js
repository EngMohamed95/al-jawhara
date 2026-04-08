import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } from 'firebase/auth';

// ─────────────────────────────────────────────────────────
//  ⚠️  استبدل هذه القيم بقيم مشروعك في Firebase Console
//  https://console.firebase.google.com
// ─────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            process.env.REACT_APP_FIREBASE_API_KEY            || '',
  authDomain:        process.env.REACT_APP_FIREBASE_AUTH_DOMAIN        || '',
  projectId:         process.env.REACT_APP_FIREBASE_PROJECT_ID         || '',
  storageBucket:     process.env.REACT_APP_FIREBASE_STORAGE_BUCKET     || '',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID|| '',
  appId:             process.env.REACT_APP_FIREBASE_APP_ID             || '',
};

const isConfigured = Boolean(firebaseConfig.apiKey);

let auth = null;
let googleProvider = null;
let facebookProvider = null;

if (isConfigured) {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  facebookProvider = new FacebookAuthProvider();
}

export { auth, googleProvider, facebookProvider, signInWithPopup, isConfigured };
