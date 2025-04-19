import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Force dynamic route handler to avoid static rendering issues
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  if (code) {
    try {
      // Create a Supabase client using the route handler helper
      const supabase = createRouteHandlerClient({ cookies })
      
      // Exchange the auth code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error("Error exchanging code for session:", error);
        // For PKCE errors, redirect to auth page with a special parameter to restart the auth flow
        if (error.message?.includes('code challenge') || error.message?.includes('code verifier')) {
          // This is a PKCE error - the code verifier was lost, we need to start over
          return NextResponse.redirect(`${requestUrl.origin}/auth?error=pkce_error&restart=true`);
        }
        throw error;
      }
      
      if (data?.session) {
        // Success - redirect with a signal to force a full refresh
        // Using only refresh parameter to reduce complexity
        return NextResponse.redirect(`${requestUrl.origin}/?refresh=${Date.now()}`);
      } else {
        // No session was returned, but no error either - unusual case
        console.error("No session returned from exchangeCodeForSession");
        return NextResponse.redirect(`${requestUrl.origin}/auth?error=no_session&errorDescription=Authentication succeeded but no session was created`);
      }
    } catch (error: any) {
      console.error("Error in auth callback:", error);
      // Redirect to auth page with error parameters
      return NextResponse.redirect(
        `${requestUrl.origin}/auth?error=callback_error&errorDescription=${encodeURIComponent(error.message || 'Unknown auth error')}`
      )
    }
  }
  
  // If no code was provided, redirect to auth page with an error
  return NextResponse.redirect(
    `${requestUrl.origin}/auth?error=no_code&errorDescription=No authentication code was provided`
  );
}
