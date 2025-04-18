import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Use dummy values during build time if env vars are missing
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Get the correct site URL for auth redirects - critical for magic links
const siteUrl = typeof window !== 'undefined' 
  ? window.location.origin 
  : (process.env.NEXT_PUBLIC_SITE_URL || 'https://event-planning-portal-1.vercel.app');

console.log('Supabase client using site URL for redirects:', siteUrl);

// Create a Supabase client with proper configuration
// Note: we don't use the 'site' property since it's not supported in the current version
// Instead, we explicitly set the redirect URL in each auth call
const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: (url, options = {}) => {
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })
    }
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

// For backwards compatibility
export const createClient = () => supabase

export async function sendVerificationCode(phone: string): Promise<{ error: string | null }> {
  try {
    // Create verification code in database
    const { data, error } = await supabase
      .rpc('create_verification', { phone_number: phone })
    
    if (error) throw error

    // TODO: Integrate with actual SMS gateway
    // For now, we'll log the verification code to the console
    console.log(`Verification code for ${phone} created with ID: ${data}`)
    
    return { error: null }
  } catch (error: any) {
    console.error('Error sending verification code:', error)
    return { error: 'Failed to send verification code' }
  }
}

export async function verifyCode(phone: string, code: string): Promise<{ 
  error: string | null,
  verified: boolean 
}> {
  try {
    const { data, error } = await supabase
      .rpc('verify_code', { 
        phone_number: phone,
        submitted_code: code 
      })
    
    if (error) throw error

    return { 
      error: null,
      verified: Boolean(data) 
    }
  } catch (error: any) {
    console.error('Error verifying code:', error)
    return { 
      error: 'Failed to verify code',
      verified: false
    }
  }
}