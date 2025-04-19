import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  try {
    // Create a fresh response - important for proper cookie handling
    const res = NextResponse.next()
    
    // Create the Supabase middleware client with the request and response
    const supabase = createMiddlewareClient({ req, res })
    
    // Get the session and refresh it
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Middleware auth error:', error)
    }
    
    const session = data.session
    
    // No longer protecting any routes - all auth users can access all routes
    // Only handling the auth redirect case now
    
    // If the user is signed in and the current path is /auth,
    // redirect the user to the intended destination or home
    if (session && req.nextUrl.pathname.startsWith('/auth')) {
      const redirectTo = req.nextUrl.searchParams.get('redirectTo') || '/'
      return NextResponse.redirect(new URL(redirectTo, req.url))
    }
    
    // Just pass through for all other requests
    return res
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.next()
  }
}

// Ensure the middleware is only called for relevant paths
export const config = {
  matcher: [
    '/profile/:path*',
    '/bookings/:path*',
    '/admin/:path*',
    '/settings/:path*',
    '/auth/:path*'
  ]
}
