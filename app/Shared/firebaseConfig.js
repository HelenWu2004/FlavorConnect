// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD8rpGDRswCFqTd3diS7UTrwd_Ug3yQuhw",
  authDomain: "fengqin-zhou.firebaseapp.com",
  projectId: "fengqin-zhou",
  storageBucket: "fengqin-zhou.firebasestorage.app",
  messagingSenderId: "919782811378",
  appId: "1:919782811378:web:10f2ae75fe08d33c1c926b",
  measurementId: "G-57LT4DV5ZW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

 
export default app;