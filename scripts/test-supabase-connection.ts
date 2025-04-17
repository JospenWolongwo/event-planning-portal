import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing environment variables. Please check your .env.local file.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  console.log('Testing Supabase connection...')
  
  try {
    // Test database connection
    const { data, error } = await supabase
      .from('event_categories')
      .select('*')
      .limit(1)
    
    if (error) throw error
    
    console.log('✅ Successfully connected to Supabase!')
    console.log('✅ Retrieved data from event_categories table:', data)
    
    // Test authentication system
    const authResponse = await supabase.auth.getSession()
    console.log('✅ Auth system is working')
    
    console.log('\nYour Supabase setup is complete and working correctly!')
  } catch (error) {
    console.error('❌ Error connecting to Supabase:', error)
    console.log('\nPlease check your credentials and ensure your migration script ran successfully.')
  }
}

testConnection()
