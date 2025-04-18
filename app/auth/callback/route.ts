import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import { getSiteUrl } from '@/lib/auth.config'

// Force dynamic route handler to avoid static rendering issues
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  // Debug information
  console.log('Auth callback requested:', request.url)
  console.log('Auth code present:', !!code)
  
  // Check for error parameters
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')
  
  if (error) {
    console.error('Auth error received:', error, errorDescription)
    // Redirect to auth page with error message
    const redirectUrl = new URL('/auth', requestUrl.origin)
    redirectUrl.searchParams.set('error', error)
    redirectUrl.searchParams.set('errorDescription', errorDescription || '')
    return NextResponse.redirect(redirectUrl.toString())
  }

  if (code) {
    try {
      const cookieStore = cookies()
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Error exchanging code for session:', error)
        const redirectUrl = new URL('/auth', requestUrl.origin)
        redirectUrl.searchParams.set('error', 'session_error')
        redirectUrl.searchParams.set('errorDescription', error.message)
        return NextResponse.redirect(redirectUrl.toString())
      }
      
      console.log('Successfully exchanged code for session')
      
      // If code is present, redirect to home page or requested redirect location
      let redirectTo = requestUrl.searchParams.get('redirectTo') || '/'
      
      // Use the consistent site URL from auth.config
      // This ensures we never use localhost in production
      const siteUrl = getSiteUrl();
      console.log('Redirecting to site URL:', siteUrl);
      
      return NextResponse.redirect(new URL(redirectTo, siteUrl))
    } catch (err) {
      console.error('Unexpected error in auth callback:', err)
      return NextResponse.redirect(new URL('/auth?error=unexpected', requestUrl.origin))
    }
  }

  // If no code is present, redirect to login page
  console.log('No auth code present, redirecting to /auth')
  return NextResponse.redirect(new URL('/auth', requestUrl.origin))
}
