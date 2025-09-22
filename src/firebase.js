// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Configuração que o Firebase te deu
const firebaseConfig = {
  apiKey: "AIzaSyC8sKHlr3-VNqoYZteGqfEQj3rgzAPgFM",
  authDomain: "portasautomatizadasos.firebaseapp.com",
  projectId: "portasautomatizadasos",
  storageBucket: "portasautomatizadasos.appspot.com",
  messagingSenderId: "666745382773",
  appId: "1:666745382773:web:784b19a8d38d0856b5d53c"
};

// Inicializa o app
const app = initializeApp(firebaseConfig);

// Exporta o Firestore e Storage para usar no projeto
export const db = getFirestore(app);
export const storage = getStorage(app);
