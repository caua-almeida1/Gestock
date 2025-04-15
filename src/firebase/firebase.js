// src/firebase/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, set, update, remove, get, push, onValue, serverTimestamp } from "firebase/database"; // Corrigido aqui
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage"; // Corrigido aqui

export const firebaseConfig = {
    apiKey: "AIzaSyCbeD3l12wKBe5X_prljuR1SQPpvOdBgnU",    
    authDomain: "gestocksenai-b18b5.firebaseapp.com",    
    projectId: "gestocksenai-b18b5",

    storageBucket: "gestock-2d49f.appspot.com",
    
    messagingSenderId: "960086486193",
    appId: "1:960086486193:web:040ba7fae09c309e7a8690",
    measurementId: "G-5PL040KPP1",
    databaseURL: "https://gestocksenai-b18b5-default-rtdb.firebaseio.com",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);

export { app, auth, database, storage, getDatabase, push, storageRef, uploadBytes, getDownloadURL, ref, set, update, remove, get, onValue, serverTimestamp };
export default app;


