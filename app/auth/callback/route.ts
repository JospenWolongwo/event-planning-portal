import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Force dynamic runtime
export const dynamic = 'force-dynamic'

// Auth callback handler for mobile and social auth - kept for compatibility
export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (!code) {
    // No code provided - redirect to auth page
    return NextResponse.redirect(`${requestUrl.origin}/auth?error=invalid_otp`)
  }

  try {
    // Create a Supabase client for the server with proper cookie handling
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Exchange the code for a session (must happen on the server)
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Auth exchange error:', error.message)
      throw error
    }
    
    // Make sure we have a session before redirecting
    if (data.session) {
      console.log('Successfully established session for user:', data.session.user.id)
      
      // Set a cookie to indicate authenticated state - helps with cookie parsing issues
      cookieStore.set('auth-state', 'authenticated', { 
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production'
      })
    }
    
    // Redirect back to the home page with successful login parameter
    return NextResponse.redirect(`${requestUrl.origin}/?login=success`)
  } catch (error: any) {
    console.error('Auth callback error:', error)
    
    // Handle any errors
    return NextResponse.redirect(
      `${requestUrl.origin}/auth?error=unknown&message=${encodeURIComponent(error.message)}`
    )
  }
}
