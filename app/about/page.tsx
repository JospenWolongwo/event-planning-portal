"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Shield, Clock, Calendar, Trophy, Sparkles } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function AboutPage() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const stats = [
    { number: "50K+", label: "Happy Attendees", icon: Users },
    { number: "1000+", label: "Successful Events", icon: Calendar },
    { number: "100+", label: "Cities", icon: MapPin },
    { number: "24/7", label: "Support", icon: Clock },
  ];

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-b from-primary/10 via-background to-background">
        <div className="container">
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeIn}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Our Mission</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Making event discovery and attendance in Cameroon seamless, exciting, and accessible
              for everyone.
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" asChild>
                <a href="#team">Meet Our Team</a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="/contact">Contact Us</a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="p-6 text-center h-full flex flex-col items-center justify-center">
                  <stat.icon className="h-8 w-8 text-primary mb-4" />
                  <h3 className="text-3xl font-bold mb-1">{stat.number}</h3>
                  <p className="text-muted-foreground">{stat.label}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 bg-muted/50">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Event Portal was born from a simple observation: finding and attending great events in Cameroon was often challenging and disorganized.
                </p>
                <p>
                  Founded in 2025, we set out to create a platform that connects event organizers with attendees, making the entire experience seamless from discovery to attendance.
                </p>
                <p>
                  Today, we're proud to be Cameroon's leading event platform, helping thousands of people discover and attend events that match their interests and passions.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative h-[400px] rounded-lg overflow-hidden"
            >
              <img
                src="/images/about-story.jpg"
                alt="Event Portal team"
                className="object-cover w-full h-full"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Our Values</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              These core principles guide everything we do at Event Portal
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-center"
            >
              <div className="bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Trust & Safety</h3>
              <p className="text-muted-foreground">
                We verify all event organizers and prioritize attendee safety at every step.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-center"
            >
              <div className="bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Experiences</h3>
              <p className="text-muted-foreground">
                We curate high-quality events and ensure a seamless experience from registration to attendance.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="text-center"
            >
              <div className="bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Community Impact</h3>
              <p className="text-muted-foreground">
                We believe in the power of events to bring people together and create meaningful connections.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-16 bg-muted/50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The passionate people behind Event Portal
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {["Jospen Wolongwo", 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="text-center"
              >
                <Avatar className="w-32 h-32 mx-auto mb-4">
                  <AvatarImage src={`/images/team-${i}.jpg`} />
                  <AvatarFallback>TM</AvatarFallback>
                </Avatar>
                <h3 className="font-semibold text-lg">Team Member {i}</h3>
                <p className="text-muted-foreground">Co-Founder</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
