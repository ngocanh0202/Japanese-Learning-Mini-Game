// ================================================
// Firebase Configuration Module
// ================================================

let firebaseApp = null;
let firebaseDb = null;
let firestoreInitialized = false;
const FIREBASE_SDK_URLS = [
  'https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore-compat.js'
];

function isFirebaseSdkLoaded() {
  return typeof firebase !== 'undefined' && firebase.initializeApp && firebase.firestore;
}

function loadFirebaseSdkScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if (existing.dataset.loaded === 'true') {
        resolve();
        return;
      }
      existing.addEventListener('load', resolve, { once: true });
      existing.addEventListener('error', reject, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.dataset.loaded = 'false';
    script.onload = () => {
      script.dataset.loaded = 'true';
      resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function ensureFirebaseSdkLoaded() {
  if (isFirebaseSdkLoaded()) return true;
  for (const src of FIREBASE_SDK_URLS) {
    await loadFirebaseSdkScript(src);
  }
  return isFirebaseSdkLoaded();
}

function initializeFirebase(config) {
  if (typeof isNAServerConfigured === 'function' && isNAServerConfigured()) {
    return false;
  }

  if (!isFirebaseSdkLoaded()) {
    return false;
  }

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
