import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '../supabase/types'

export interface Event {
  id: string
  title: string
  description: string
  location: string
  event_date: string
  event_time: string
  price: number
  capacity: number
  registered_attendees: number
  image_url?: string
  category?: string
  organizer_id: string
  created_at: string
  updated_at: string
  status: 'active' | 'cancelled' | 'completed'
  organizer?: {
    id: string
    full_name: string
    avatar_url?: string
  }
}

interface EventFilters {
  location?: string
  category?: string
  minPrice?: number
  maxPrice?: number
  fromDate?: string
  toDate?: string
  status?: 'active' | 'cancelled' | 'completed'
}

interface PaginationOptions {
  page: number
  itemsPerPage: number
}

/**
 * Service for handling Event-related operations
 * This will replace all direct database queries related to rides/events throughout the application
 */
export class EventService {
  private supabase: SupabaseClient<Database>

  constructor(supabaseClient: SupabaseClient<Database>) {
    this.supabase = supabaseClient
  }

  /**
   * Get all events with optional filtering and pagination
   * This is primarily used by the admin dashboard
   */
  async getEvents(
    filters?: EventFilters,
    pagination?: PaginationOptions
  ): Promise<{ data: Event[] | null; count: number | null; error: Error | null }> {
    try {
      // Build count query for pagination
      let countQuery = this.supabase
        .from('events')
        .select('id', { count: 'exact' })

      // Apply filters to count query
      if (filters) {
        if (filters.location) {
          countQuery = countQuery.eq('location', filters.location)
        }
        if (filters.category) {
          countQuery = countQuery.eq('category', filters.category)
        }
        if (filters.minPrice !== undefined && filters.minPrice > 0) {
          countQuery = countQuery.gte('price', filters.minPrice)
        }
        if (filters.maxPrice !== undefined) {
          countQuery = countQuery.lte('price', filters.maxPrice)
        }
        if (filters.status) {
          countQuery = countQuery.eq('status', filters.status)
        }
        if (filters.fromDate) {
          countQuery = countQuery.gte('event_date', filters.fromDate)
        }
        if (filters.toDate) {
          countQuery = countQuery.lte('event_date', filters.toDate)
        }
      }

      const { count, error: countError } = await countQuery
      if (countError) throw countError

      // Build data query
      let query = this.supabase
        .from('events')
        .select(`
          *,
          organizer:profiles(id, full_name, avatar_url)
        `)
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters) {
        if (filters.location) {
          query = query.eq('location', filters.location)
        }
        if (filters.category) {
          query = query.eq('category', filters.category)
        }
        if (filters.minPrice !== undefined && filters.minPrice > 0) {
          query = query.gte('price', filters.minPrice)
        }
        if (filters.maxPrice !== undefined) {
          query = query.lte('price', filters.maxPrice)
        }
        if (filters.status) {
          query = query.eq('status', filters.status)
        }
        if (filters.fromDate) {
          query = query.gte('event_date', filters.fromDate)
        }
        if (filters.toDate) {
          query = query.lte('event_date', filters.toDate)
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

      return { data, count, error: null }
    } catch (error) {
      console.error('Error in getEvents:', error)
      return { data: null, count: null, error: error as Error }
    }
  }

  /**
   * Get all upcoming events with optional filtering and pagination
   */
  async getUpcomingEvents(
    filters?: EventFilters,
    pagination?: PaginationOptions
  ): Promise<{ data: Event[] | null; count: number | null; error: Error | null }> {
    try {
      // Build count query for pagination
      let countQuery = this.supabase
        .from('events') // Using the new events table
        .select('id', { count: 'exact' })
        .gt('event_date', new Date().toISOString().split('T')[0]) // Filter by upcoming date
        .eq('status', 'active') // Only active events

      // Apply filters to count query
      if (filters) {
        if (filters.location) {
          countQuery = countQuery.eq('location', filters.location)
        }
        if (filters.category) {
          countQuery = countQuery.eq('category', filters.category)
        }
        if (filters.minPrice !== undefined && filters.minPrice > 0) {
          countQuery = countQuery.gte('price', filters.minPrice)
        }
        if (filters.maxPrice !== undefined) {
          countQuery = countQuery.lte('price', filters.maxPrice)
        }
      }

      const { count, error: countError } = await countQuery
      if (countError) throw countError

      // Build data query
      let query = this.supabase
        .from('events') // Using the new events table
        .select(`
          *,
          organizer:profiles(id, full_name, avatar_url)
        `)
        .gt('event_date', new Date().toISOString().split('T')[0]) // Filter by upcoming date
        .eq('status', 'active') // Only active events
        .order('event_date', { ascending: true }) // Order by date

      // Apply filters
      if (filters) {
        if (filters.location) {
          query = query.eq('location', filters.location)
        }
        if (filters.category) {
          query = query.eq('category', filters.category)
        }
        if (filters.minPrice !== undefined && filters.minPrice > 0) {
          query = query.gte('price', filters.minPrice)
        }
        if (filters.maxPrice !== undefined) {
          query = query.lte('price', filters.maxPrice)
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

      return { data, count, error: null }
    } catch (error) {
      console.error('Error in getUpcomingEvents:', error)
      return { data: null, count: null, error: error as Error }
    }
  }

  /**
   * Get a single event by ID
   */
  async getEventById(eventId: string): Promise<{ data: Event | null; error: Error | null }> {
    try {
      const { data, error } = await this.supabase
        .from('events') // Using the new events table
        .select(`
          *,
          organizer:profiles(id, full_name, avatar_url),
          registrations(id, user_id, status)
        `)
        .eq('id', eventId)
        .single()

      if (error) throw error

      // Process data to calculate available capacity
      const processedEvent = data ? {
        ...data,
        seats_available: data.capacity - (data.registrations?.reduce((sum: number, r: any) => sum + (r.status === 'confirmed' ? 1 : 0), 0) || 0)
      } : null

      return { data: processedEvent as Event | null, error: null }
    } catch (error) {
      console.error('Error in getEventById:', error)
      return { data: null, error: error as Error }
    }
  }

  /**
   * Create a new event (admin only)
   */
  async createEvent(eventData: Partial<Event>): Promise<{ data: Event | null; error: Error | null }> {
    try {
      const { data, error } = await this.supabase
        .from('events') // Using the new events table
        .insert([{
          title: eventData.title,
          description: eventData.description,
          location: eventData.location,
          event_date: eventData.event_date,
          event_time: eventData.event_time,
          price: eventData.price,
          capacity: eventData.capacity,
          image_url: eventData.image_url,
          category: eventData.category,
          organizer_id: eventData.organizer_id,
          status: 'active',
        }])
        .select()
        .single()

      if (error) throw error

      return { data: data as unknown as Event, error: null }
    } catch (error) {
      console.error('Error in createEvent:', error)
      return { data: null, error: error as Error }
    }
  }

  /**
   * Update an existing event (admin only)
   */
  async updateEvent(eventId: string, updates: Partial<Event>): Promise<{ data: Event | null; error: Error | null }> {
    try {
      const { data, error } = await this.supabase
        .from('events') // Using the new events table
        .update({
          title: updates.title,
          description: updates.description,
          location: updates.location,
          event_date: updates.event_date,
          event_time: updates.event_time,
          price: updates.price,
          capacity: updates.capacity,
          image_url: updates.image_url,
          category: updates.category,
          status: updates.status,
        })
        .eq('id', eventId)
        .select()
        .single()

      if (error) throw error

      return { data: data as unknown as Event, error: null }
    } catch (error) {
      console.error('Error in updateEvent:', error)
      return { data: null, error: error as Error }
    }
  }

  /**
   * Delete an event (admin only)
   */
  async deleteEvent(eventId: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error } = await this.supabase
        .from('events') // Using the new events table
        .delete()
        .eq('id', eventId)

      if (error) throw error

      return { success: true, error: null }
    } catch (error) {
      console.error('Error in deleteEvent:', error)
      return { success: false, error: error as Error }
    }
  }
}
