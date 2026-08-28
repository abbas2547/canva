"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile as firebaseUpdateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
} from "firebase/auth";
import Cookies from "js-cookie";
import { auth } from "@/lib/firebaseClient";
import { checkAdminAccess } from "@/lib/admin";
import { deleteDoc, doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import {
  getEffectiveSubscription,
  type SubscriptionPlan,
} from "@/lib/subscription";

type UserRole = "user" | "premium" | "admin";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  subscriptionLoading: boolean;
  role: UserRole;
  subscriptionPlan: SubscriptionPlan;
  subscriptionDaysRemaining: number;
  subscriptionExpiresAt: Date | null;
  error: string | null;
  signUpWithEmail: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: {
    displayName?: string;
    photoURL?: string;
  }) => Promise<void>;
  isAdmin: () => boolean;
  isPremium: () => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function resolveAccess(firebaseUser: User): Promise<{ role: UserRole; plan: SubscriptionPlan; daysRemaining: number; expiresAt: Date | null }> {
  if (checkAdminAccess(firebaseUser.email)) return { role: "admin", plan: "business", daysRemaining: 0, expiresAt: null };

  try {
    const usersSnap = await getDoc(doc(db, "users", firebaseUser.uid));
    if (usersSnap.exists()) {
      const data = usersSnap.data();
      const access = getEffectiveSubscription(data);
      if (data.role === "admin") return { role: "admin", plan: access.effectivePlan, daysRemaining: access.daysRemaining, expiresAt: access.expiresAt };
      if (access.isActive) {
        return { role: "premium", plan: access.effectivePlan, daysRemaining: access.daysRemaining, expiresAt: access.expiresAt };
      }
      return { role: "user", plan: "free", daysRemaining: 0, expiresAt: access.expiresAt };
    }
  } catch {
    // Fall back to default role
  }

  return { role: "user", plan: "free", daysRemaining: 0, expiresAt: null };
}

async function syncAuthCookies(
  firebaseUser: User | null,
  role: UserRole
): Promise<void> {
  if (firebaseUser) {
    const token = await firebaseUser.getIdToken();
    Cookies.set("firebase-token", token, { expires: 7, sameSite: "lax" });
    Cookies.set("user-role", role, { expires: 7, sameSite: "lax" });
  } else {
    Cookies.remove("firebase-token");
    Cookies.remove("user-role");
  }
}

async function setActiveUser(firebaseUser: User): Promise<void> {
  await setDoc(doc(db, "activeUsers", firebaseUser.uid), {
    uid: firebaseUser.uid,
    email: firebaseUser.email || "",
    displayName: firebaseUser.displayName || "",
    photoURL: firebaseUser.photoURL || "",
    lastSeen: new Date().toISOString(),
  });
}

async function removeActiveUser(userId: string): Promise<void> {
  await deleteDoc(doc(db, "activeUsers", userId));
}

