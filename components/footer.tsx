'use client'

import Link from 'next/link'
import { Calendar, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react'
import { BsCalendarEvent } from 'react-icons/bs'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full border-t bg-background">
      <div className="container py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div className="flex flex-col gap-2">
            <Link href="/" className="flex items-center space-x-2">
              <BsCalendarEvent className="h-6 w-6" />
              <span className="font-bold">Event Portal</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Your comprehensive event planning platform
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/events" className="text-muted-foreground hover:text-primary">
                  Browse Events
                </Link>
              </li>
              <li>
                <Link href="/create-event" className="text-muted-foreground hover:text-primary">
                  Create Event
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-primary">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-muted-foreground hover:text-primary">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">Connect With Us</h3>
            <div className="flex space-x-4">
              <Link
                href="https://facebook.com/eventportal"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary"
              >
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link
                href="https://twitter.com/eventportal"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary"
              >
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link
                href="https://instagram.com/eventportal"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary"
              >
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link
                href="https://linkedin.com/company/eventportal"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary"
              >
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Email: support@eventportal.com</p>
              <p className="text-sm text-muted-foreground">Phone: +237 678 901 234</p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 border-t pt-6">
          <p className="text-center text-xs text-muted-foreground">
            &copy; {currentYear} Event Portal. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}