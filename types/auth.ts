export type UserRole = "user" | "premium" | "admin";

export type SubscriptionPlan = "free" | "pro" | "business";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  role: UserRole;
  subscriptionPlan: SubscriptionPlan;
  subscriptionStatus: "active" | "inactive" | "cancelled";
  subscriptionEndDate: string | null;
  aiCreditsUsed: number;
  aiCreditsLimit: number;
  storageUsed: number;
  storageLimit: number;
  createdAt: string;
  updatedAt: string;
  emailVerified: boolean;
  lastLoginAt: string;
}

export interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (displayName: string, photoURL?: string) => Promise<void>;
  isAdmin: () => boolean;
  isPremium: () => boolean;
}
