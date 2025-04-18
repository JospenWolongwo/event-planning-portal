import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import { getSiteUrl } from '@/lib/auth.config'

// Force dynamic route handler to avoid static rendering issues
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  
  // Debug info: log the full URL to help understand what's happening
  console.log('Auth callback full URL:', request.url);

  try {
    // Get the code from the URL
    const code = requestUrl.searchParams.get('code');

    // Handle auth errors
    const error = requestUrl.searchParams.get('error');
    const errorDescription = requestUrl.searchParams.get('error_description');
    
    if (error) {
      console.error('Auth error received:', error, errorDescription);
      return NextResponse.redirect(
        new URL(`/auth?error=${error}&errorDescription=${errorDescription || ''}`, getSiteUrl())
      );
    }

    if (!code) {
      // No code means an incomplete authentication request
      console.warn('No auth code present in callback URL');
      return NextResponse.redirect(new URL('/auth?error=no_code', getSiteUrl()));
    }

    // Get cookies and create a supabase server client
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Exchange the code for a session
    // This is the critical step for PKCE flow
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (exchangeError) {
      console.error('Error exchanging code for session:', exchangeError);
      return NextResponse.redirect(
        new URL(`/auth?error=session_error&errorDescription=${exchangeError.message}`, getSiteUrl())
      );
    }

    console.log('Successfully authenticated and created session');

    // If we're here, authentication was successful
    // Get the redirectTo value or default to homepage
    const redirectTo = requestUrl.searchParams.get('redirectTo') || '/';
    
    // Use the site URL from our config
    const siteUrl = getSiteUrl();
    console.log('Authentication successful, redirecting to:', `${siteUrl}${redirectTo}`);
    
    // Redirect to the intended destination
    return NextResponse.redirect(new URL(redirectTo, siteUrl));
    
  } catch (error) {
    console.error('Unexpected error in auth callback:', error);
    return NextResponse.redirect(new URL('/auth?error=unexpected', getSiteUrl()));
  }
}
