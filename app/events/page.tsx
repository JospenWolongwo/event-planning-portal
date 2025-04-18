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
  const [totalPages, setTotalPages] = useState(1)
  const { supabase } = useSupabase()
  
  // Load events from Supabase
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true)
      try {
        console.log('Fetching events for page', currentPage)
        const pageSize = 10
        const from = (currentPage - 1) * pageSize
        const to = from + pageSize - 1
        
        // Query events from Supabase
        const { data: eventsData, error, count } = await supabase
          .from('events')
          .select(`
            id, title, description, location, 
            event_date, event_time, price, capacity, 
            image_url, category, organizer_id, 
            profiles(id, full_name, avatar_url)
          `, { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(from, to)
        
        if (error) {
          throw error
        }
        
        // Transform the data to include organizer information
        const formattedEvents = eventsData.map(event => ({
          ...event,
          organizer: event.profiles,
          // Use a default image if none is provided
          image_url: event.image_url || CURATED_EVENT_IMAGES[Math.floor(Math.random() * CURATED_EVENT_IMAGES.length)],
          // Default to 0 registered attendees until we implement registration
          registered_attendees: 0
        }))
        
        console.log('Loaded events:', formattedEvents)
        setEvents(formattedEvents)
        setTotalPages(Math.ceil((count || 0) / pageSize) || 1)
      } catch (error) {
        console.error('Error fetching events:', error)
        toast.error('Failed to load events')
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [supabase, currentPage, setEvents, setLoading, setTotalPages])

  const formatEventTime = (date, time) => {
    return `${date} at ${time}`;
  };

  const handleRegistration = (event) => {
    router.push(`/events/${event.id}`);
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Upcoming Events</h1>
          <p className="text-muted-foreground">
            Browse and register for exciting events
          </p>
        </div>
        
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filter Events</CardTitle>
            <CardDescription>
              Refine your search to find the perfect event
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search events..."
                    className="pl-8"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="">All Categories</option>
                  <option value="Conference">Conference</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Festival">Festival</option>
                  <option value="Meetup">Meetup</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date">Date Range</Label>
                <select
                  id="date"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="">Any Date</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label>Price Range (FCFA)</Label>
                <Slider
                  defaultValue={[0, 10000]}
                  max={10000}
                  step={500}
                  className="py-4"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0 FCFA</span>
                  <span>10,000 FCFA</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline">Reset</Button>
            <Button>Apply Filters</Button>
          </CardFooter>
        </Card>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading events...</span>
        </div>
      )}

      {/* Events grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {!loading && events.length === 0 ? (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col items-center justify-center py-12">
            <h3 className="text-xl font-medium">No events found</h3>
            <p className="text-muted-foreground">Check back later for upcoming events</p>
          </div>
        ) : !loading ? events.map((event) => (
          <Card key={event.id} className="overflow-hidden hover:shadow-md transition-shadow duration-300">
            <div className="relative aspect-video w-full overflow-hidden">
              <Image
                src={event.image_url}
                alt={event.title}
                fill
                className="object-cover transition-all hover:scale-105"
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
        )) : null}
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
