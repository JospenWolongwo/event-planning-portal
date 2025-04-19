'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { MapPin, Calendar, Users, Search, Filter, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from '@/components/ui/pagination'
import { CURATED_EVENT_IMAGES, getEventImageUrl } from '@/lib/utils/unsplash'
import Image from 'next/image'
import { useSupabase } from '@/providers/SupabaseProvider'
import { toast } from 'sonner'

// Define Event type
type Event = {
  id: string;
  title: string;
  description: string;
  location: string;
  event_date: string;
  event_time: string;
  price: number;
  capacity: number;
  registered_attendees?: number;
  image_url: string;
  category: string;
  organizer_id: string;
  profiles?: any;
  organizer?: any;
}

export default function EventsPage() {
  const router = useRouter()
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [initialLoading, setInitialLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const { supabase } = useSupabase()
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000])
  const [dateFilter, setDateFilter] = useState<string>('')
  
  // Load events from Supabase
  // Apply filters when filter values change
  useEffect(() => {
    // Reset to first page when filters change
    if (!initialLoading) {
      setCurrentPage(1)
    }
  }, [searchTerm, selectedCategory, priceRange, dateFilter, initialLoading])
  
  // Load events from cache initially if available, then fetch from API
  useEffect(() => {
    // Function to fetch events from Supabase - moved inside useEffect to fix dependency issues
    const fetchEvents = async () => {
      setLoading(true)
      try {
        console.log('Fetching events for page', currentPage)
        const pageSize = 10
        const from = (currentPage - 1) * pageSize
        const to = from + pageSize - 1
        
        // Start building the query
        let query = supabase
          .from('events')
          .select(`
            id, title, description, location, 
            event_date, event_time, price, capacity, 
            image_url, category, organizer_id, 
            profiles(id, full_name, avatar_url),
            registrations(id)
          `, { count: 'exact' })
        
        // Apply filters if they exist
        // Search term filter (search in title and description)
        if (searchTerm) {
          // Use ilike for case-insensitive search
          query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        }
        
        // Category filter
        if (selectedCategory) {
          query = query.eq('category', selectedCategory)
        }
        
        // Price range filter
        if (priceRange[0] > 0 || priceRange[1] < 10000) {
          query = query.gte('price', priceRange[0]).lte('price', priceRange[1])
        }
        
        // Date filter
        if (dateFilter) {
          const today = new Date().toISOString().split('T')[0]
          
          if (dateFilter === 'today') {
            query = query.eq('event_date', today)
          } else if (dateFilter === 'upcoming') {
            query = query.gte('event_date', today)
          } else if (dateFilter === 'past') {
            query = query.lt('event_date', today)
          } else if (dateFilter === 'week') {
            // Get date 7 days from now
            const nextWeek = new Date()
            nextWeek.setDate(nextWeek.getDate() + 7)
            const nextWeekStr = nextWeek.toISOString().split('T')[0]
            
            query = query.gte('event_date', today).lte('event_date', nextWeekStr)
          }
        }
        
        // Apply sorting and pagination
        query = query.order('created_at', { ascending: false }).range(from, to)
        
        // Execute the query
        const { data: eventsData, error, count } = await query
        
        if (error) {
          throw error
        }
        
        // Get registration counts for each event - using countBy function instead of group_by
        const eventIds = eventsData.map((event: any) => event.id)
        
        // Alternative approach to get registration counts without using group_by
        // Query registrations for each event individually and count them
        const registrationCounts: Record<string, number> = {}
        
        // For each event, count its registrations
        for (const eventId of eventIds) {
          const { count: regCount, error: countError } = await supabase
            .from('registrations')
            .select('*', { count: 'exact' })
            .eq('event_id', eventId)
            
          if (!countError) {
            registrationCounts[eventId] = regCount || 0
          }
        }
        
        // Transform the data to include organizer information and registration counts
        const formattedEvents = eventsData.map((event: any) => ({
          ...event,
          organizer: event.profiles,
          // Use a default image if none is provided
          image_url: event.image_url || CURATED_EVENT_IMAGES[Math.floor(Math.random() * CURATED_EVENT_IMAGES.length)],
          // Get registration count or default to 0
          registered_attendees: registrationCounts[event.id] || 0
        }))
        
        console.log('Loaded events:', formattedEvents)
        setEvents(formattedEvents)
        setTotalPages(Math.ceil((count || 0) / pageSize) || 1)
        
        // Cache events in localStorage for faster initial loading on refresh
        localStorage.setItem('cached_events', JSON.stringify({
          events: formattedEvents,
          totalPages: Math.ceil((count || 0) / pageSize) || 1,
          timestamp: Date.now(),
          currentPage
        }))
      } catch (error) {
        console.error('Error fetching events:', error)
        toast.error('Failed to load events')
      } finally {
        setLoading(false)
      }
    }

    const loadEvents = async () => {
      try {
        // Try to get cached events first
        const cachedData = localStorage.getItem('cached_events')
        if (cachedData) {
          const { events: cachedEvents, totalPages: cachedPages, timestamp, currentPage: cachedPage } = JSON.parse(cachedData)
          const cacheAge = Date.now() - timestamp
          
          // Use cache if it's less than 5 minutes old
          if (cacheAge < 5 * 60 * 1000) {
            console.log('Using cached events data')
            setEvents(cachedEvents)
            setTotalPages(cachedPages)
            // Don't override current page if user has navigated
            if (currentPage === 1) {
              setCurrentPage(cachedPage)
            }
            setLoading(false)
          }
        }
      } catch (error) {
        console.error('Error loading cached events:', error)
      }
      
      // Always fetch fresh data from API
      fetchEvents()
    }
    
    loadEvents()
    // After first load, set initialLoading to false
    if (initialLoading) {
      setInitialLoading(false)
    }
  }, [currentPage, supabase, searchTerm, selectedCategory, priceRange, dateFilter, initialLoading]) // Include all filter dependencies

  const formatEventTime = (date: string, time: string): string => {
    return `${date} at ${time}`;
  };
  
  const handleRegistration = (event: { id: string }) => {
    router.push(`/events/${event.id}`);
  };

  // Get available categories from events
  const categories = Array.from(new Set(events.map(event => event.category))).filter(Boolean)
  
  // Apply filtering to displayed events
  const filteredEvents = events
  
  // Reset filters function
  const resetFilters = () => {
    setSearchTerm('')
    setSelectedCategory('')
    setPriceRange([0, 10000])
    setDateFilter('')
    setCurrentPage(1)
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Upcoming Events</h1>
        </div>

        <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 p-4 border rounded-lg bg-card">
          {/* Search filter */}
          <div>
            <Label htmlFor="search" className="mb-2">
              Search
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search events..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {/* Category filter */}
          <div>
            <Label htmlFor="category" className="mb-2">
              Category
            </Label>
            <select
              id="category"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          {/* Date filter */}
          <div>
            <Label htmlFor="date" className="mb-2">
              Date
            </Label>
            <select
              id="date"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="">All Dates</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past Events</option>
            </select>
          </div>
          
          {/* Price range */}
          <div>
            <Label className="mb-2">Price Range</Label>
            <div className="pt-4">
              <Slider
                defaultValue={[0, 10000]}
                max={10000}
                step={500}
                value={priceRange}
                onValueChange={(value) => setPriceRange(value as [number, number])}
              />
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>Free</span>
                <span>{priceRange[0]} - {priceRange[1]} FCFA</span>
              </div>
            </div>
          </div>
          
          {/* Reset filters button */}
          <div className="col-span-1 md:col-span-2 lg:col-span-4 flex justify-end mt-4">
            <Button variant="outline" onClick={resetFilters}>
              Reset Filters
            </Button>
          </div>
        </div>
      )}

      {/* Events grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialLoading ? (
          // Show skeleton loaders during initial loading
          Array(6).fill(0).map((_, index) => (
            <div key={`skeleton-${index}`} className="animate-appear">
              <div className="animate-pulse">
                <div className="bg-muted aspect-video rounded-t-lg mb-4"></div>
                <div className="space-y-2 px-4 pb-4">
                  <div className="h-5 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                </div>
              </div>
            </div>
          ))
        ) : loading ? (
          // Show loading state during subsequent data fetches
          Array(6).fill(0).map((_, index) => (
            <div key={`skeleton-${index}`} className="animate-appear">
              <div className="animate-pulse">
                <div className="bg-muted aspect-video rounded-t-lg mb-4"></div>
                <div className="space-y-2 px-4 pb-4">
                  <div className="h-5 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                </div>
              </div>
            </div>
          ))
        ) : events.length ? events.map((event) => (
          <Card key={event.id} className="overflow-hidden">
            <div className="aspect-video relative">
              <Image
                src={event.image_url}
                alt={event.title}
                fill
                className="object-cover"
              />
            </div>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle 
                    className="text-xl hover:text-primary cursor-pointer"
                    onClick={() => router.push(`/events/${event.id}`)}
                  >
                    {event.title}
                  </CardTitle>
                  <CardDescription>
                    {formatEventTime(event.event_date, event.event_time)}
                  </CardDescription>
                </div>
                <Badge variant={event.category === 'Conference' ? 'default' : 'outline'}>
                  {event.category || 'Event'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{event.location}</span>
                </div>
                <p className="line-clamp-2">{event.description}</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {event.capacity - (event.registered_attendees || 0)} spots left
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold">{event.price || 'Free'} {event.price ? 'FCFA' : ''}</span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {event.organizer?.full_name?.charAt(0) || 'O'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">
                  {event.organizer?.full_name || 'Event Organizer'}
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => router.push(`/events/${event.id}`)}>
                  View Details
                </Button>
                <Button onClick={() => handleRegistration(event)}>
                  Register
                </Button>
              </div>
            </CardFooter>
          </Card>
        )) : (
          <div className="col-span-3 flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-xl font-medium">No events found</h3>
              <p className="text-muted-foreground mt-2">Try adjusting your filters or check back later for new events.</p>
              {(searchTerm || selectedCategory || dateFilter || priceRange[0] > 0 || priceRange[1] < 10000) && (
                <Button onClick={resetFilters} className="mt-4">
                  Reset Filters
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) {
                    setCurrentPage(currentPage - 1);
                  }
                }}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
              />
              
              {Array.from({ length: totalPages }, (_, i) => {
                const page = i + 1;
                // Only show a few page numbers around the current page
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        isActive={page === currentPage}
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(page);
                        }}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                } else if (
                  page === currentPage - 2 ||
                  page === currentPage + 2
                ) {
                  // Add ellipsis for skipped pages
                  return (
                    <PaginationItem key={`ellipsis-${page}`}>
                      <span className="flex h-9 w-9 items-center justify-center text-sm">...</span>
                    </PaginationItem>
                  );
                }
                return null;
              })}
              
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) {
                    setCurrentPage(currentPage + 1);
                  }
                }}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}
