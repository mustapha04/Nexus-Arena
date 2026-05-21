import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Injected by AI Studio after user setup
const loadConfig = async () => {
  try {
    // @ts-ignore
    const config = await import('../../firebase-applet-config.json');
    return config.default;
  } catch (e) {
    return null;
  }
};

let app: any;
let auth: any;
let db: any;

export const getFirebase = async () => {
  if (auth && db) return { auth, db };

  const config = await loadConfig();
  if (!config) return { auth: null, db: null };

  if (!app) {
    app = initializeApp(config);
    db = getFirestore(app, config.firestoreDatabaseId);
    auth = getAuth(app);
  }
  
  return { auth, db };
};

// Also export these for compatibility, though they might be null initially
export { auth, db };
