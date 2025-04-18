import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '../supabase/types'

export interface User {
  id: string
  full_name: string | null
  phone: string
  avatar_url: string | null
  role: 'user' | 'admin'
  created_at: string
  updated_at: string
  email?: string
}

export interface UserSettings {
  id: string
  user_id: string
  email_notifications: boolean
  sms_notifications: boolean
  theme: 'light' | 'dark' | 'system'
  created_at: string
  updated_at: string
}

/**
 * Service for handling User-related operations
 * This will centralize all user management, profile, and authentication operations
 */
export class UserService {
  private supabase: SupabaseClient<Database>

  constructor(supabaseClient: SupabaseClient<Database>) {
    this.supabase = supabaseClient
  }

  /**
   * Get current user profile
   */
  async getCurrentUserProfile(): Promise<{ data: User | null; error: Error | null }> {
    try {
      const { data: authData, error: authError } = await this.supabase.auth.getUser()
      if (authError) throw authError
      if (!authData?.user) return { data: null, error: null }

      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      if (error) throw error

      // Use a safer type assertion with unknown as intermediate step
      return { data: data as unknown as User, error: null }
    } catch (error) {
      console.error('Error in getCurrentUserProfile:', error)
      return { data: null, error: error as Error }
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<{ data: User | null; error: Error | null }> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error

      // Use a safer type assertion with unknown as intermediate step
      return { data: data as unknown as User, error: null }
    } catch (error) {
      console.error('Error in getUserById:', error)
      return { data: null, error: error as Error }
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, updates: Partial<User>): Promise<{ data: User | null; error: Error | null }> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .update({
          full_name: updates.full_name,
          phone: updates.phone,
          avatar_url: updates.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error

      // Use a safer type assertion with unknown as intermediate step
      return { data: data as unknown as User, error: null }
    } catch (error) {
      console.error('Error in updateUserProfile:', error)
      return { data: null, error: error as Error }
    }
  }

  /**
   * Upload user avatar
   */
  async uploadAvatar(userId: string, file: File): Promise<{ url: string | null; error: Error | null }> {
    try {
      const timestamp = Date.now()
      const fileExt = file.name.split('.').pop()
      const filePath = `${userId}/${timestamp}.${fileExt}`

      const { error: uploadError } = await this.supabase
        .storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: urlData } = this.supabase
        .storage
        .from('avatars')
        .getPublicUrl(filePath)

      return { url: urlData.publicUrl, error: null }
    } catch (error) {
      console.error('Error in uploadAvatar:', error)
      return { url: null, error: error as Error }
    }
  }

  /**
   * Get user settings
   */
  async getUserSettings(userId: string): Promise<{ data: UserSettings | null; error: Error | null }> {
    try {
      const { data, error } = await this.supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        // If no settings exist, create default settings
        if (error.code === 'PGRST116') {
          const { data: newSettings, error: createError } = await this.supabase
            .from('user_settings')
            .insert({
              user_id: userId,
              email_notifications: true,
              sms_notifications: true,
              theme: 'system'
            })
            .select()
            .single()

          if (createError) throw createError
          // Use a safer type assertion with unknown as intermediate step
          return { data: newSettings as unknown as UserSettings, error: null }
        }
        throw error
      }

      // Use a safer type assertion with unknown as intermediate step
      return { data: data as unknown as UserSettings, error: null }
    } catch (error) {
      console.error('Error in getUserSettings:', error)
      return { data: null, error: error as Error }
    }
  }

  /**
   * Update user settings
   */
  async updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<{ data: UserSettings | null; error: Error | null }> {
    try {
      const { data, error } = await this.supabase
        .from('user_settings')
        .update({
          email_notifications: settings.email_notifications,
          sms_notifications: settings.sms_notifications,
          theme: settings.theme,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error

      // Use a safer type assertion with unknown as intermediate step
      return { data: data as unknown as UserSettings, error: null }
    } catch (error) {
      console.error('Error in updateUserSettings:', error)
      return { data: null, error: error as Error }
    }
  }

  /**
   * Check if user is admin
   */
  async isUserAdmin(userId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

      if (error) throw error

      // Use a type assertion to fix TypeScript error
      const typedData = data as unknown as { role?: string }
      return typedData?.role === 'admin'
    } catch (error) {
      console.error('Error in isUserAdmin:', error)
      return false
    }
  }
}
