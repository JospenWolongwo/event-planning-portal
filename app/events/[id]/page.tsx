"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Calendar,
  Users,
  Clock,
  ArrowLeft,
  Share2,
  Heart,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CURATED_EVENT_IMAGES } from "@/lib/utils/unsplash";
import Image from "next/image";
import { useSupabase } from "@/providers/SupabaseProvider";
import { toast } from "sonner";
import { RegistrationModal } from "../registration-modal";
import { Event } from "@/lib/types";
import { format } from "date-fns";

export default function EventDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { supabase, user } = useSupabase();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [registrationModalOpen, setRegistrationModalOpen] = useState(false);
  const [registeredAttendees, setRegisteredAttendees] = useState(0);

  // Fetch event data from Supabase
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);

        // Fetch the event details
        const { data: eventData, error } = await supabase
          .from("events")
          .select(
            `
            id, title, description, location, 
            event_date, event_time, price, capacity, 
            image_url, category, organizer_id, 
            profiles(id, full_name, avatar_url)
          `
          )
          .eq("id", params.id)
          .single();

        if (error) {
          throw error;
        }

        if (!eventData) {
          router.push("/events");
          return;
        }

        // Get number of registrations for this event
        const { count: registrationsCount, error: countError } = await supabase
          .from("event_registrations")
          .select("*", { count: "exact", head: true })
          .eq("event_id", params.id);

        // Format the event data
        const formattedEvent = {
          ...eventData,
          organizer: eventData.profiles,
          // Use a default image if none is provided
          image_url:
            eventData.image_url ||
            CURATED_EVENT_IMAGES[
              Math.floor(Math.random() * CURATED_EVENT_IMAGES.length)
            ],
        };

        setEvent(formattedEvent);
        setRegisteredAttendees(registrationsCount || 0);

        // Check if user has favorited this event
        if (user) {
          const { data: favoriteData } = await supabase
            .from("user_favorites")
            .select("id")
            .eq("user_id", user.id)
            .eq("event_id", params.id)
            .single();

          setIsFavorite(!!favoriteData);
        }
      } catch (error) {
        console.error("Error fetching event:", error);
        toast.error("Failed to load event details");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [supabase, params.id, router, user]);

  const handleRegistration = () => {
    if (!user) {
      // Redirect to login if user is not authenticated
      router.push(`/auth?redirect=/events/${params.id}`);
      return;
    }

    setRegistrationModalOpen(true);
  };

  const handleFavoriteToggle = async () => {
    if (!user) {
      router.push(`/auth?redirect=/events/${params.id}`);
      return;
    }

    try {
      if (isFavorite) {
        // Remove from favorites
        await supabase
          .from("user_favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("event_id", params.id);

        toast.success("Removed from favorites");
      } else {
        // Add to favorites
        await supabase.from("user_favorites").insert({
          user_id: user.id,
          event_id: params.id,
        });

        toast.success("Added to favorites");
      }

      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error("Error updating favorites:", error);
      toast.error("Failed to update favorites");
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: event?.title || "Event Details",
          text: `Check out this event: ${event?.title}`,
          url: window.location.href,
        });
      } else {
        // Fallback for browsers that don't support the Web Share API
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  // Format date and time for display
  const formatEventDateTime = (date?: string, time?: string) => {
    if (!date) return "Date TBD";

    try {
      const formattedDate = format(new Date(date), "MMMM d, yyyy");
      const formattedTime = time
        ? format(new Date(`2000-01-01T${time}`), "h:mm a")
        : "Time TBD";
      return `${formattedDate} at ${formattedTime}`;
    } catch (error) {
      console.error("Date formatting error:", error);
      return `${date} at ${time || "Time TBD"}`;
    }
  };

  // Handle registration completion
  const handleRegistrationComplete = () => {
    // Refresh attendee count
    const updateAttendees = async () => {
      const { count } = await supabase
        .from("event_registrations")
        .select("*", { count: "exact", head: true })
        .eq("event_id", params.id);

      setRegisteredAttendees(count || 0);
    };

    updateAttendees();
  };

  if (loading) {
    return (
      <div className="container py-12 flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg">Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Event Not Found</h2>
        <p className="mb-6">
          The event you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => router.push("/events")}>
          Browse All Events
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Events
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg">
            <Image
              src={event.image_url || CURATED_EVENT_IMAGES[0]}
              alt={event.title || "Event"}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4">
              <Badge className="bg-primary text-primary-foreground">
                {event.category}
              </Badge>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="outline">{event.category || "Event"}</Badge>
              <Badge variant="secondary">
                {event.capacity - (event.registered_attendees || 0)} spots left
              </Badge>
            </div>

            <h1 className="text-3xl font-bold mb-2">{event.title}</h1>

            <div className="flex items-center gap-2 mb-6">
              <Avatar className="h-6 w-6">
                <AvatarImage
                  src={event.organizer?.avatar_url || ""}
                  alt="Organizer"
                />
                <AvatarFallback>
                  {event.organizer?.full_name?.charAt(0) || "O"}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">
                Organized by {event.organizer?.full_name || "Event Organizer"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date & Time</p>
                    <p className="font-medium">
                      {formatEventDateTime(event.event_date, event.event_time)}
                    </p>
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
                  <h2 className="text-xl font-semibold mb-2">
                    About This Event
                  </h2>
                  <p className="whitespace-pre-line">{event.description}</p>
                </div>
              </TabsContent>

              <TabsContent value="schedule" className="space-y-4">
                <p className="text-muted-foreground">
                  No detailed schedule available for this event.
                </p>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <div className="mb-4">
                <p className="text-2xl font-bold">
                  {event.price ? `${event.price} FCFA` : "Free"}
                </p>
                {event.price > 0 && (
                  <p className="text-sm text-muted-foreground">per person</p>
                )}
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {event.capacity && registeredAttendees <= event.capacity
                      ? `${event.capacity - registeredAttendees} of ${
                          event.capacity
                        } spots left`
                      : "Unlimited capacity"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Registration closes on event day</span>
                </div>
              </div>

              <Button className="w-full mb-3" onClick={handleRegistration}>
                Register Now
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Secure payment via MTN Mobile Money or Orange Money
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Registration Modal */}
      <RegistrationModal
        isOpen={registrationModalOpen}
        onClose={() => setRegistrationModalOpen(false)}
        event={event}
        onRegistrationComplete={handleRegistrationComplete}
      />
    </div>
  );
}
