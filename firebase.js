// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from  "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC12gmgDFzcKwndKxh9AhqpECU_sdG0QOY",
  authDomain: "personalstrength-83af0.firebaseapp.com",
  projectId: "personalstrength-83af0",
  storageBucket: "personalstrength-83af0.appspot.com",
  messagingSenderId: "402774877493",
  appId: "1:402774877493:web:262d650143cf2cc70d187c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)
export default app