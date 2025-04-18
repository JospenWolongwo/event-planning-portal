'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { MapPin, Calendar, Users, Clock, ArrowLeft, Share2, Heart } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CURATED_EVENT_IMAGES } from '@/lib/utils/unsplash'
import Image from 'next/image'

export default function EventDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  
  // Static event data for testing
  const event = {
    id: params.id,
    title: "Tech Conference 2025",
    description: "Join us for the biggest tech conference in Cameroon. Learn about the latest technologies and network with industry professionals.",
    location: "Douala Convention Center",
    event_date: "2025-05-15",
    event_time: "09:00:00",
    price: 5000,
    capacity: 200,
    registered_attendees: 120,
    image_url: CURATED_EVENT_IMAGES[0],
    category: "Conference",
    organizer: {
      id: "123",
      full_name: "Tech Events Cameroon",
      avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop"
    }
  }
  
  const [isFavorite, setIsFavorite] = useState(false)

  const handleRegistration = () => {
    alert("Registration functionality will be implemented soon!")
  }

  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite)
    alert(isFavorite ? "Removed from favorites" : "Added to favorites")
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: event?.title || 'Event Details',
          text: `Check out this event: ${event?.title}`,
          url: window.location.href
        })
      } else {
        // Fallback for browsers that don't support the Web Share API
        navigator.clipboard.writeText(window.location.href)
        alert("Link copied to clipboard")
      }
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  return (
    <div className="container py-8">
      <Button 
        variant="ghost" 
        className="mb-6"
        onClick={() => router.back()}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Events
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg">
            <Image
              src={event.image_url}
              alt={event.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4">
              <Badge className="bg-primary text-primary-foreground">{event.category}</Badge>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="outline">{event.category || 'Event'}</Badge>
              <Badge variant="secondary">
                {event.capacity - (event.registered_attendees || 0)} spots left
              </Badge>
            </div>
            
            <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
            
            <div className="flex items-center gap-2 mb-6">
              <Avatar className="h-6 w-6">
                <AvatarImage src={event.organizer?.avatar_url || ''} />
                <AvatarFallback>
                  {event.organizer?.full_name?.charAt(0) || 'O'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">
                Organized by {event.organizer?.full_name || 'Event Organizer'}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date & Time</p>
                    <p className="font-medium">{event.event_date} at {event.event_time}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{event.location}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Tabs defaultValue="details">
              <TabsList className="mb-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold mb-2">About This Event</h2>
                  <p className="whitespace-pre-line">{event.description}</p>
                </div>
              </TabsContent>
              
              <TabsContent value="schedule" className="space-y-4">
                <p className="text-muted-foreground">No detailed schedule available for this event.</p>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <div className="mb-4">
                <p className="text-2xl font-bold">{event.price} FCFA</p>
                <p className="text-sm text-muted-foreground">per person</p>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {event.capacity - (event.registered_attendees || 0)} of {event.capacity} spots left
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Registration closes on event day
                  </span>
                </div>
              </div>
              
              <Button 
                className="w-full mb-3"
                onClick={handleRegistration}
              >
                Register Now
              </Button>
              
              <p className="text-xs text-center text-muted-foreground">
                Secure payment via MTN Mobile Money or Orange Money
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
