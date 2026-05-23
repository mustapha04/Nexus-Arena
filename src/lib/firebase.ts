import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

let app: any;
let auth: any;
let db: any;

const metaEnv = (import.meta as any).env;
if (metaEnv && metaEnv.VITE_FIREBASE_API_KEY) {
  try {
    const config = {
      apiKey: metaEnv.VITE_FIREBASE_API_KEY,
      authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: metaEnv.VITE_FIREBASE_PROJECT_ID,
      storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: metaEnv.VITE_FIREBASE_APP_ID,
      measurementId: metaEnv.VITE_FIREBASE_MEASUREMENT_ID,
      firestoreDatabaseId: metaEnv.VITE_FIREBASE_DATABASE_ID
    };
    app = initializeApp(config);
    if (config.firestoreDatabaseId && config.firestoreDatabaseId !== '(default)' && config.firestoreDatabaseId !== '') {
      db = getFirestore(app, config.firestoreDatabaseId);
    } else {
      db = getFirestore(app);
    }
    auth = getAuth(app);
    console.log("Firebase initialized synchronously from environment variables.");
  } catch (err) {
    console.error("Synchronous Firebase initialization failed:", err);
  }
}

// Injected by AI Studio after user setup
const loadConfig = async () => {
  // Check if client-side Vite environment variables exist (best practice for Vercel)
  if (metaEnv && metaEnv.VITE_FIREBASE_API_KEY) {
    return {
      apiKey: metaEnv.VITE_FIREBASE_API_KEY,
      authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: metaEnv.VITE_FIREBASE_PROJECT_ID,
      storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: metaEnv.VITE_FIREBASE_APP_ID,
      measurementId: metaEnv.VITE_FIREBASE_MEASUREMENT_ID,
      firestoreDatabaseId: metaEnv.VITE_FIREBASE_DATABASE_ID
    };
  }

  try {
    // @ts-ignore
    const config = await import('../../firebase-applet-config.json');
    return config.default;
  } catch (e) {
    return null;
  }
};

export const getFirebase = async () => {
  if (auth && db) return { auth, db };

  const config: any = await loadConfig();
  if (!config) return { auth: null, db: null };

  if (!app) {
    app = initializeApp(config);
    if (config.firestoreDatabaseId && config.firestoreDatabaseId !== '(default)' && config.firestoreDatabaseId !== '') {
      db = getFirestore(app, config.firestoreDatabaseId);
    } else {
      db = getFirestore(app);
    }
    auth = getAuth(app);
  }
  
  return { auth, db };
};

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo: auth?.currentUser?.providerData?.map((provider: any) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Also export these for compatibility, though they might be null initially
export { auth, db };
