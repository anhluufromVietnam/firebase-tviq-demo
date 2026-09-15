import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

function getFirebaseConfig() {
  return {
      apiKey: "AIzaSyBmKZ6qhV0XD5k5oCDwueNqUJBx0uwjxA8",
      authDomain: "suleco-demo.firebaseapp.com",
      databaseURL: "https://suleco-demo-default-rtdb.firebaseio.com",
      projectId: "suleco-demo",
      storageBucket: "suleco-demo.firebasestorage.app",
      messagingSenderId: "1020630124866",
      appId: "1:1020630124866:web:a8e1e2e83f682ea1a3a0db",
      measurementId: "G-KX2KS65G4G"
    };
}



const app = getApps().length > 0 ? getApp() : initializeApp(getFirebaseConfig());

export const auth = getAuth(app);
export const db = getDatabase(app);
