// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from  "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCxbFC06jOjEKu6ASsUtlj9-2xcIeUIFRY",
  authDomain: "messenger-test-5c22f.firebaseapp.com",
  projectId: "messenger-test-5c22f",
  storageBucket: "messenger-test-5c22f.appspot.com",
  messagingSenderId: "954358099052",
  appId: "1:954358099052:web:493c34423aba316a6abc49",
  measurementId: "G-2WG3242RD5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)
export default app