// Context module: AuthContext
// Purpose: App-wide state and auth/session handling.

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { getUserProfile } from "@/services/aiService";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<any>;
  googleLogin: () => Promise<any>;
  signup: (email: string, pass: string) => Promise<any>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const refreshAdminRole = async (uid: string) => {
    try {
      const profile = await getUserProfile(uid);
      setIsAdmin(profile?.role === "admin");
    } catch {
      // Keep previous value if transient API failures happen.
    }
  };

  // Expose these methods to easily sign in / out from pages
  const login = (email: string, pass: string) =>
    signInWithEmailAndPassword(auth, email, pass);
  const googleLogin = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };
  const signup = (email: string, pass: string) =>
    createUserWithEmailAndPassword(auth, email, pass);
  const logout = () => signOut(auth);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser: User | null) => {
        setUser(currentUser);
        if (!currentUser) {
          setIsAdmin(false);
        } else {
          await refreshAdminRole(currentUser.uid);
        }
        setLoading(false);
      },
    );
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) return;

    // Re-check admin role after auth is established and keep it in sync.
    refreshAdminRole(user.uid);
    const interval = setInterval(() => {
      refreshAdminRole(user.uid);
    }, 30000);

    return () => clearInterval(interval);
  }, [user?.uid]);

  const value = {
    user,
    loading,
    isAdmin,
    login,
    googleLogin,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}


