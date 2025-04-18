/**
 * Utility functions for admin access control
 */

// List of admin emails
const ADMIN_EMAILS = [
  'jospenwolongwo@gmail.com',
  'admin@eventportal.com',
  'test@eventportal.com', // Test admin account for testers
  'support@eventportal.com'
];

/**
 * Check if a user is an admin based on their email
 * @param user The user object from Supabase auth
 * @returns boolean indicating if the user is an admin
 */
export function isAdmin(user: any): boolean {
  if (!user) return false;
  
  // Check by email (primary method)
  if (user.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) {
    return true;
  }
  
  // Fallback to check by user ID if needed
  // This allows admins to log in with magic links
  return false;
}

/**
 * Check if a user has organizer role
 * This can be extended in the future to check against a database role
 * @param user The user object from Supabase auth
 * @returns boolean indicating if the user is an organizer
 */
export function isOrganizer(user: any): boolean {
  // For now, all admins are also organizers
  // This can be extended to check against a database role
  return isAdmin(user);
}

/**
 * Get user role for display purposes
 * @param user The user object from Supabase auth
 * @returns string representing the user's highest role
 */
export function getUserRole(user: any): 'admin' | 'organizer' | 'user' {
  if (isAdmin(user)) return 'admin';
  if (isOrganizer(user)) return 'organizer';
  return 'user';
}
