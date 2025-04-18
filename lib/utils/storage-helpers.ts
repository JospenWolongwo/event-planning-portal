import { createBrowserClient } from '@supabase/ssr';
import { isTestSession } from '../test-auth';
import { v4 as uuidv4 } from 'uuid';

/**
 * Helper functions for handling storage operations with proper permissions
 * Includes special handling for test users to bypass RLS policies
 */

// Get Supabase client
const getSupabaseClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

/**
 * Upload an image to Supabase storage with special handling for test users
 * @param file The file to upload
 * @param bucket The storage bucket name
 * @param user The current user (can be null for test users)
 * @returns Object containing the public URL and any error
 */
export const uploadImage = async (
  file: File,
  bucket: string = 'event-images',
  user: any = null
): Promise<{ url: string | null; error: Error | null }> => {
  try {
    // For test users, we'll use a placeholder image URL instead of trying to upload
    const isTest = user && (
      isTestSession({ user }) || 
      user.id.startsWith('00000000-0000-4000') ||
      user.email === 'test@eventportal.com' ||
      user.id === '46938272-ddaf-4160-b27d-cd2e34e47ff3'
    );
    
    if (isTest) {
      // Use a placeholder image for test users instead of trying to upload
      const testImageUrls = [
        'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
        'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1469&q=80',
        'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
        'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
      ];
      
      // Select a random image from the array
      const randomIndex = Math.floor(Math.random() * testImageUrls.length);
      const placeholderUrl = testImageUrls[randomIndex];
      
      console.log('Using placeholder image for test user:', placeholderUrl);
      return { url: placeholderUrl, error: null };
    }
    
    // For real users, proceed with actual upload
    const supabase = getSupabaseClient();
    
    // Generate a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${fileName}`;
    
    // Upload the file
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (uploadError) throw uploadError;
    
    // Get the public URL
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
    
    return { url: data.publicUrl, error: null };
  } catch (error) {
    console.error('Error uploading image:', error);
    return { url: null, error: error as Error };
  }
};

/**
 * Delete an image from Supabase storage
 * @param url The public URL of the image to delete
 * @returns Success status and any error
 */
export const deleteImage = async (
  url: string
): Promise<{ success: boolean; error: Error | null }> => {
  try {
    // Skip deletion for placeholder images
    if (url.includes('unsplash.com')) {
      return { success: true, error: null };
    }
    
    const supabase = getSupabaseClient();
    
    // Extract the path from the URL
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const filePath = pathParts[pathParts.length - 1];
    
    // Delete the file
    const { error } = await supabase.storage
      .from('event-images')
      .remove([filePath]);
    
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting image:', error);
    return { success: false, error: error as Error };
  }
};
