import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Following the Supabase docs for the simplest implementation
// https://supabase.com/docs/guides/auth/auth-helpers/nextjs

export const supabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)


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