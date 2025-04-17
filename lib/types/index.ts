/**
 * Central type definitions file for the Event Portal application
 * This helps maintain consistency across components and services
 */

// Event types (formerly Rides)
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

// Registration types (formerly Bookings)
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

// User and profile types
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

// Payment types
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed'
export type PaymentProviderType = 'MTN' | 'ORANGE'

export interface Payment {
  id: string
  registration_id: string
  amount: number
  status: PaymentStatus
  provider: string
  transaction_id: string
  phone_number: string
  created_at: string
  updated_at: string
}

// Filter and pagination types
export interface EventFilters {
  location?: string
  category?: string
  minPrice?: number
  maxPrice?: number
  fromDate?: string
  toDate?: string
  status?: 'active' | 'cancelled' | 'completed'
}

export interface RegistrationFilters {
  status?: 'pending' | 'confirmed' | 'cancelled'
  payment_status?: 'pending' | 'completed' | 'failed'
  fromDate?: string
  toDate?: string
}

export interface PaginationOptions {
  page: number
  itemsPerPage: number
}
