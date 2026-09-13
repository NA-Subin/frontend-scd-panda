import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import { getAuth, GoogleAuthProvider, updateEmail, updatePassword } from 'firebase/auth';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Every real read/write in the app now goes through the Postgres backend
// (see src/server/apiClient.js) - the only remaining callers of this module
// are unreachable/never-rendered legacy components left over from the
// migration (see DEPLOY_GUIDE.html for the full list). Firebase itself is
// initialized only when REACT_APP_FIREBASE_* is actually set, so a fresh
// deployment with no Firebase project configured doesn't crash on the mere
// import of one of those dead components - firebase.database() throws
// synchronously if databaseURL is missing, and that used to run for every
// page that pulled in one of them.
const isConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.databaseURL);

let database = null;
let auth = null;
let googleProvider = null;

if (isConfigured) {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  database = firebase.database();
  const App = initializeApp(firebaseConfig);
  auth = getAuth(App);
  googleProvider = new GoogleAuthProvider();
}

// Utility Functions for Auth
const updateUserEmail = async (user, newEmail) => {
  if (!auth) throw new Error('Firebase is not configured (REACT_APP_FIREBASE_* env vars unset)');
  await updateEmail(user, newEmail);
};

const updateUserPassword = async (user, newPassword) => {
  if (!auth) throw new Error('Firebase is not configured (REACT_APP_FIREBASE_* env vars unset)');
  await updatePassword(user, newPassword);
};

export { database, auth, googleProvider, updateUserEmail, updateUserPassword };
