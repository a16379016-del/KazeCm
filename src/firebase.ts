import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyAzDFXKeTp04NS7r1-9P4gFaHat3-8PjF0",
  authDomain: "commision-a833b.firebaseapp.com",
  projectId: "commision-a833b",
  storageBucket: "commision-a833b.firebasestorage.app",
  messagingSenderId: "981686625917",
  appId: "1:981686625917:web:e390a738518a3df8e5f314",
  measurementId: "G-BY01E4GLHB"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Analytics 只有在瀏覽器環境下才能初始化
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export { signInWithPopup, signOut, onAuthStateChanged };
