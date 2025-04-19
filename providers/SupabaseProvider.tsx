'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Session } from '@supabase/supabase-js'

type SupabaseContextType = {
  supabase: SupabaseClient
  session: Session | null
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

export const SupabaseProvider = ({ children }: { children: React.ReactNode }) => {
  const [supabase] = useState(() => {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  })

  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initSession = async () => {
      setLoading(true)
      try {
        // Check URL parameters for auth success signal
        const searchParams = new URLSearchParams(window.location.search)
        const isAuthCallback = searchParams.has('auth') || searchParams.has('ts') || searchParams.has('refresh')

        // Get session from Supabase
        const { data: { session: supabaseSession } } = await supabase.auth.getSession()
        if (supabaseSession) {
          console.log('Found Supabase session for:', supabaseSession.user.email)
          setSession(supabaseSession)
          
          // If coming from auth callback, dispatch global event for UI components
          if (isAuthCallback) {
            window.dispatchEvent(new CustomEvent('auth-state-changed', {
              detail: { user: supabaseSession.user, session: supabaseSession }
            }))
            
            // Clean up URL parameters
            const url = new URL(window.location.href)
            url.searchParams.delete('auth')
            url.searchParams.delete('ts')
            window.history.replaceState({}, '', url)
          }
        } else {
          console.log('No Supabase session found')
        }
      } catch (error) {
        console.error('Error getting session:', error)
      } finally {
        setLoading(false)
      }
    }

    // Initialize on first load
    if (typeof window !== 'undefined') {
      initSession()
    }

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log('Auth state changed:', event, newSession?.user?.email || null)
      setSession(newSession)
      
      // Broadcast auth state change
      if (event === 'SIGNED_IN' && newSession) {
        window.dispatchEvent(new CustomEvent('auth-state-changed', {
          detail: { user: newSession.user, session: newSession }
        }))
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  return (
    <SupabaseContext.Provider value={{ supabase, session }}>
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
