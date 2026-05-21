import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { UserProfile } from '../types';

// We wrap in try-catch because the config file might not exist yet
let auth: any;
let db: any;
let googleProvider: any;

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isFirebaseReady: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAILS = ['mustaphaelibrahimi6@gmail.com'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);

  const checkAdminStatus = (email: string | null) => {
    return email ? ADMIN_EMAILS.includes(email) : false;
  };

  useEffect(() => {
    const initFirebase = async () => {
      try {
        const { getFirebase } = await import('../lib/firebase');
        const instances = await getFirebase();
        
        if (!instances.auth || !instances.db) {
          setLoading(false);
          return;
        }

        auth = instances.auth;
        db = instances.db;
        googleProvider = new GoogleAuthProvider();
        setIsFirebaseReady(true);

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          try {
            setUser(firebaseUser);
            if (firebaseUser) {
              const docRef = doc(db, 'profiles', firebaseUser.uid);
              const docSnap = await getDoc(docRef);
              const isDefaultAdmin = checkAdminStatus(firebaseUser.email);
              
              if (docSnap.exists()) {
                const data = docSnap.data() as UserProfile;
                // Auto-upgrade to admin if email matches
                if (isDefaultAdmin && data.role !== 'admin') {
                  const updatedProfile = { ...data, role: 'admin' as const };
                  await setDoc(docRef, updatedProfile);
                  setProfile(updatedProfile);
                } else {
                  setProfile(data);
                }
              } else {
                // Create new profile
                const newProfile: UserProfile = {
                  id: firebaseUser.uid,
                  email: firebaseUser.email || '',
                  username: firebaseUser.displayName || 'New User',
                  avatar_url: firebaseUser.photoURL || '',
                  role: isDefaultAdmin ? 'admin' : 'user',
                  created_at: new Date().toISOString()
                };
                await setDoc(docRef, newProfile);
                setProfile(newProfile);
              }
            } else {
              setProfile(null);
            }
          } catch (error) {
            console.error("Auth state update error:", error);
          } finally {
            setLoading(false);
          }
        });

        return unsubscribe;
      } catch (err) {
        console.log("Firebase not yet configured.");
        setLoading(false);
      }
    };

    initFirebase();
  }, []);

  const signInWithGoogle = async () => {
    if (!auth || !googleProvider) {
      console.error("Firebase Auth not initialized");
      return;
    }
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Login failed:", error);
      
      const errorMessage = error.message || "";
      
      if (error.code === 'auth/unauthorized-domain') {
        const currentDomain = window.location.hostname;
        alert(`domain authorization error!

To fix this:
1. Go to your Firebase Console (https://console.firebase.google.com/)
2. Open your project: "nexusarena-c0d15"
3. Go to "Authentication" -> "Settings" -> "Authorized Domains"
4. Add this domain to your authorized list: 
   ${currentDomain}

Once added, refresh this page and try logging in again!`);
      } else if (error.code === 'auth/popup-blocked') {
        alert("The sign-in popup was blocked. Please allow popups for this site or open the app in a new tab to sign in.");
      } else if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/user-cancelled') {
        // Safe check for iframe presence
        let isInIframe = false;
        try {
          isInIframe = window.self !== window.top;
        } catch (e) {
          isInIframe = true;
        }

        if (isInIframe) {
          alert("Sign-in popup closed. Browser privacy policies block authentication within preview screens. Please click 'Open in New Tab' (top-right of your preview) to sign in safely!");
        } else {
          console.log("Sign-in cancelled by user.");
        }
      } else if (error.code === 'auth/cancelled-popup-request') {
        console.log("Multiple popup requests detected. Previous one cancelled.");
      } else if (errorMessage.includes("iframe")) {
        alert("Sign-in issues detected in this preview. Please try opening the app in a new tab using the button in the top right.");
      } else {
        alert(`Login encounterd an issue: ${error.code || 'Unknown error'}. Try opening the app in a new tab.`);
      }
    }
  };

  const logout = async () => {
    if (!auth) return;
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signInWithGoogle, logout, isFirebaseReady }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
