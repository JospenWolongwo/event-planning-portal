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

      // Exchange the auth code for a session - simplifying to minimize errors
      await supabase.auth.exchangeCodeForSession(code);
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

  // Redirect to the home page without additional parameters that might interfere with the auth flow
  return NextResponse.redirect(requestUrl.origin);
}
