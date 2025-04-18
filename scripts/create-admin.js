// This script creates an admin user in Supabase
// Run this script with: node scripts/create-admin.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase credentials in .env.local file');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

// Create Supabase client with service role key (admin privileges)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Admin user details
const adminEmail = 'jospenwolongwo@gmail.com';
const adminPassword = 'admin123';

async function createAdminUser() {
  try {
    console.log(`Creating admin user: ${adminEmail}`);
    
    // Check if user already exists
    const { data: existingUsers, error: searchError } = await supabase
      .from('auth.users')
      .select('*')
      .eq('email', adminEmail);
    
    if (searchError) {
      console.error('Error checking for existing user:', searchError.message);
      return;
    }
    
    if (existingUsers && existingUsers.length > 0) {
      console.log('Admin user already exists. Updating password...');
      
      // Update password for existing user
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        existingUsers[0].id,
        { password: adminPassword }
      );
      
      if (updateError) {
        console.error('Error updating admin password:', updateError.message);
        return;
      }
      
      console.log('Admin password updated successfully');
    } else {
      // Create new admin user
      const { data, error } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
      });
      
      if (error) {
        console.error('Error creating admin user:', error.message);
        return;
      }
      
      console.log('Admin user created successfully:', data.user.id);
      
      // Set admin role in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          email: adminEmail,
          role: 'admin',
          full_name: 'Admin User',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      
      if (profileError) {
        console.error('Error setting admin role:', profileError.message);
        return;
      }
    }
    
    console.log('Admin setup complete!');
    console.log('You can now log in with:');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    
  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

createAdminUser();