async function writeAuthEvent(
  firebaseUser: User,
  action: "LOGIN" | "LOGOUT"
): Promise<void> {
  await setDoc(doc(db, "authLogs", `${firebaseUser.uid}_${Date.now()}`), {
    uid: firebaseUser.uid,
    email: firebaseUser.email || "",
    displayName: firebaseUser.displayName || "",
    action,
    timestamp: new Date().toISOString(),
  });
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [role, setRole] = useState<UserRole>("user");
  const [subscriptionPlan, setSubscriptionPlan] = useState<SubscriptionPlan>("free");
  const [subscriptionDaysRemaining, setSubscriptionDaysRemaining] = useState(0);
  const [subscriptionExpiresAt, setSubscriptionExpiresAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const activeUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    auth.authStateReady().then(() => {
      if (!auth.currentUser) {
        Cookies.remove("firebase-token");
        Cookies.remove("user-role");
      }
    });

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setSubscriptionLoading(true);
      try {
        if (firebaseUser) {
          const access = await resolveAccess(firebaseUser);
          setRole(access.role);
          setSubscriptionPlan(access.plan);
          setSubscriptionDaysRemaining(access.daysRemaining);
          setSubscriptionExpiresAt(access.expiresAt);
          setUser(firebaseUser);
          void setActiveUser(firebaseUser).catch((presenceError) =>
            console.error("Active user sync error:", presenceError)
          );
          activeUserIdRef.current = firebaseUser.uid;
          if (sessionStorage.getItem("pending-login-event") === "1") {
            sessionStorage.removeItem("pending-login-event");
            void writeAuthEvent(firebaseUser, "LOGIN").catch((eventError) =>
              console.error("Login event sync error:", eventError)
            );
          }
          await syncAuthCookies(firebaseUser, access.role);
        } else {
          const activeUserId = activeUserIdRef.current;
          setUser(null);
          setRole("user");
          setSubscriptionPlan("free");
          setSubscriptionDaysRemaining(0);
          setSubscriptionExpiresAt(null);
          if (activeUserId) {
            void removeActiveUser(activeUserId).catch((presenceError) =>
              console.error("Active user removal error:", presenceError)
            );
          }
          await syncAuthCookies(null, "user");
          activeUserIdRef.current = null;
        }
      } catch (err) {
        console.error("Auth state sync error:", err);
        setUser(firebaseUser);
        setRole("user");
        setSubscriptionPlan("free");
        setSubscriptionDaysRemaining(0);
        setSubscriptionExpiresAt(null);
      } finally {
        setSubscriptionLoading(false);
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user?.uid) return;

    return onSnapshot(
      doc(db, "users", user.uid),
      (snapshot) => {
        const data = snapshot.data();
        const access = getEffectiveSubscription(data || {});
        setSubscriptionPlan(access.effectivePlan);
        setSubscriptionDaysRemaining(access.daysRemaining);
        setSubscriptionExpiresAt(access.expiresAt);
        if (!checkAdminAccess(user.email)) {
          setRole(access.isActive ? "premium" : "user");
        }
      },
      (error) => {
        console.error("Subscription sync error:", error);
      }
    );
  }, [user?.uid, user?.email]);

  useEffect(() => {
    if (!subscriptionExpiresAt) return;
    const refresh = () => {
      const access = getEffectiveSubscription({
        subscriptionPlan,
        subscriptionStatus: "active",
        subscriptionExpiresAt,
      });
      setSubscriptionDaysRemaining(access.daysRemaining);
      if (!access.isActive && subscriptionPlan !== "free") {
        setSubscriptionPlan("free");
        setRole("user");
      }
    };
    refresh();
    const timer = window.setInterval(refresh, 60_000);
    return () => window.clearInterval(timer);
  }, [subscriptionExpiresAt, subscriptionPlan]);

  useEffect(() => {
    if (!user?.uid) return;

    const refreshPresence = () => {
      void setActiveUser(user).catch((presenceError) =>
        console.error("Active user heartbeat error:", presenceError)
      );
    };

    const handlePageHide = () => {
      void removeActiveUser(user.uid).catch((presenceError) =>
        console.error("Active user page-hide cleanup error:", presenceError)
      );
    };

    refreshPresence();
    const heartbeat = window.setInterval(refreshPresence, 15_000);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.clearInterval(heartbeat);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [user]);

  const loginWithGoogle = useCallback(async () => {
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      void writeAuthEvent(result.user, "LOGIN").catch((eventError) =>
        console.error("Login event sync error:", eventError)
      );
    } catch (err: unknown) {
      const code =
        typeof err === "object" && err !== null && "code" in err
          ? String((err as { code?: unknown }).code)
          : "";
      if (code === "auth/popup-blocked" || code === "auth/popup-closed-by-user") {
        sessionStorage.setItem("pending-login-event", "1");
        await signInWithRedirect(auth, provider);
      } else {
        throw err;
      }
    }
  }, []);

  const loginWithEmail = useCallback(async (email: string, password: string) => {
    setError(null);
    const result = await signInWithEmailAndPassword(auth, normalizeEmail(email), password);
    void writeAuthEvent(result.user, "LOGIN").catch((eventError) =>
      console.error("Login event sync error:", eventError)
    );
  }, []);

  const signUpWithEmail = useCallback(
    async (email: string, password: string, displayName: string) => {
      setError(null);
      const normalizedEmail = normalizeEmail(email);
      const result = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
      await firebaseUpdateProfile(result.user, { displayName });
      await setDoc(doc(db, "users", result.user.uid), {
        uid: result.user.uid,
        email: normalizedEmail,
        displayName,
        role: "user",
        createdAt: new Date().toISOString(),
      });
      void writeAuthEvent(result.user, "LOGIN").catch((eventError) =>
        console.error("Login event sync error:", eventError)
      );
    },
    []
  );

  const logout = useCallback(async () => {
    setError(null);
    const currentUser = auth.currentUser;
    if (currentUser) {
      await writeAuthEvent(currentUser, "LOGOUT").catch((eventError) =>
        console.error("Logout event sync error:", eventError)
      );
      await removeActiveUser(currentUser.uid).catch((presenceError) =>
        console.error("Active user removal error:", presenceError)
      );
    }
    await signOut(auth);
    Cookies.remove("firebase-token");
    Cookies.remove("user-role");
    setUser(null);
    setRole("user");
    setSubscriptionPlan("free");
    setSubscriptionLoading(false);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    setError(null);
    await sendPasswordResetEmail(auth, normalizeEmail(email));
  }, []);

  const updateProfile = useCallback(
    async (data: { displayName?: string; photoURL?: string }) => {
      if (!auth.currentUser) throw new Error("Not authenticated");
      await firebaseUpdateProfile(auth.currentUser, data);
      if (auth.currentUser.uid) {
        await setDoc(
          doc(db, "users", auth.currentUser.uid),
          { ...data, updatedAt: new Date().toISOString() },
          { merge: true }
        );
      }
      setUser({ ...auth.currentUser });
    },
    []
  );

  const isAdmin = useCallback(() => role === "admin", [role]);
  const isPremium = useCallback(
    () => role === "premium" || role === "admin",
    [role]
  );

  const value = useMemo(
    () => ({
      user,
      loading,
      subscriptionLoading,
      role,
      subscriptionPlan,
      subscriptionDaysRemaining,
      subscriptionExpiresAt,
      error,
      signUpWithEmail,
      loginWithEmail,
      loginWithGoogle,
      logout,
      resetPassword,
      updateProfile,
      isAdmin,
      isPremium,
    }),
    [
      user,
      loading,
      subscriptionLoading,
      role,
      subscriptionPlan,
      subscriptionDaysRemaining,
      subscriptionExpiresAt,
      error,
      signUpWithEmail,
      loginWithEmail,
      loginWithGoogle,
      logout,
      resetPassword,
      updateProfile,
      isAdmin,
      isPremium,
    ]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
