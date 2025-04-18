/**
 * Admin bypass utility for testing
 * This provides a simple way to bypass authentication for admin testing
 */

// Admin test user data
export const ADMIN_TEST_USER = {
  id: '46938272-ddaf-4160-b27d-cd2e34e47ff3', // Use the actual test user ID
  email: 'test@eventportal.com',
  role: 'admin',
  app_metadata: { role: 'admin' },
  user_metadata: { full_name: 'Test User' },
  aud: 'authenticated',
  created_at: new Date().toISOString()
};

// Enable admin bypass
export function enableAdminBypass(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('admin-bypass-user', JSON.stringify(ADMIN_TEST_USER));
  localStorage.setItem('admin-bypass-active', 'true');
  
  // Set expiration (24 hours)
  const expires = Date.now() + 24 * 60 * 60 * 1000;
  localStorage.setItem('admin-bypass-expires', expires.toString());
}

// Check if admin bypass is active
export function isAdminBypassActive(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check for our specific test user
  try {
    const authData = JSON.parse(localStorage.getItem('supabase.auth.token') || '{}');
    if (authData?.currentSession?.user) {
      const user = authData.currentSession.user;
      if (
        user.email === 'test@eventportal.com' ||
        user.id === '46938272-ddaf-4160-b27d-cd2e34e47ff3'
      ) {
        return true;
      }
    }
  } catch (e) {
    console.error('Error checking for test user:', e);
  }
  
  const active = localStorage.getItem('admin-bypass-active') === 'true';
  const expiresStr = localStorage.getItem('admin-bypass-expires');
  
  if (!active || !expiresStr) return false;
  
  // Check if expired
  const expires = parseInt(expiresStr, 10);
  if (Date.now() > expires) {
    // Clear expired bypass
    disableAdminBypass();
    return false;
  }
  
  return true;
}

// Get admin test user
export function getAdminTestUser(): any {
  if (!isAdminBypassActive() || typeof window === 'undefined') return null;
  
  const userJson = localStorage.getItem('admin-bypass-user');
  if (!userJson) return null;
  
  try {
    return JSON.parse(userJson);
  } catch (e) {
    console.error('Error parsing admin test user:', e);
    return null;
  }
}

// Disable admin bypass
export function disableAdminBypass(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('admin-bypass-user');
  localStorage.removeItem('admin-bypass-active');
  localStorage.removeItem('admin-bypass-expires');
}
