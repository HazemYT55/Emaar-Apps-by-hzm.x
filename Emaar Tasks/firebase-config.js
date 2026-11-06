import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCHYO_jIjpcOVI7N74zuQE0rqJ7OIb2834",
  authDomain: "emaar-tasks.firebaseapp.com",
  projectId: "emaar-tasks",
  storageBucket: "emaar-tasks.firebasestorage.app",
  messagingSenderId: "524586421142",
  appId: "1:524586421142:web:415d8f8bbdd387e85bebb7",
  measurementId: "G-2MH77FF7HM"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };