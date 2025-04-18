import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// Force dynamic route handler to avoid static rendering issues
export const dynamic = 'force-dynamic';

/**
 * Handle authentication callback from Supabase magic link
 * Simplified version that avoids complex PKCE handling
 */
export async function GET(request: NextRequest) {
  try {
    // Get the code from the URL
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    
    console.log('Auth callback received with code:', code ? 'Present' : 'Missing');
    
    // Handle error params if present
    const error = requestUrl.searchParams.get('error');
    const errorDescription = requestUrl.searchParams.get('error_description');
    
    if (error) {
      console.error(`Auth error: ${error}`, errorDescription);
      return NextResponse.redirect(
        new URL(`/auth?error=${encodeURIComponent(error)}&errorDescription=${encodeURIComponent(errorDescription || 'Unknown error')}`, request.url)
      );
    }
    
    // If no code, redirect to auth page with error
    if (!code) {
      console.error('No code in auth callback URL');
      return NextResponse.redirect(new URL('/auth?error=no_code', request.url));
    }
    
    // Setup Supabase client
    const cookieStore = cookies();
    console.log('Cookies in auth callback:', cookieStore.getAll().map(c => c.name).join(', '));
    
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Attempt to exchange the code for a session
    console.log('Exchanging auth code for session...');
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    // Handle exchange errors
    if (exchangeError) {
      console.error('Error exchanging code for session:', exchangeError.message);
      return NextResponse.redirect(
        new URL(`/auth?error=exchange_error&errorDescription=${encodeURIComponent(exchangeError.message)}`, request.url)
      );
    }
    
    console.log('Successfully exchanged code for session')
    
    // Always redirect to home page - Auth state will be handled client-side
    return NextResponse.redirect(new URL('/', request.url));
  } catch (error) {
    console.error('Unexpected error in auth callback:', error);
    // Redirect to auth page with error
    return NextResponse.redirect(new URL('/auth?error=unexpected', request.url));
  }
}
