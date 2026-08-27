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

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const database = firebase.database();
const App = initializeApp(firebaseConfig);
const auth = getAuth(App);
const googleProvider = new GoogleAuthProvider();

// Utility Functions for Auth
const updateUserEmail = async (user, newEmail) => {
  await updateEmail(user, newEmail);
};

const updateUserPassword = async (user, newPassword) => {
  await updatePassword(user, newPassword);
};

export { database, auth, googleProvider, updateUserEmail, updateUserPassword };
