import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDvQ2SA88FFuT-hqTjZUPYQzLmc7t76goA",
  authDomain: "socialconnectapp-25923.firebaseapp.com",
  projectId: "socialconnectapp-25923",
  storageBucket: "socialconnectapp-25923.firebasestorage.app",
  messagingSenderId: "1031326568131",
  appId: "1:1031326568131:web:268c7c2f16e16aad659c76",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;