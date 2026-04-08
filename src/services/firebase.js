import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
  apiKey:            process.env.REACT_APP_FIREBASE_API_KEY             || 'AIzaSyBk-poWIml6b_URhWopIhA1uFz60GJ0zN0',
  authDomain:        process.env.REACT_APP_FIREBASE_AUTH_DOMAIN         || 'aljawhara-8907a.firebaseapp.com',
  projectId:         process.env.REACT_APP_FIREBASE_PROJECT_ID          || 'aljawhara-8907a',
  storageBucket:     process.env.REACT_APP_FIREBASE_STORAGE_BUCKET      || 'aljawhara-8907a.firebasestorage.app',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '487477064947',
  appId:             process.env.REACT_APP_FIREBASE_APP_ID              || '1:487477064947:web:6e6ac0e918a439a7bbf386',
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
