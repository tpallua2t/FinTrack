import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCRVlw-7v5cx7sU6WdS_n1lstt5zxyrYcg",
  authDomain: "fintrack-71f9c.firebaseapp.com",
  projectId: "fintrack-71f9c",
  storageBucket: "fintrack-71f9c.firebasestorage.app",
  messagingSenderId: "700140438317",
  appId: "1:700140438317:web:f15236bc95ad5a57edc9a4",
  measurementId: "G-CBTCNP6W9P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };