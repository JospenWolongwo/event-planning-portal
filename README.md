# Event Portal

A comprehensive event management platform built with Next.js 14, Supabase, and TypeScript.

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

- **Frontend**: Next.js 14, React 18, TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth (Email-based)
- **Storage**: Supabase Storage
- **Payments**: MTN Mobile Money, Orange Money, Credit Card integration
- **Analytics**: Vercel Analytics
- **PWA Support**: Full Progressive Web App capabilities

## Getting Started

### Prerequisites

- Node.js (v20.11.1 or higher)
- npm (v10.2.4 or higher)
- Supabase account
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
   ```

3. Set up environment variables:
   - Copy `.env.local.example` to `.env.local`
   - Fill in your Supabase URL and anon key
   - Add other required API keys as needed

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Database Setup

1. Create a new Supabase project
2. Run the migration scripts in the `supabase/migrations` folder
3. Set up storage buckets for event images and user avatars
4. Configure Row Level Security (RLS) policies for secure data access

## Authentication

### For Testing/Development

**Important**: For ease of testing, **all authenticated users** can access admin features!

The app provides two simple options for authentication:

1. **Test Mode**: Click the 'Test Application' button on the login page to instantly access the app without email verification.

2. **Email Authentication**: Enter your email to receive a magic link (for standard authentication flow testing).

Once authenticated, you can access the admin dashboard through the user dropdown menu in the navigation bar or by visiting `/admin`.

### Admin Features Available to All Authenticated Users

- Create, edit, and delete events
- Upload event images
- Manage event details
- View registrations

This simplified access model is specifically for this testing/demo version to allow interviewers and testers to easily evaluate the application's functionality.

## Payment Testing

The application supports multiple payment methods for testing:

### Credit Card Testing

Use the following test card details:
- **Card Number**: 4242 4242 4242 4242
- **Expiry Date**: Any future date (e.g., 12/25)
- **CVC**: Any 3 digits (e.g., 123)
- **Name**: Any name

### Mobile Money Testing

For MTN Mobile Money testing:
- **Phone Number**: +237 650000000
- **OTP Code**: 123456

For Orange Money testing:
- **Phone Number**: +237 690000000
- **OTP Code**: 123456

## Event Media Handling

Event images are stored in Supabase Storage with the following specifications:

1. **Image Storage**: 
   - All event images are stored in the `event-images` bucket in Supabase
   - User avatars are stored in the `avatars` bucket

2. **Image Optimization**:
   - Images are automatically optimized using Next.js Image component
   - Supported formats: JPEG, PNG, WebP
   - Maximum upload size: 5MB

3. **Image Requirements**:
   - Event cover images: 1200x630px (16:9 ratio) recommended
   - Event gallery images: 800x800px (1:1 ratio) recommended
   - User avatars: 400x400px (1:1 ratio) recommended

4. **Implementation**:
   - Use the `EventMediaUploader` component for uploading event images
   - Images are processed and resized on the client before uploading
   - CDN caching is enabled for faster loading

## Deployment

This project can be deployed to Vercel, Netlify, or any other platform that supports Next.js applications.

1. Connect your repository to your preferred deployment platform
2. Set up the required environment variables
3. Deploy the application

### Vercel Deployment (Recommended)

```bash
npm install -g vercel
vercel login
vercel
```

## Development Guidelines

### Code Structure

- **app/**: Next.js 14 App Router pages and layouts
- **components/**: Reusable UI components
- **lib/**: Utility functions and services
- **hooks/**: Custom React hooks
- **providers/**: Context providers
- **public/**: Static assets
- **styles/**: Global styles and Tailwind configuration

### State Management

- React Context API for global state
- React Query for server state
- Local state with useState and useReducer

### Testing

Run tests with:
```bash
npm run test
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

- Email: support@eventportal.com
- Phone: +237 678 901 234

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.io/)
- [TailwindCSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Vercel](https://vercel.com/)
