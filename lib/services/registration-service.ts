import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '../supabase/types'

export interface Registration {
  id: string
  event_id: string
  user_id: string
  attendees: number
  status: 'pending' | 'confirmed' | 'cancelled'
  payment_status: 'pending' | 'completed' | 'failed'
  created_at: string
  updated_at: string
  event?: {
    title: string
    location: string
    event_date: string
    event_time: string
    price: number
  }
  user?: {
    full_name: string
    phone: string
    avatar_url?: string
  }
}

interface RegistrationFilters {
  status?: 'pending' | 'confirmed' | 'cancelled'
  payment_status?: 'pending' | 'completed' | 'failed'
  fromDate?: string
  toDate?: string
}

interface PaginationOptions {
  page: number
  itemsPerPage: number
}

/**
 * Service for handling Registration-related operations
 * This will replace all direct database queries related to bookings/registrations
 */
export class RegistrationService {
  private supabase: SupabaseClient<Database>

  constructor(supabaseClient: SupabaseClient<Database>) {
    this.supabase = supabaseClient
  }

  /**
   * Get registrations for a specific user with optional filtering and pagination
   */
  async getUserRegistrations(
    userId: string,
    filters?: RegistrationFilters,
    pagination?: PaginationOptions
  ): Promise<{ data: Registration[] | null; count: number | null; error: Error | null }> {
    try {
      // Build count query for pagination
      let countQuery = this.supabase
        .from('event_registrations')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)

      // Apply filters to count query
      if (filters) {
        if (filters.status) {
          countQuery = countQuery.eq('status', filters.status)
        }
        if (filters.payment_status) {
          countQuery = countQuery.eq('payment_status', filters.payment_status)
        }
      }

      const { count, error: countError } = await countQuery
      if (countError) throw countError

      // Build data query
      let query = this.supabase
        .from('event_registrations')
        .select(`
          *,
          event:events(*), 
          user:profiles(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters) {
        if (filters.status) {
          query = query.eq('status', filters.status)
        }
        if (filters.payment_status) {
          query = query.eq('payment_status', filters.payment_status)
        }
      }

      // Apply pagination
      if (pagination) {
        const { page, itemsPerPage } = pagination
        const start = (page - 1) * itemsPerPage
        const end = start + itemsPerPage - 1
        query = query.range(start, end)
      }

      const { data, error } = await query
      if (error) throw error

      return { data: data as unknown as Registration[] | null, count, error: null }
    } catch (error) {
      console.error('Error in getUserRegistrations:', error)
      return { data: null, count: null, error: error as Error }
    }
  }

  /**
   * Get registrations for a specific event with optional filtering and pagination
   */
  async getEventRegistrations(
    eventId: string,
    filters?: RegistrationFilters,
    pagination?: PaginationOptions
  ): Promise<{ data: Registration[] | null; count: number | null; error: Error | null }> {
    try {
      // Build count query for pagination
      let countQuery = this.supabase
        .from('event_registrations')
        .select('id', { count: 'exact' })
        .eq('event_id', eventId)

      // Apply filters to count query
      if (filters) {
        if (filters.status) {
          countQuery = countQuery.eq('status', filters.status)
        }
        if (filters.payment_status) {
          countQuery = countQuery.eq('payment_status', filters.payment_status)
        }
      }

      const { count, error: countError } = await countQuery
      if (countError) throw countError

      // Build data query
      let query = this.supabase
        .from('event_registrations')
        .select(`
          *,
          event:events(*), 
          user:profiles(id, full_name, phone, avatar_url)
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters) {
        if (filters.status) {
          query = query.eq('status', filters.status)
        }
        if (filters.payment_status) {
          query = query.eq('payment_status', filters.payment_status)
        }
      }

      // Apply pagination
      if (pagination) {
        const { page, itemsPerPage } = pagination
        const start = (page - 1) * itemsPerPage
        const end = start + itemsPerPage - 1
        query = query.range(start, end)
      }

      const { data, error } = await query
      if (error) throw error

      return { data: data as unknown as Registration[] | null, count, error: null }
    } catch (error) {
      console.error('Error in getEventRegistrations:', error)
      return { data: null, count: null, error: error as Error }
    }
  }

  /**
   * Get a single registration by ID
   */
  async getRegistrationById(registrationId: string): Promise<{ data: Registration | null; error: Error | null }> {
    try {
      const { data, error } = await this.supabase
        .from('event_registrations')
        .select(`
          *,
          event:events(*),
          user:profiles(id, full_name, phone, avatar_url)
        `)
        .eq('id', registrationId)
        .single()

      if (error) throw error

      return { data: data as unknown as Registration, error: null }
    } catch (error) {
      console.error('Error in getRegistrationById:', error)
      return { data: null, error: error as Error }
    }
  }

  /**
   * Create a new registration (booking)
   */
  async createRegistration(registrationData: {
    event_id: string,
    user_id: string,
    attendees: number
  }): Promise<{ data: Registration | null; error: Error | null }> {
    try {
      const { data, error } = await this.supabase
        .from('event_registrations')
        .insert([{
          event_id: registrationData.event_id,
          user_id: registrationData.user_id,
          attendees: registrationData.attendees,
          status: 'pending',
          payment_status: 'pending'
        }])
        .select()
        .single()

      if (error) throw error

      return { data: data as unknown as Registration, error: null }
    } catch (error) {
      console.error('Error in createRegistration:', error)
      return { data: null, error: error as Error }
    }
  }

  /**
   * Update registration status
   */
  async updateRegistrationStatus(
    registrationId: string,
    status: 'pending' | 'confirmed' | 'cancelled',
    payment_status?: 'pending' | 'completed' | 'failed'
  ): Promise<{ data: Registration | null; error: Error | null }> {
    try {
      const updates: { 
        status: string; 
        payment_status?: string;
        updated_at: string;
      } = {
        status,
        updated_at: new Date().toISOString()
      }

      if (payment_status) {
        updates.payment_status = payment_status
      }

      const { data, error } = await this.supabase
        .from('event_registrations')
        .update(updates)
        .eq('id', registrationId)
        .select()
        .single()

      if (error) throw error

      return { data: data as unknown as Registration, error: null }
    } catch (error) {
      console.error('Error in updateRegistrationStatus:', error)
      return { data: null, error: error as Error }
    }
  }

  /**
   * Cancel a registration
   */
  async cancelRegistration(registrationId: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error } = await this.supabase
        .from('event_registrations')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', registrationId)

      if (error) throw error

      return { success: true, error: null }
    } catch (error) {
      console.error('Error in cancelRegistration:', error)
      return { success: false, error: error as Error }
    }
  }
}
