import { initializeApp, FirebaseError } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

declare global {
  interface Window {
    firebaseConfig: {
      apiKey: string;
      authDomain: string;
      projectId: string;
      storageBucket: string;
      messagingSenderId: string;
      appId: string;
    };
  }
}

// Initialize Firebase
let app;
let db: any;
let storage: any;

try {
  if (!window.firebaseConfig) {
    throw new Error('Firebase configuration not found');
  }

  app = initializeApp(window.firebaseConfig);
  db = getFirestore(app);
  storage = getStorage(app);
  
  // Enable offline persistence with error handling
  const enablePersistence = async () => {
    try {
      await enableIndexedDbPersistence(db);
      console.log('Firebase offline persistence enabled');
    } catch (err) {
      const error = err as FirebaseError;
      if (error.code === 'failed-precondition') {
        console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
      } else if (error.code === 'unimplemented') {
        console.warn('The current browser does not support all of the features required to enable persistence');
      } else {
        console.error('Error enabling offline persistence:', error);
      }
    }
  };
  
  // Only enable persistence in production or if explicitly enabled in dev
  if (import.meta.env.PROD) {
    enablePersistence();
  }
  
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error);
  
  // Fallback to a mock implementation in development
  if (import.meta.env.DEV) {
    console.warn('Using mock Firebase implementation');
    db = {
      collection: () => ({
        get: async () => ({
          docs: [],
          empty: true
        })
      })
    };
    storage = {
      ref: () => ({
        getDownloadURL: async () => ''
      })
    };
  } else {
    // In production, we want to know if Firebase fails to initialize
    console.error('Critical: Firebase initialization failed in production', error);
    // Consider showing a user-friendly error message
  }
}

export { db, storage };
export default app;
