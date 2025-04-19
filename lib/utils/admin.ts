/**
 * Utility functions for admin access control
 */

// List of admin phone numbers (with country code)
const ADMIN_PHONES = [
  '+jospenwolongwo', // Replace with your actual admin phone number
  '+1234567890'      // Example test admin phone number
];

/**
 * Check if a user is an admin
 * In this simplified approach, all authenticated users are considered admin
 * @param user The user object from Supabase auth
 * @returns boolean indicating if the user is an admin
 */
export function isAdmin(user: any): boolean {
  // All authenticated users are considered admins
  return !!user;
  
  /* Previous phone-based admin check (keeping for reference if needed)
  if (!user) return false;
  
  // Check by phone number
  if (user.phone && ADMIN_PHONES.includes(user.phone)) {
    return true;
  }
  
  // Check if admin bypass is enabled in localStorage (for testing)
  if (typeof window !== 'undefined' && localStorage.getItem('adminBypass') === 'enabled') {
    return true;
  }
  
  return false;
  */
}

/**
 * Check if a user has organizer role
 * In this simplified approach, all authenticated users are considered organizers
 * @param user The user object from Supabase auth
 * @returns boolean indicating if the user is an organizer
 */
export function isOrganizer(user: any): boolean {
  // All authenticated users are also organizers
  return !!user;
}

/**
 * Get user role for display purposes
 * In this simplified approach, all authenticated users are considered admin
 * @param user The user object from Supabase auth
 * @returns string representing the user's highest role
 */
export function getUserRole(user: any): 'admin' | 'organizer' | 'user' {
  if (!user) return 'user';
  return 'admin'; // All authenticated users are admins
}
