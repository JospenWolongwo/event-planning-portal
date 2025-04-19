import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Force dynamic route handler to avoid static rendering issues
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  if (code) {
    // Create a Supabase client using the route handler helper
    const supabase = createRouteHandlerClient({ cookies })
    
    // Exchange the auth code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      // Redirect to auth page with error parameters if something went wrong
      return NextResponse.redirect(
        `${requestUrl.origin}/auth?error=${error.name}&errorDescription=${encodeURIComponent(error.message)}`
      )
    }
  }
  
  // Add a hash parameter to trigger the client-side auth refresh
  return NextResponse.redirect(`${requestUrl.origin}/?auth_callback=success#auth-refresh`)
}
