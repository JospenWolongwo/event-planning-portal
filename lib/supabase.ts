import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Use dummy values during build time if env vars are missing
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Create a Supabase client with fallback values
// During build time, this will use dummy values but won't actually make API calls
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
    autoRefreshToken: true,
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