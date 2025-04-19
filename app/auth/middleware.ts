import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware intercepts requests to auth routes and ensures cookies are properly preserved
export function middleware(request: NextRequest) {
  try {
    const response = NextResponse.next();

    // Preserve all cookies from the request to the response
    // This is critical for authentication flow to work properly
    const cookies = request.cookies.getAll();
    
    // Safe cookie logging to avoid parsing errors
    console.log('Auth middleware - preserving cookies:', cookies.map(c => c.name).join(', '));

    // Don't try to parse base64 encoded cookies directly as they might not be valid JSON
    // Instead, just preserve the original cookie header
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      response.headers.set('cookie', cookieHeader);
    }

    return response;
  } catch (error) {
    console.error('Auth middleware error:', error);
    return NextResponse.next();
  }
}

// Only run this middleware on auth-related paths
export const config = {
  matcher: ['/auth/:path*'],
};
