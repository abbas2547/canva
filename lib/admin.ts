/**
 * ADMIN CONFIGURATION
 * Only the email defined here has access to the Admin Control Center.
 */
export const ADMIN_CONFIG = {
  email: "abbaszaidi028@gmail.com",
  // This is a secondary check for UI elements if needed
  role: "SUPER_ADMIN"
};

/**
 * Direct Export for Dashboard/Build Stability
 * This fixes the "Export ADMIN_EMAIL doesn't exist" error.
 */
export const ADMIN_EMAIL = ADMIN_CONFIG.email;

/**
 * Security Check: 
 * Returns true only if the provided email matches your admin email.
 */
export const checkAdminAccess = (userEmail: string | null | undefined): boolean => {
  if (!userEmail) return false;
  return userEmail.toLowerCase() === ADMIN_CONFIG.email.toLowerCase();
};

/**
 * Authorization Guard:
 * Use this to wrap sensitive actions or to verify the user
 * before showing admin-only buttons.
 */
export const isAuthorizedAdmin = (user: any): boolean => {
  return !!user && checkAdminAccess(user.email);
};