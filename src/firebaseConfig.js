import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCNXTUji-5_KAABXXHyxCdjLFhXqQ5xjPU",
  authDomain: "ibook-20440.firebaseapp.com",
  projectId: "ibook-20440",
  storageBucket: "ibook-20440.firebasestorage.app",
  messagingSenderId: "970791488024",
  appId: "1:970791488024:web:72186ea599e4e2db41916d",
  measurementId: "G-63TVXXNL5X",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
