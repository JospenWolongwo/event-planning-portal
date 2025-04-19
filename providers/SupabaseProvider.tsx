'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Session } from '@supabase/supabase-js'

type SupabaseContextType = {
  supabase: SupabaseClient
  session: Session | null
  user: any
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

export const SupabaseProvider = ({ children }: { children: React.ReactNode }) => {
  const [supabase] = useState(() => 
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  )

  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initSession = async () => {
      setLoading(true)
      try {
        // Check URL parameters for auth success signal
        const searchParams = new URLSearchParams(window.location.search)
        const isAuthCallback = searchParams.has('auth') || 
                             searchParams.has('code') || 
                             searchParams.has('refresh') || 
                             searchParams.has('login')

        // Get session from Supabase
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session in SupabaseProvider:', error)
        } else if (data.session) {
          console.log('Found Supabase session for user ID:', data.session.user.id)
          setSession(data.session)
          setUser(data.session.user)
          
          // Store a simple flag for auth status
          try {
            localStorage.setItem('event-portal-auth', 'true')
          } catch (e) {
            console.warn('Could not save to localStorage:', e)
          }
          
          // If coming from auth callback, dispatch global event
          if (isAuthCallback) {
            window.dispatchEvent(new CustomEvent('auth-state-changed', {
              detail: { user: data.session.user, session: data.session }
            }))
            
            // Clean up URL parameters
            try {
              const url = new URL(window.location.href)
              url.searchParams.delete('auth')
              url.searchParams.delete('code')
              url.searchParams.delete('ts')
              url.searchParams.delete('login')
              window.history.replaceState({}, '', url)
            } catch (e) {
              console.error('Error cleaning URL:', e)
            }
          }
        } else {
          console.log('No Supabase session found')
          setSession(null)
          setUser(null)
        }
      } catch (error) {
        console.error('Error initializing auth session:', error)
      } finally {
        setLoading(false)
      }
    }

    // Initialize on first load
    if (typeof window !== 'undefined') {
      initSession()
    }

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('Auth state changed in SupabaseProvider:', event, newSession?.user?.id || null)
        
        if (newSession) {
          setSession(newSession)
          setUser(newSession.user)
          
          // Broadcast authenticated state
          window.dispatchEvent(new CustomEvent('auth-state-changed', {
            detail: { user: newSession.user, session: newSession }
          }))
        } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
          setSession(null)
          setUser(null)
          
          // Broadcast signed out state
          window.dispatchEvent(new CustomEvent('auth-state-changed', {
            detail: { user: null, session: null }
          }))
          
          // Clean up local storage
          try {
            localStorage.removeItem('event-portal-auth')
          } catch (e) {
            console.warn('Could not access localStorage:', e)
          }
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  return (
    <SupabaseContext.Provider value={{ supabase, session, user }}>
      {children}
    </SupabaseContext.Provider>
  )
}

export const useSupabase = () => {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
}
