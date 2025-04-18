import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware intercepts requests to auth routes and ensures cookies are properly preserved
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Preserve all cookies from the request to the response
  // This is critical for PKCE authentication flow to work properly
  const cookies = request.cookies.getAll();
  const cookieHeader = request.headers.get('cookie');
  
  console.log('Auth middleware - preserving cookies:', cookies.map(c => c.name).join(', '));
  
  // Make sure we preserve the cookie header for the next request
  if (cookieHeader) {
    response.headers.set('cookie', cookieHeader);
  }

  return response;
}

// Only run this middleware on auth-related paths
export const config = {
  matcher: ['/auth/:path*'],
};
