'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

const SupabaseContext = createContext<any>(null)

export const SupabaseProvider = ({ children }: { children: React.ReactNode }) => {
  const [supabase] = useState(() => {
    // Force use of the browser's current URL in client components
    // This ensures we always use the correct origin for auth redirects
    const currentUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || currentUrl;
    
    if (typeof window !== 'undefined') {
      console.log('Current browser URL:', window.location.origin);
      console.log('Environment site URL:', process.env.NEXT_PUBLIC_SITE_URL);
      console.log('Final site URL being used:', siteUrl);
    }
    
    const client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          fetch: (url, options = {}) => {
            return fetch(url, {
              ...options,
              headers: {
                ...options.headers,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
            })
          }
        },
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          flowType: 'pkce'
        },
        cookieOptions: {
          path: '/',
          sameSite: 'lax',
          secure: true,
          domain: typeof window !== 'undefined' ? window.location.hostname : undefined
        }
      }
    )
    return client
  })

  const [user, setUser] = useState<any>(null)
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession()
        if (error) throw error
        
        if (initialSession?.user) {
          setSession(initialSession)
          setUser(initialSession.user)
        }
      } catch (error) {
        console.error('Error loading session:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  // Prevent hydration errors by only rendering children when mounted
  if (!mounted) {
    return null
  }

  return (
    <SupabaseContext.Provider value={{ supabase, user, session, loading }}>
      {children}
    </SupabaseContext.Provider>
  )
}

export const useSupabase = () => {
  const context = useContext(SupabaseContext)
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
}
