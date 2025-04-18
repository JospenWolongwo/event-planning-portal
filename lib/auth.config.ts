/**
 * Configuration for authentication redirects
 * This ensures magic links always use the correct domain
 */

export function getSiteUrl() {
  // For client-side, use window.location.origin
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // For server-side, use environment variable or a fallback
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://event-planning-portal-1.vercel.app';
}

export function getRedirectUrl(path: string = '/auth/callback') {
  const baseUrl = getSiteUrl();
  const url = new URL(path, baseUrl);
  return url.toString();
}
