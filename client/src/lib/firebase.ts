import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB4xsX5GivEFmtd2b2uGUSSewnN0G7HgRI",
  authDomain: "mars-token-shopper.firebaseapp.com",
  projectId: "mars-token-shopper",
  storageBucket: "mars-token-shopper.firebasestorage.app",
  messagingSenderId: "301057805858",
  appId: "1:301057805858:web:710b657e624f4b458d847b",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
