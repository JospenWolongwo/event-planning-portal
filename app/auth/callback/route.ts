import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Force dynamic runtime
export const dynamic = 'force-dynamic'

// Simple auth callback handler
export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (!code) {
    // No code provided - redirect to auth page
    return NextResponse.redirect(`${requestUrl.origin}/auth?error=no_code`)
  }

  try {
    // Create a Supabase client for the server
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Exchange the code for a session (must happen on the server)
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      throw error
    }
    
    // Make sure we have a session before redirecting
    if (data.session) {
      console.log('Successfully established session for user:', data.session.user.email)
    }
    
    // Redirect back to the home page with successful login parameter
    return NextResponse.redirect(`${requestUrl.origin}/?login=success`)
  } catch (error: any) {
    console.error('Auth callback error:', error)
    
    // Handle PKCE errors specially
    if (error.message?.includes('code challenge')) {
      // This happens when the auth state is lost between requests
      return NextResponse.redirect(`${requestUrl.origin}/auth?error=pkce`)
    }
    
    // Handle any other errors
    return NextResponse.redirect(
      `${requestUrl.origin}/auth?error=unknown&message=${encodeURIComponent(error.message)}`
    )
  }
}
