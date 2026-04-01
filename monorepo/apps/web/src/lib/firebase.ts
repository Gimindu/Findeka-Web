// Utility module: firebase
// Purpose: Shared UI/business logic used across multiple pages.

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCTcYnf4bXYj4W5YPUnOVnk1K0tOC66tL4",
  authDomain: "findeka-9bac7.firebaseapp.com",
  projectId: "findeka-9bac7",
  storageBucket: "findeka-9bac7.firebasestorage.app",
  messagingSenderId: "1095762430068",
  appId: "1:1095762430068:web:133daedc4d61e899e92921",
  measurementId: "G-XKX9HNBQ6T"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Initialize Analytics conditionally (might fail in environments without window)
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export { app, auth, analytics };


