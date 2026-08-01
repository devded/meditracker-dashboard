import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDummyKeyForDevMeditracker2026",
  authDomain: "meditracker-dev-cfaed.firebaseapp.com",
  projectId: "meditracker-dev-cfaed",
  storageBucket: "meditracker-dev-cfaed.appspot.com",
  messagingSenderId: "115081726870297065049",
  appId: "1:115081726870297065049:web:meditracker2026",
};

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Cloud Firestore Instance
export const db = getFirestore(app);
