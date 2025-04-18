'use client'

import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { MapPin, Calendar, Phone, Shield, CreditCard, MessageSquare, Star, Users, Clock, ChevronRight, Music, Ticket } from 'lucide-react'
import { BsCalendarEvent, BsPeople, BsGeoAlt, BsStars, BsMusicNoteBeamed, BsCreditCard2Front } from 'react-icons/bs'
import { Card } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { CURATED_EVENT_IMAGES } from '@/lib/utils/unsplash'
import Image from 'next/image'
import { useState, useEffect } from 'react'

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.2
    }
  }
}

export default function Home() {
  const { user } = useAuth()
  const router = useRouter()

  return (
    <main className="min-h-screen">
      {/* Hero Section with Background Image */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-foreground z-0" /> {/* Fallback gradient */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop"
            alt="Event background"
            fill
            priority
            className="object-cover opacity-70"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/50" /> {/* Overlay for better text readability */}
        </div>
        
        <motion.div 
          className="container relative z-20 text-center text-white"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Discover Amazing Events
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
            Find and book the best events happening near you
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => router.push('/events')}
              className="bg-primary hover:bg-primary/90"
            >
              Browse Events
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="bg-white/10 hover:bg-white/20 border-white"
              onClick={() => router.push('/contact')}
            >
              Contact Us
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Event Carousel Section */}
      <section className="py-16 bg-background overflow-hidden">
        <div className="container">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.h2 
              variants={fadeIn}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Trending Events
            </motion.h2>
            <motion.p 
              variants={fadeIn}
              className="text-muted-foreground max-w-2xl mx-auto"
            >
              Don't miss out on these popular events happening soon
            </motion.p>
          </motion.div>

          <EventCarousel />
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-20 bg-muted">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Browse Event Categories</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover events that match your interests from a wide range of categories
            </p>
          </div>
          
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeIn} className="group">
              <Card className="p-6 text-center hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer h-full flex flex-col items-center justify-center">
                <BsCalendarEvent className="h-10 w-10 mb-4 group-hover:text-primary-foreground" />
                <h3 className="font-medium">Conferences</h3>
              </Card>
            </motion.div>
            
            <motion.div variants={fadeIn} className="group">
              <Card className="p-6 text-center hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer h-full flex flex-col items-center justify-center">
                <BsMusicNoteBeamed className="h-10 w-10 mb-4 group-hover:text-primary-foreground" />
                <h3 className="font-medium">Concerts</h3>
              </Card>
            </motion.div>
            
            <motion.div variants={fadeIn} className="group">
              <Card className="p-6 text-center hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer h-full flex flex-col items-center justify-center">
                <BsPeople className="h-10 w-10 mb-4 group-hover:text-primary-foreground" />
                <h3 className="font-medium">Workshops</h3>
              </Card>
            </motion.div>
            
            <motion.div variants={fadeIn} className="group">
              <Card className="p-6 text-center hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer h-full flex flex-col items-center justify-center">
                <BsGeoAlt className="h-10 w-10 mb-4 group-hover:text-primary-foreground" />
                <h3 className="font-medium">Exhibitions</h3>
              </Card>
            </motion.div>
            
            <motion.div variants={fadeIn} className="group">
              <Card className="p-6 text-center hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer h-full flex flex-col items-center justify-center">
                <BsStars className="h-10 w-10 mb-4 group-hover:text-primary-foreground" />
                <h3 className="font-medium">Festivals</h3>
              </Card>
            </motion.div>
            
            <motion.div variants={fadeIn} className="group">
              <Card className="p-6 text-center hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer h-full flex flex-col items-center justify-center">
                <BsCreditCard2Front className="h-10 w-10 mb-4 group-hover:text-primary-foreground" />
                <h3 className="font-medium">Seminars</h3>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-muted">
        <div className="container">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.h2 
              variants={fadeIn}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              How It Works
            </motion.h2>
            <motion.p 
              variants={fadeIn}
              className="text-muted-foreground max-w-2xl mx-auto"
            >
              Getting started with Event Portal is easy as 1-2-3
            </motion.p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                icon: <Calendar className="w-12 h-12" />,
                title: "Find Your Event",
                description: "Browse through our curated list of upcoming events"
              },
              {
                icon: <Ticket className="w-12 h-12" />,
                title: "Book Your Spot",
                description: "Secure your place with our simple registration process"
              },
              {
                icon: <Users className="w-12 h-12" />,
                title: "Enjoy the Experience",
                description: "Attend the event and create lasting memories"
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                className="bg-background p-8 rounded-lg shadow-lg text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-20">
        <div className="container">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.h2 
              variants={fadeIn}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Featured Events
            </motion.h2>
            <motion.p 
              variants={fadeIn}
              className="text-muted-foreground max-w-2xl mx-auto"
            >
              Discover our most popular upcoming events
            </motion.p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                title: "Tech Conference 2025",
                location: "Douala",
                date: "May 15, 2025",
                price: "5000",
                category: "Conference",
                image: CURATED_EVENT_IMAGES[0]
              },
              {
                title: "Music Festival",
                location: "Yaoundé",
                date: "June 10, 2025",
                price: "4000",
                category: "Festival",
                image: CURATED_EVENT_IMAGES[2]
              },
              {
                title: "Startup Networking",
                location: "Buea",
                date: "May 22, 2025",
                price: "3500",
                category: "Networking",
                image: CURATED_EVENT_IMAGES[8]
              }
            ].map((event, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                className="group cursor-pointer"
                onClick={() => router.push('/events')}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-48 relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                    <Image 
                      src={event.image}
                      alt={event.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105 duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 33vw"
                    />
                    <Badge className="absolute top-4 right-4 z-20">{event.category}</Badge>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">{event.title}</h3>
                    <div className="flex items-center text-muted-foreground mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="text-sm">{event.location}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground mb-4">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span className="text-sm">{event.date}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{event.price} FCFA</span>
                      <Button size="sm" variant="outline" className="group-hover:bg-primary group-hover:text-white transition-colors">
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
          <div className="text-center mt-10">
            <Button 
              onClick={() => router.push('/events')}
              variant="outline"
              className="group"
            >
              View All Events
              <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted">
        <div className="container">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.h2 
              variants={fadeIn}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Why Choose Event Portal
            </motion.h2>
            <motion.p 
              variants={fadeIn}
              className="text-muted-foreground max-w-2xl mx-auto"
            >
              The best platform for discovering and booking events
            </motion.p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                icon: <Shield className="w-6 h-6" />,
                title: "Secure Booking",
                description: "All transactions are protected and secure"
              },
              {
                icon: <CreditCard className="w-6 h-6" />,
                title: "Easy Payments",
                description: "Multiple payment options for your convenience"
              },
              {
                icon: <MessageSquare className="w-6 h-6" />,
                title: "Event Updates",
                description: "Get notifications about your registered events"
              },
              {
                icon: <Star className="w-6 h-6" />,
                title: "Verified Organizers",
                description: "All event organizers are verified for quality"
              }
            ].map((benefit, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                className="bg-background p-6 rounded-lg shadow-md"
              >
                <div className="flex items-center mb-4">
                  <div className="mr-4 p-2 bg-primary/10 rounded-full text-primary">
                    {benefit.icon}
                  </div>
                  <h3 className="font-semibold">{benefit.title}</h3>
                </div>
                <p className="text-muted-foreground text-sm">{benefit.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Discover Amazing Events?</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
              Join thousands of people who use Event Portal to discover and attend the best events
            </p>
            <Button 
              size="lg" 
              onClick={() => router.push('/events')}
              className="bg-white text-primary hover:bg-white/90"
            >
              Browse Events Now
            </Button>
          </motion.div>
        </div>
      </section>
    </main>
  )
}

// Event Carousel Component
function EventCarousel() {
  const [activeSlide, setActiveSlide] = useState(0);
  const router = useRouter();
  
  const carouselItems = [
    {
      id: "1",
      title: "Annual Tech Summit",
      description: "Join industry leaders for a day of innovation and networking",
      image: CURATED_EVENT_IMAGES[1],
      date: "June 15, 2025",
      location: "Douala Convention Center"
    },
    {
      id: "2",
      title: "Cultural Festival",
      description: "Experience the rich cultural heritage of Cameroon",
      image: CURATED_EVENT_IMAGES[3],
      date: "July 10, 2025",
      location: "Yaoundé Cultural Center"
    },
    {
      id: "3",
      title: "Business Workshop",
      description: "Learn essential skills for entrepreneurs and business leaders",
      image: CURATED_EVENT_IMAGES[5],
      date: "May 25, 2025",
      location: "Buea Tech Hub"
    }
  ];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % carouselItems.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [carouselItems.length]);
  
  return (
    <div className="relative">
      <div className="overflow-hidden rounded-xl">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${activeSlide * 100}%)` }}
        >
          {carouselItems.map((item, index) => (
            <div key={item.id} className="min-w-full">
              <div className="relative h-[400px] md:h-[500px] w-full">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                  priority={index === 0}
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
                  <h3 className="text-2xl md:text-3xl font-bold mb-2">{item.title}</h3>
                  <p className="mb-4 max-w-2xl">{item.description}</p>
                  <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 mr-2" />
                      <span>{item.date}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 mr-2" />
                      <span>{item.location}</span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => router.push(`/events/${item.id}`)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    View Event
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-center mt-4 gap-2">
        {carouselItems.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === activeSlide ? "bg-primary" : "bg-gray-300"
            }`}
            onClick={() => setActiveSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}