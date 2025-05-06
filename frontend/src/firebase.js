import { initializeApp } from "firebase/app";
import { getAuth, OAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Add this import

const firebaseConfig = {
  apiKey: "AIzaSyANra3YxMTaxwYHd06r_WolpPFEVIFyoys",
  authDomain: "unisale-1556d.firebaseapp.com",
  projectId: "unisale-1556d",
  storageBucket: "unisale-1556d.appspot.com",
  messagingSenderId: "491590698627",
  appId: "1:491590698627:web:8c7c42e07178e3269dbdb6",
  measurementId: "G-NWG34L1PF5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); // Add this line to initialize and export Firestore

// Microsoft OAuth Provider
export const microsoftProvider = new OAuthProvider("microsoft.com");

// Force Microsoft to ask for email & password
microsoftProvider.setCustomParameters({
  prompt: "login",
});
