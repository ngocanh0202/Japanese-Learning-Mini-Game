// ================================================
// Firebase Configuration Module
// ================================================

let firebaseApp = null;
let firebaseDb = null;

function initializeFirebase(config) {
  if (!config || !config.projectId) {
    return false;
  }

  try {
    // Check if app already exists
    if (!firebase.apps.length) {
      const firebaseConfig = {
        apiKey: config.apiKey || '',
        authDomain: config.authDomain || `${config.projectId}.firebaseapp.com`,
        projectId: config.projectId,
        storageBucket: config.storageBucket || '',
        messagingSenderId: config.messagingSenderId || '',
        appId: config.appId || '',
        measurementId: config.measurementId || ''
      };
      firebaseApp = firebase.initializeApp(firebaseConfig);
    } else {
      firebaseApp = firebase.app();
    }
    
    // Initialize Firestore
    firebaseDb = firebase.firestore();
    return true;
  } catch (e) {
    console.error("Firebase initialization error:", e);
    return false;
  }
}

function getFirestore() {
  if (!firebaseDb) {
    const config = loadFirebaseConfig();
    if (config && config.projectId) {
      initializeFirebase(config);
    }
  }
  return firebaseDb;
}

function getFirestoreCollection(collectionName) {
  const db = getFirestore();
  if (!db) return null;
  return db.collection(collectionName);
}