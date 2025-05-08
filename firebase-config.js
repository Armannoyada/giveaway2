// Import the Firebase SDK
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

// Firebase configuration
// Replace these values with your own Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyCmfNVUXCx3o3Q5yp-mAL7k93bviLkK54g",
    authDomain: "stu-giveaway.firebaseapp.com",
    projectId: "stu-giveaway",
    storageBucket: "stu-giveaway.firebasestorage.app",
    messagingSenderId: "50460032508",
    appId: "1:50460032508:web:8df4dd05898b94bbff8679",
    measurementId: "G-JJ73TV4HDJ"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const db = firebase.firestore();
const auth = firebase.auth();

// Export the services
export { db, auth };