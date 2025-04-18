/**
 * Test authentication system for Event Portal
 * Provides a way to authenticate test users without email verification
 */

// Test credentials - these are hardcoded for testing purposes only
export const TEST_CREDENTIALS = {
  ADMIN: {
    email: 'test-admin@eventportal.com',
    password: 'test-admin-password',
    role: 'admin',
    id: '00000000-0000-4000-a000-000000000001', // Valid UUID format
    name: 'Test Admin User'
  },
  USER: {
    email: 'test-user@eventportal.com',
    password: 'test-user-password',
    role: 'user',
    id: '00000000-0000-4000-a000-000000000002', // Valid UUID format
    name: 'Test Regular User'
  }
};

// Create a test session that mimics a Supabase session
export function createTestSession(role: 'admin' | 'user') {
  const credentials = role === 'admin' ? TEST_CREDENTIALS.ADMIN : TEST_CREDENTIALS.USER;
  
  return {
    access_token: `test-token-${role}-${Date.now()}`,
    refresh_token: `test-refresh-token-${role}-${Date.now()}`,
    expires_in: 3600,
    expires_at: Date.now() + 3600000,
    user: {
      id: credentials.id,
      email: credentials.email,
      user_metadata: {
        full_name: credentials.name,
      },
      app_metadata: {
        role: credentials.role
      },
      role: credentials.role,
      aud: 'authenticated',
      created_at: new Date().toISOString()
    }
  };
}

// Check if a session is a test session
export function isTestSession(session: any): boolean {
  if (!session?.user) return false;
  
  const userId = session.user.id;
  return userId === TEST_CREDENTIALS.ADMIN.id || userId === TEST_CREDENTIALS.USER.id;
}

// Check if a user is a test admin
export function isTestAdmin(user: any): boolean {
  if (!user) return false;
  return user.id === TEST_CREDENTIALS.ADMIN.id || 
         user.email === TEST_CREDENTIALS.ADMIN.email ||
         (user.role === 'admin' && (user.id.startsWith('00000000-0000-4000')));
}
