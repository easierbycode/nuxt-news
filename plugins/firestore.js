import firebase from 'firebase/app';
import 'firebase/firestore';

var firebaseConfig = {
    apiKey: "AIzaSyDShrAeyOZW-5V0fCmT2B_sTWnW-mysSqg",
    authDomain: "nuxt-reader.firebaseapp.com",
    projectId: "nuxt-reader",
    storageBucket: "nuxt-reader.appspot.com",
    messagingSenderId: "814502464553",
    appId: "1:814502464553:web:386e531f734e24f6912038",
    measurementId: "G-VWPF1ED89M"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  firebase.firestore().settings({
      timestampsInSnapshots: true
  });

  const db = firebase.firestore();

  export default db;