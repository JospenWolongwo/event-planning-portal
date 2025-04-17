'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/providers/SupabaseProvider'
import { Button } from '@/components/ui/button'
import { MapPin, Calendar, Users, Search, Filter } from 'lucide-react'
import { format } from 'date-fns'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { Slider } from '@/components/ui/slider'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from '@/components/ui/pagination'
import { RegistrationModal } from './registration-modal'
import { motion } from 'framer-motion'
import { EventService } from '@/lib/services/event-service'
import { Event } from '@/lib/types'

export default function EventsPage() {
  const { supabase, user } = useSupabase()
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  
  // Search filters
  const [location, setLocation] = useState<string | null>(null)
  const [category, setCategory] = useState<string | null>(null)
  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(10000)
  const [showFilters, setShowFilters] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 10

  // Initialize the EventService
  const eventService = new EventService(supabase)

  const loadEvents = async () => {
    try {
      setLoading(true);
      
      const filters = {
        location: location || undefined,
        category: category || undefined,
        minPrice: minPrice > 0 ? minPrice : undefined,
        maxPrice: maxPrice < 10000 ? maxPrice : undefined,
      };
      
      const pagination = {
        page: currentPage,
        itemsPerPage
      };
      
      const { data, count, error } = await eventService.getUpcomingEvents(filters, pagination);
      
      if (error) throw error;
      
      setEvents(data || []);
      setTotalPages(Math.ceil((count || 0) / itemsPerPage));
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error loading events",
        description: "Please try again later."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [location, category, minPrice, maxPrice, currentPage]);

  const handleRegistration = (event: Event) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to register for events.",
        variant: "destructive"
      });
      
      router.push('/auth?redirect=/events');
      return;
    }
    
    setSelectedEvent(event);
  };

  const formatEventTime = (date: string, time: string) => {
    try {
      const dateObj = new Date(`${date}T${time}`);
      return format(dateObj, 'PPP p');
    } catch (e) {
      return `${date} ${time}`;
    }
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
              Find the perfect event for you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <SearchableSelect
                  id="location"
                  placeholder="Any location"
                  options={[
                    { label: 'Any location', value: 'any' },
                    { label: 'Douala', value: 'Douala' },
                    { label: 'Yaoundé', value: 'Yaoundé' },
                    { label: 'Bafoussam', value: 'Bafoussam' },
                    { label: 'Bamenda', value: 'Bamenda' },
                    { label: 'Buea', value: 'Buea' },
                  ]}
                  value={location}
                  onChange={(value) => setLocation(value === 'any' ? null : value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <SearchableSelect
                  id="category"
                  placeholder="Any category"
                  options={[
                    { label: 'Any category', value: 'any' },
                    { label: 'Conference', value: 'Conference' },
                    { label: 'Workshop', value: 'Workshop' },
                    { label: 'Seminar', value: 'Seminar' },
                    { label: 'Concert', value: 'Concert' },
                    { label: 'Exhibition', value: 'Exhibition' },
                    { label: 'Festival', value: 'Festival' },
                    { label: 'Networking', value: 'Networking' },
                    { label: 'Other', value: 'Other' },
                  ]}
                  value={category}
                  onChange={(value) => setCategory(value === 'any' ? null : value)}
                />
              </div>
              
              <div className="space-y-2 col-span-2">
                <div className="flex justify-between">
                  <Label htmlFor="price-range">Price Range</Label>
                  <span className="text-sm text-muted-foreground">
                    {minPrice} - {maxPrice === 10000 ? 'Any' : maxPrice} FCFA
                  </span>
                </div>
                <div className="pt-4">
                  <Slider
                    id="price-range"
                    defaultValue={[minPrice, maxPrice]}
                    max={10000}
                    step={500}
                    onValueChange={(values) => {
                      setMinPrice(values[0]);
                      setMaxPrice(values[1]);
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setLocation(null);
                setCategory(null);
                setMinPrice(0);
                setMaxPrice(10000);
              }}
            >
              Reset Filters
            </Button>
            <Button onClick={() => loadEvents()}>
              Apply Filters
            </Button>
          </CardFooter>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {events.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  {location || category || minPrice > 0 || maxPrice < 10000
                    ? 'No events found matching your search.' 
                    : 'No events available at the moment.'}
                </p>
              </div>
            ) : (
              <>
                {events.map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="overflow-hidden">
                      <div className="md:flex">
                        <div className="md:w-1/4 bg-muted">
                          {event.image_url ? (
                            <div className="h-full w-full relative">
                              <img
                                src={event.image_url}
                                alt={event.title}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="h-full w-full flex items-center justify-center p-6">
                              <Calendar className="h-12 w-12 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="md:w-3/4">
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-xl">{event.title}</CardTitle>
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
                                  <span className="font-semibold">{event.price} FCFA</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="flex justify-between">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={event.organizer?.avatar_url || ''} />
                                <AvatarFallback>
                                  {event.organizer?.full_name?.charAt(0) || 'O'}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">
                                {event.organizer?.full_name || 'Event Organizer'}
                              </span>
                            </div>
                            <Button onClick={() => handleRegistration(event)}>
                              Register
                            </Button>
                          </CardFooter>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </>
            )}
          </>
        )}
      </div>

      {!loading && events.length > 0 && (
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
              />
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
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
              })}
              
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) {
                    setCurrentPage(currentPage + 1);
                  }
                }}
              />
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {selectedEvent && (
        <RegistrationModal
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          event={selectedEvent}
          onRegistrationComplete={() => {
            setSelectedEvent(null);
            loadEvents();
          }}
        />
      )}
    </div>
  )
}
