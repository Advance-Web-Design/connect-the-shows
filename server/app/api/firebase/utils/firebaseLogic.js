import { get, getDatabase, ref, push, set } from "firebase/database";
import { initializeApp, getApps } from "firebase/app";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

// Lazy initialization - only initialize when needed
let app;
let db;

function initializeFirebase() {
  if (!app && getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else if (!app) {
    app = getApps()[0];
  }
  if (!db) {
    db = getDatabase(app);
  }
  return db;
}

// Register a new user
export async function addUser(username, password, email) {
  const database = initializeFirebase(); // Initialize only when called
  
  console.log('Adding user:', username, email);

//     // Check if user already exists             
// const existingUsers = await db.collection('users').where('username', '==', username).get();
// if (!existingUsers.empty) {     
//     return Promise.reject(new Error('Username already exists'));
//     }      





const usersRef = ref(database, 'users');
  const newUserRef = push(usersRef);
  const userData = {
    username,
    password, // In production, hash the password!
    email,
    user_game_history: {} // Empty for now
  };



  await set(newUserRef, userData);

  return newUserRef.key; // Return the generated user ID
    
//   const userRecord = await auth.createUser({
//     email,
//     password,
//     displayName: username,
//   });
//   // Optionally store extra info in Firestore
//   await db.collection('users').doc(userRecord.uid).set({
//     username,
//     email,
//     createdAt: new Date(),
//   });
//   return userRecord.uid;


}

// Verify user credentials (basic example)
export async function verifyUser(username, password) {
  const database = initializeFirebase(); // Initialize only when called
  
  // Firebase Admin SDK does not support password verification directly.
  // You should use Firebase Auth REST API or custom logic.
  // For demo, just check if user exists by username.
  const users = await database.collection('users').where('username', '==', username).get();
  if (users.empty) throw new Error('User not found');
  // You cannot verify password here securely; use client-side Firebase Auth for login.
  return users.docs[0].id;
}

// Record a game session
export async function recordGameSession(sessionData) {
  const database = initializeFirebase(); // Initialize only when called
  
  const docRef = await database.collection('gameSessions').add({
    ...sessionData,
    createdAt: new Date(),
  });
  return docRef.id;
}