import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Force dynamic route handler to avoid static rendering issues
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    try {
      // Create a Supabase client using the route handler helper
      const supabase = createRouteHandlerClient({ cookies });

      // Exchange the auth code for a session
      await supabase.auth.exchangeCodeForSession(code);

      // Redirect back to the home page with a refresh signal
      // The query parameter will trigger a full page refresh to reset auth state
      return NextResponse.redirect(`${requestUrl.origin}?refresh=${Date.now()}&authSuccess=true`);
    } catch (error: any) {
      console.error("Error in auth callback:", error);
      // Redirect to auth page with error parameters if something went wrong
      return NextResponse.redirect(
        `${
          requestUrl.origin
        }/auth?error=callback_error&errorDescription=${encodeURIComponent(
          error.message || "Authentication error occurred"
        )}`
      );
    }
  }

  // If no code was provided, redirect to auth page with an error
  return NextResponse.redirect(
    `${requestUrl.origin}/auth?error=no_code&errorDescription=No authentication code was provided`
  );
}
