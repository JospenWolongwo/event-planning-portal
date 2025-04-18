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
    await supabase.auth.exchangeCodeForSession(code)
  }
  
  // URL to redirect to after sign in process completes
  return NextResponse.redirect(requestUrl.origin)
}
