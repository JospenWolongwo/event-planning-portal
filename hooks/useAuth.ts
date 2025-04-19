'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createBrowserClient } from '@supabase/ssr'

// Create a single Supabase client
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Define types
interface AuthState {
  user: any
  session: any
  signInWithOtp: (phoneNumber: string) => Promise<{ error: string | null; data: any }>
  verifyOtp: (phoneNumber: string, otp: string) => Promise<{ error: string | null; data: any }>
  signOut: () => Promise<void>
  getSession: () => Promise<void>
}

type AuthResult = Promise<{ error: string | null; data: any }>;

// Create auth store
export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,

      // Sign in with OTP
      signInWithOtp: async (phoneNumber: string): AuthResult => {
        try {
          console.log('Requesting OTP for:', phoneNumber)
          
          // Format phone number if needed
          let formattedPhone = phoneNumber;
          if (!phoneNumber.startsWith('+')) {
            formattedPhone = `+${phoneNumber}`;
          }

          const { data, error } = await supabase.auth.signInWithOtp({
            phone: formattedPhone,
            options: {
              shouldCreateUser: true
            }
          })

          if (error) throw error

          console.log('OTP sent successfully to:', formattedPhone)
          
          return { error: null, data }
        } catch (error: any) {
          console.error('OTP request error:', error)
          return { error: error.message, data: null }
        }
      },

      // Verify OTP code
      verifyOtp: async (phoneNumber: string, otp: string): AuthResult => {
        try {
          console.log('Verifying OTP for:', phoneNumber)

          // Format phone number if needed
          let formattedPhone = phoneNumber;
          if (!phoneNumber.startsWith('+')) {
            formattedPhone = `+${phoneNumber}`;
          }
          
          const { data, error } = await supabase.auth.verifyOtp({
            phone: formattedPhone,
            token: otp,
            type: 'sms'
          })

          if (error) throw error

          console.log('OTP verification successful, user:', data.user?.id)
          set({ user: data.user, session: data.session })
          
          // Store auth data for persistence
          if (typeof window !== 'undefined') {
            // Find and extend the Supabase auth token
            const supabaseItemKeys = Object.keys(localStorage).filter(key => 
              key.startsWith('sb-') && key.includes('-auth-token')
            );
            
            if (supabaseItemKeys.length > 0) {
              const primaryKey = supabaseItemKeys[0];
              const authData = localStorage.getItem(primaryKey);
              
              if (authData) {
                console.log('Found auth token, ensuring persistence');
                localStorage.setItem('event-portal-auth-backup', authData);
              }
            }
          }
          
          return { error: null, data }
        } catch (error: any) {
          console.error('OTP verification error:', error)
          return { error: error.message, data: null }
        }
      },

      // Sign out
      signOut: async () => {        
        await supabase.auth.signOut();
        set({ user: null, session: null });
      },

      // Get current session
      getSession: async () => {
        try {
          // Try to recover session from backup if needed
          let recovered = false;
          if (typeof window !== 'undefined') {
            const backupAuth = localStorage.getItem('event-portal-auth-backup');
            
            if (backupAuth) {
              // Find the Supabase auth token key
              const supabaseItemKeys = Object.keys(localStorage).filter(key => 
                key.startsWith('sb-') && key.includes('-auth-token')
              );
              
              if (supabaseItemKeys.length === 0) {
                // The token is missing, try to restore it
                const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
                if (supabaseUrl) {
                  // Extract project reference from URL
                  const projectRef = supabaseUrl.split('//')[1]?.split('.')[0];
                  if (projectRef) {
                    const tokenKey = `sb-${projectRef}-auth-token`;
                    localStorage.setItem(tokenKey, backupAuth);
                    console.log('Auth session restored from backup');
                    recovered = true;
                  }
                }
              }
            }
          }
          
          // Get the current session from Supabase
          const { data } = await supabase.auth.getSession();
          
          if (data?.session?.user) {
            set({ user: data.session.user, session: data.session });
            console.log('Session loaded for:', data.session.user.email);
            
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('auth-state-changed', { 
                detail: { user: data.session.user, session: data.session }
              }));
              
              // If we have a session, ensure we back it up
              const supabaseItemKeys = Object.keys(localStorage).filter(key => 
                key.startsWith('sb-') && key.includes('-auth-token')
              );
              
              if (supabaseItemKeys.length > 0) {
                const primaryKey = supabaseItemKeys[0];
                const authData = localStorage.getItem(primaryKey);
                if (authData) {
                  localStorage.setItem('event-portal-auth-backup', authData);
                }
              }
            }
          } else if (recovered) {
            // If we recovered the session but still don't have data,
            // force a page reload to reinitialize auth
            if (typeof window !== 'undefined') {
              window.location.reload();
            }
          } else {
            console.log('No session found');
            set({ user: null, session: null });
          }
        } catch (error) {
          console.error('Session error:', error);
          set({ user: null, session: null });
        }
      }
    }),
    {
      name: 'auth-storage',
      skipHydration: true,
    }
  )
);

// Initialize auth state on client-side only
if (typeof window !== 'undefined') {
  setTimeout(() => {
    useAuth.getState().getSession();
  }, 0);
  
  // Listen for auth state changes
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session?.user?.id || null);
    
    if (session?.user) {
      // User signed in
      useAuth.setState({ user: session.user, session: session });
      
      window.dispatchEvent(new CustomEvent('auth-state-changed', { 
        detail: { user: session.user, session: session }
      }));
    } else {
      // User signed out
      useAuth.setState({ user: null, session: null });
      
      window.dispatchEvent(new CustomEvent('auth-state-changed', { 
        detail: { user: null, session: null }
      }));
    }
  });
}
