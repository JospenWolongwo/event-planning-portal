# Event Portal

A comprehensive event management platform built with Next.js, Supabase, and TypeScript.

## Overview

Event Portal is a full-featured event management system that allows:
- Organizers to create and manage events
- Users to discover and register for events
- Secure payment processing for event tickets
- User profile management and event history

## Features

- **Event Management**
  - Create, edit, and delete events
  - Upload event images
  - Set event capacity and pricing
  - Track registrations

- **Event Discovery**
  - Browse upcoming events
  - Filter by category, location, and price
  - Search for specific events
  - View event details and organizer information

- **Registration System**
  - Multi-step registration process
  - Select number of attendees
  - Process payments securely
  - Receive confirmation codes

- **Admin Dashboard**
  - Manage events and organizers
  - View platform analytics
  - Handle user management
  - Configure platform settings

- **User Profiles**
  - View registration history
  - Manage personal information
  - Upload profile pictures

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth (Phone-based)
- **Storage**: Supabase Storage
- **Payments**: MTN Mobile Money, Orange Money integration
- **Notifications**: SMS via Twilio

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account
- Twilio account (for SMS)
- Payment gateway accounts (for production)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/event-portal.git
   cd event-portal
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   - Copy `.env.local.example` to `.env.local`
   - Fill in your Supabase URL and anon key
   - Add other required API keys as needed

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Database Setup

1. Create a new Supabase project
2. Run the migration scripts in the `supabase/migrations` folder
3. Set up storage buckets for event images and user avatars

## Deployment

This project can be deployed to Vercel, Netlify, or any other platform that supports Next.js applications.

1. Connect your repository to your preferred deployment platform
2. Set up the required environment variables
3. Deploy the application

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.io/)
- [TailwindCSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
