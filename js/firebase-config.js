// ================================================
// Firebase Configuration Module
// ================================================

let firebaseApp = null;
let firebaseDb = null;
let firestoreInitialized = false;

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
    
    // Enable offline persistence (if not already done)
    // Note: In compat SDK, use enablePersistence with indexedDbPersistence
    if (!firestoreInitialized && firebaseDb.enablePersistence) {
      firebaseDb.enablePersistence({ synchronize: true })
        .then(() => {
          console.log('Firestore persistence enabled');
        })
        .catch(err => {
          if (err.code === 'failed-precondition') {
            console.log('Persistence failed: multiple tabs open');
          } else if (err.code === 'unimplemented') {
            console.log('Persistence not available in this browser');
          }
        });
      firestoreInitialized = true;
    }
    
    return true;
  } catch (e) {
    console.error("Firebase initialization error:", e);
    return false;
  }
}

async function ensureNetwork() {
  if (!firebaseDb) {
    const config = loadFirebaseConfig();
    if (config && config.projectId) {
      initializeFirebase(config);
    }
  }
  
  if (firebaseDb) {
    try {
      await firebaseDb.enableNetwork();
      return true;
    } catch (e) {
      console.error('Failed to enable network:', e);
      return false;
    }
  }
  return false;
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

function isOnline() {
  return navigator.onLine;
}