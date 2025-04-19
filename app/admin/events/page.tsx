'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useSupabase } from '@/providers/SupabaseProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Edit, Plus, Trash2, Users, MapPin, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { EventService } from '@/lib/services/event-service'
import { Event } from '@/lib/types'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import { EventForm } from './event-form'
// All authenticated users can access admin features in our simplified approach

export default function AdminEventsPage() {
  const { supabase, user } = useSupabase()
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('active')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 10

  // Initialize the EventService with useMemo to prevent dependency changes
  const eventService = React.useMemo(() => new EventService(supabase), [supabase])

  // No longer checking authentication - automatically set admin access
  useEffect(() => {
    // Skip authentication check - automatically grant access
    setIsAdmin(true)
    console.log('Admin events page: Auto-allowing access for all users')
  }, [])

  const loadEvents = useCallback(async () => {
    console.log('Loading events...')
    if (!isAdmin) return

    try {
      setLoading(true)

      const filters = {
        status: activeTab as 'active' | 'cancelled' | 'completed'
      }

      const pagination = {
        page: currentPage,
        itemsPerPage
      }

      const { data, count, error } = await eventService.getEvents(filters, pagination)

      if (error) throw error

      setEvents(data || [])
      setTotalPages(Math.ceil((count || 0) / itemsPerPage))
    } catch (error) {
      console.error('Error loading events:', error)
      toast.error('Failed to load events')
    } finally {
      setLoading(false)
    }
  }, [isAdmin, activeTab, currentPage, itemsPerPage, eventService])

  useEffect(() => {
    if (isAdmin) {
      loadEvents()
    }
  }, [isAdmin, activeTab, currentPage, loadEvents])
  
  // Add this ref to track when to reload events
  const shouldReloadEvents = React.useRef(false)

  const handleCreateEvent = async (eventData: Partial<Event>) => {
    try {
      // Make sure we have a valid organizer_id
      if (!eventData.organizer_id && user) {
        eventData.organizer_id = user.id;
      }

      const { data, error } = await eventService.createEvent(eventData)

      if (error) throw error

      toast.success('Event created successfully')
      setIsCreateDialogOpen(false)
      
      // Immediate reload of events to show the new event
      await loadEvents()
      
      // Force a second reload after a short delay to ensure any database propagation delay
      setTimeout(() => {
        loadEvents()
      }, 500)
    } catch (error) {
      console.error('Error creating event:', error)
      toast.error('Failed to create event: ' + (error instanceof Error ? error.message : String(error)))
    }
  }

  const handleUpdateEvent = async (eventData: Partial<Event>) => {
    if (!selectedEvent) return

    try {
      const { data, error } = await eventService.updateEvent(selectedEvent.id, eventData)

      if (error) throw error

      toast.success('Event updated successfully')
      setIsEditDialogOpen(false)
      setSelectedEvent(null)
      loadEvents()
    } catch (error) {
      console.error('Error updating event:', error)
      toast.error('Failed to update event')
    }
  }

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return

    try {
      const { success, error } = await eventService.deleteEvent(selectedEvent.id)

      if (error) throw error

      toast.success('Event deleted successfully')
      setIsDeleteDialogOpen(false)
      setSelectedEvent(null)
      loadEvents()
    } catch (error) {
      console.error('Error deleting event:', error)
      toast.error('Failed to delete event')
    }
  }

  const formatEventTime = (date: string, time: string) => {
    try {
      const dateObj = new Date(`${date}T${time}`)
      return format(dateObj, 'PPP p')
    } catch (e) {
      return `${date} ${time}`
    }
  }

  if (!isAdmin) {
    return (
      <div className="container py-10">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Event Management</h1>
          <p className="text-muted-foreground mt-1">Create and manage events</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Event
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {events.length === 0 ? (
            <div className="text-center py-12 border rounded-lg">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No events found</h3>
              <p className="text-muted-foreground">
                {activeTab === 'active'
                  ? 'Create a new event to get started'
                  : `No ${activeTab} events found`}
              </p>
              {activeTab === 'active' && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Event
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <Card key={event.id}>
                  <div className="md:flex">
                    <div className="md:w-1/4 bg-muted">
                      {event.image_url ? (
                        <div className="h-full w-full relative">
                          <Image
                            src={event.image_url}
                            alt={event.title}
                            className="h-full w-full object-cover"
                            width={300}
                            height={200}
                            style={{ objectFit: 'cover' }}
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
                                {event.registered_attendees || 0} / {event.capacity} registered
                              </span>
                            </div>
                            <div>
                              <span className="font-semibold">{event.price} FCFA</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button
                          variant="outline"
                          onClick={() => router.push(`/admin/events/${event.id}/registrations`)}
                        >
                          <Users className="mr-2 h-4 w-4" />
                          View Registrations
                        </Button>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setSelectedEvent(event)
                              setIsEditDialogOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-destructive"
                            onClick={() => {
                              setSelectedEvent(event)
                              setIsDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardFooter>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {events.length > 0 && totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <Pagination>
                <PaginationContent>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage > 1) {
                        setCurrentPage(currentPage - 1)
                      }
                    }}
                  />
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          isActive={page === currentPage}
                          onClick={(e) => {
                            e.preventDefault()
                            setCurrentPage(page)
                          }}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  })}
                  
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage < totalPages) {
                        setCurrentPage(currentPage + 1)
                      }
                    }}
                  />
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}

      {/* Create Event Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new event
            </DialogDescription>
          </DialogHeader>
          <EventForm
            onSubmit={handleCreateEvent}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>
              Update the event details
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <EventForm
              event={selectedEvent}
              onSubmit={handleUpdateEvent}
              onCancel={() => {
                setIsEditDialogOpen(false)
                setSelectedEvent(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Event Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this event? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false)
                setSelectedEvent(null)
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteEvent}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
