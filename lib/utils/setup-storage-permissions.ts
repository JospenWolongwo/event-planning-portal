import { createBrowserClient } from '@supabase/ssr';

/**
 * This utility sets up storage permissions for the event-images bucket
 * It's designed to be called once during app initialization
 */

export async function setupStoragePermissions() {
  if (typeof window === 'undefined') return;
  
  try {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Create a test directory in the event-images bucket if it doesn't exist
    const { data: testDirExists } = await supabase.storage
      .from('event-images')
      .list('test');
    
    if (!testDirExists || testDirExists.length === 0) {
      // Create an empty file to establish the directory
      const emptyBlob = new Blob([''], { type: 'text/plain' });
      await supabase.storage
        .from('event-images')
        .upload('test/.gitkeep', emptyBlob);
      
      console.log('Created test directory in event-images bucket');
    }
    
    console.log('Storage permissions setup complete');
  } catch (error) {
    console.error('Error setting up storage permissions:', error);
  }
}
