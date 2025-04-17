'use client'

import { motion } from 'framer-motion'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Card } from '@/components/ui/card'
import { Shield, AlertTriangle, HelpCircle, PhoneCall, Mail, Clock, Calendar, Users, MapPin } from 'lucide-react'
import { BsWhatsapp } from 'react-icons/bs'

export default function AdvicePage() {
  const safetyTips = [
    {
      title: "Verify Event Details",
      content: "Always double-check event location, date, and time before attending. Confirm the organizer's information matches official channels.",
      icon: Shield,
    },
    {
      title: "Share Your Plans",
      content: "Let friends or family know which events you're attending, especially for evening events or those in unfamiliar locations.",
      icon: AlertTriangle,
    },
    {
      title: "Stay Aware of Surroundings",
      content: "At crowded events, keep your belongings secure and be mindful of your surroundings at all times.",
      icon: Shield,
    },
  ]

  const faqs = [
    {
      question: "How do I register for an event?",
      answer: "You can register for events by visiting our 'Events' page, selecting an event you're interested in, and clicking the 'Register' button. Follow the registration process and complete payment to secure your spot."
    },
    {
      question: "What happens if an event is cancelled?",
      answer: "If an event is cancelled, you'll be notified immediately and will receive a full refund of your registration fee. You'll also see alternative events you might be interested in."
    },
    {
      question: "How can I become an event organizer?",
      answer: "Visit the 'Create an Event' page to start organizing your own events. You'll need to provide valid identification and pass our verification process to ensure quality events on our platform."
    },
    {
      question: "Is my payment secure?",
      answer: "Yes, we use industry-standard encryption for all transactions. Your payment details are never stored on our servers."
    },
  ]

  return (
    <main className="min-h-screen py-20">
      {/* Safety Tips Section */}
      <section className="container mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">Event Safety & FAQ</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about attending events safely and getting the most out of your experience
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {safetyTips.map((tip, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="p-6 h-full flex flex-col">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-primary/10 rounded-full mr-4">
                    <tip.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">{tip.title}</h3>
                </div>
                <p className="text-muted-foreground flex-grow">{tip.content}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mb-20 bg-muted py-16 rounded-lg">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about using Event Portal
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </section>

      {/* Event Guidelines Section */}
      <section className="container mb-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4">Event Attendance Guidelines</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Follow these guidelines to ensure a smooth and enjoyable event experience
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="p-6 h-full">
              <h3 className="font-semibold text-lg flex items-center mb-4">
                <Clock className="mr-2 h-5 w-5 text-primary" />
                Before the Event
              </h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start">
                  <span className="bg-primary/10 text-primary rounded-full p-1 mr-3 mt-0.5">
                    <Calendar className="h-4 w-4" />
                  </span>
                  <span>Confirm the event date, time, and location a day before</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary/10 text-primary rounded-full p-1 mr-3 mt-0.5">
                    <Users className="h-4 w-4" />
                  </span>
                  <span>Check if there are any specific requirements or dress codes</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary/10 text-primary rounded-full p-1 mr-3 mt-0.5">
                    <MapPin className="h-4 w-4" />
                  </span>
                  <span>Plan your route to the venue and arrive early</span>
                </li>
              </ul>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="p-6 h-full">
              <h3 className="font-semibold text-lg flex items-center mb-4">
                <Shield className="mr-2 h-5 w-5 text-primary" />
                During the Event
              </h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start">
                  <span className="bg-primary/10 text-primary rounded-full p-1 mr-3 mt-0.5">
                    <AlertTriangle className="h-4 w-4" />
                  </span>
                  <span>Keep your registration confirmation and ID accessible</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary/10 text-primary rounded-full p-1 mr-3 mt-0.5">
                    <Shield className="h-4 w-4" />
                  </span>
                  <span>Follow all venue safety guidelines and instructions</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary/10 text-primary rounded-full p-1 mr-3 mt-0.5">
                    <HelpCircle className="h-4 w-4" />
                  </span>
                  <span>Know the location of emergency exits and first aid stations</span>
                </li>
              </ul>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="container">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4">Need More Help?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our support team is available to assist you with any questions or concerns
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col md:flex-row justify-center gap-6 max-w-3xl mx-auto"
        >
          <Card className="p-6 flex-1">
            <div className="flex items-center mb-4">
              <PhoneCall className="h-5 w-5 text-primary mr-2" />
              <h3 className="font-semibold">Call Us</h3>
            </div>
            <p className="text-muted-foreground mb-2">Available 24/7 for urgent matters</p>
            <p className="font-medium">+237 678 901 234</p>
          </Card>

          <Card className="p-6 flex-1">
            <div className="flex items-center mb-4">
              <Mail className="h-5 w-5 text-primary mr-2" />
              <h3 className="font-semibold">Email Support</h3>
            </div>
            <p className="text-muted-foreground mb-2">We'll respond within 24 hours</p>
            <p className="font-medium">support@eventportal.com</p>
          </Card>

          <Card className="p-6 flex-1">
            <div className="flex items-center mb-4">
              <BsWhatsapp className="h-5 w-5 text-primary mr-2" />
              <h3 className="font-semibold">WhatsApp</h3>
            </div>
            <p className="text-muted-foreground mb-2">Quick responses during business hours</p>
            <p className="font-medium">+237 678 901 234</p>
          </Card>
        </motion.div>
      </section>
    </main>
  )
}
