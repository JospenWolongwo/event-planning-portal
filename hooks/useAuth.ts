'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createBrowserClient } from '@supabase/ssr'
import { isAdmin } from '@/lib/utils/admin'
import { TEST_CREDENTIALS, createTestSession, isTestAdmin } from '@/lib/test-auth'
import { getRedirectUrl } from '@/lib/auth.config'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface AuthState {
  user: any
  session: any
  signInWithEmail: (email: string) => Promise<{ error: string | null }>
  signInWithCredentials: (email: string, password: string) => Promise<{ error: string | null; data: any }>
  testSignIn: (role: 'admin' | 'user') => Promise<void>
  signOut: () => Promise<void>
  getSession: () => Promise<void>
}

// Define the return type for signInWithCredentials
type SignInResult = Promise<{ error: string | null; data: any }>;

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,

      signInWithEmail: async (email: string) => {
        try {
          // Using the exact implementation from Supabase docs
          // Following https://supabase.com/docs/guides/auth/auth-helpers/nextjs
          const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback`
            }
          })

          if (error) throw error
          console.log('Magic link sent successfully')
          return { error: null }
        } catch (error: any) {
          console.error('Email sign in error:', error)
          return { error: error.message }
        }
      },

      signInWithCredentials: async (email: string, password: string): SignInResult => {
        try {
          console.log('Signing in with credentials:', email)
          
          // Check for test credentials
          if (email === TEST_CREDENTIALS.ADMIN.email && password === TEST_CREDENTIALS.ADMIN.password) {
            await get().testSignIn('admin');
            return { error: null, data: { user: TEST_CREDENTIALS.ADMIN } };
          }
          
          if (email === TEST_CREDENTIALS.USER.email && password === TEST_CREDENTIALS.USER.password) {
            await get().testSignIn('user');
            return { error: null, data: { user: TEST_CREDENTIALS.USER } };
          }
          
          // Regular authentication
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (error) throw error

          console.log('Credential login successful:', data)
          set({ user: data.user, session: data.session })
          return { error: null, data }
        } catch (error: any) {
          console.error('Credential login error:', error)
          return { error: error.message, data: null }
        }
      },

      testSignIn: async (role: 'admin' | 'user') => {
        try {
          // Create a test session with the appropriate role
          const testSession = createTestSession(role);
          
          // Set the user and session in the store
          set({ 
            user: testSession.user,
            session: testSession
          });
          
          // Store in localStorage for persistence
          localStorage.setItem('test-session', JSON.stringify(testSession));
          
          console.log(`Test sign-in successful as ${role}`);
          
          // Mock the Supabase auth state change
          window.dispatchEvent(new CustomEvent('supabase.auth.event', { 
            detail: { 
              event: 'SIGNED_IN', 
              session: testSession 
            } 
          }));
          
          // Directly redirect based on role
          if (role === 'admin') {
            window.location.href = '/admin/dashboard';
          } else {
            window.location.href = '/';
          }
          
          return Promise.resolve();
        } catch (error) {
          console.error('Test sign-in error:', error);
          return Promise.reject(error);
        }
      },

      signOut: async () => {
        // Clear test session if exists
        localStorage.removeItem('test-session');
        
        // Also sign out from Supabase
        await supabase.auth.signOut();
        
        // Reset user state
        set({ user: null, session: null });
      },

      getSession: async () => {
        try {
          // First check for a test session
          const testSessionJson = localStorage.getItem('test-session');
          if (testSessionJson) {
            try {
              const testSession = JSON.parse(testSessionJson);
              set({ user: testSession.user, session: testSession });
              console.log('Loaded test session:', testSession.user?.email);
              return;
            } catch (e) {
              console.error('Error parsing test session:', e);
              localStorage.removeItem('test-session');
            }
          }
          
          // Otherwise check for a real session
          const { data } = await supabase.auth.getSession();
          if (data?.session?.user) {
            set({ user: data.session.user, session: data.session });
            console.log('Loaded Supabase session:', data.session.user.email);
            
            // Dispatch event to notify other components
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('auth-state-changed', { 
                detail: { user: data.session.user, session: data.session }
              }));
            }
          } else {
            console.log('No session found');
          }
        } catch (error) {
          console.error('Error getting session:', error);
        }
      }
    }),
    {
      name: 'auth-storage',
      skipHydration: true,
    }
  )
);

// Initialize session on app load
if (typeof window !== 'undefined') {
  setTimeout(() => {
    useAuth.getState().getSession();
  }, 0);
  
  // Set up auth state change listener with improved synchronization
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session);
    if (session?.user) {
      useAuth.setState({ user: session.user, session: session });
      
      // Dispatch a custom event to ensure all components are updated
      window.dispatchEvent(new CustomEvent('auth-state-changed', { 
        detail: { user: session.user, session: session }
      }));
      
      // Redirect admin users to dashboard
      if (isAdmin(session.user)) {
        // Use a small delay to ensure the state is updated
        setTimeout(() => {
          if (window.location.pathname === '/auth') {
            window.location.href = '/admin/dashboard';
          }
        }, 500);
      }
    } else {
      // Don't clear test users on auth state change
      const testSessionJson = localStorage.getItem('test-session');
      if (!testSessionJson) {
        useAuth.setState({ user: null, session: null });
        // Also dispatch event for logout
        window.dispatchEvent(new CustomEvent('auth-state-changed', { 
          detail: { user: null, session: null }
        }));
      }
    }
  });
  
  // Listen for custom auth events
  window.addEventListener('supabase.auth.event', (e: any) => {
    if (e.detail?.event === 'SIGNED_IN' && e.detail?.session) {
      const session = e.detail.session;
      useAuth.setState({ user: session.user, session: session });
      
      // Also dispatch our custom event
      window.dispatchEvent(new CustomEvent('auth-state-changed', { 
        detail: { user: session.user, session: session }
      }));
    }
  });
}
