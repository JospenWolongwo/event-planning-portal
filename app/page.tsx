'use client'

import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { MapPin, Calendar, Phone, Shield, CreditCard, MessageSquare, Star, Users, Clock, ChevronRight, Music, Ticket } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'

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
      {/* Hero Section with Background Video/Image */}
      <section className="relative h-[90vh] flex items-center justify-center bg-gradient-to-r from-primary to-primary-foreground overflow-hidden">
        <div className="absolute inset-0 bg-black/50 z-10" />
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/hero-background.mp4" type="video/mp4" />
        </video>
        
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
              onClick={() => router.push('/admin/events')}
            >
              Create an Event
            </Button>
          </div>
        </motion.div>
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
                image: "/images/events/tech-conference.jpg"
              },
              {
                title: "Music Festival",
                location: "Yaoundé",
                date: "June 10, 2025",
                price: "4000",
                category: "Festival",
                image: "/images/events/music-festival.jpg"
              },
              {
                title: "Startup Networking",
                location: "Buea",
                date: "May 22, 2025",
                price: "3500",
                category: "Networking",
                image: "/images/events/startup-networking.jpg"
              }
            ].map((event, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                className="group cursor-pointer"
                onClick={() => router.push('/events')}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-48 bg-muted relative">
                    {event.image ? (
                      <div className="h-full w-full">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                        <img 
                          src={event.image} 
                          alt={event.title} 
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Calendar className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
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