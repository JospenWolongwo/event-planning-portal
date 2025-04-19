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
  - Advanced filtering by category, date, and price range
  - Full-text search for events
  - View event details and organizer information
  - Loading states with skeleton UI for better user experience

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
- **Authentication**: Supabase Auth (Phone OTP-based)
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
   - Fill in the following required variables:
   ```
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Application Configuration
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   NEXT_PUBLIC_APP_NAME="Event Portal"
   
   # Payment Gateway Configuration (for production)
   NEXT_PUBLIC_MOMO_API_KEY=your_momo_api_key
   NEXT_PUBLIC_ORANGE_MONEY_MERCHANT_ID=your_merchant_id
   
   # Additional services (optional for development)
   NEXT_PUBLIC_MAPS_API_KEY=your_google_maps_api_key
   ```

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

The app uses Phone OTP (One-Time Password) based authentication:

1. **Test Credentials**: 
   - Phone Number: 698805890
   - OTP Code: 110011

2. **OTP Authentication Flow**:
   - Enter your phone number on the login page
   - You'll receive a 6-digit OTP code (use 110011 for testing)
   - Enter the OTP to authenticate

Once authenticated, you can access the admin dashboard through the user dropdown menu in the navigation bar or by visiting `/admin`.

### Admin Features Available to All Authenticated Users

- Create, edit, and delete events
- Upload event images
- Manage event details
- View registrations

This simplified access model is specifically for this testing/demo version to allow interviewers and testers to easily evaluate the application's functionality.

## Payment Testing

The application integrates a fully functional payment system for event registrations.

### Testing the Payment System

1. **Register for an Event**
   - Browse to any event and click the 'Register Now' button
   - If not logged in, you'll be redirected to login first
   - Select the number of attendees
   - Click 'Continue to Payment'

2. **Choose Payment Method**
   - Select between MTN Mobile Money and Orange Money
   - Enter a valid phone number in the format shown below
   - Click 'Pay Now'

3. **Complete Payment**
   - The payment will be processed in test mode
   - No actual charges will be made
   - You'll receive a confirmation message when payment is successful

### Mobile Money Test Numbers

For **MTN Mobile Money** testing:
- **Phone Number Format**: +237 65XXXXXXX (e.g., +237 650123456)
- All payments will automatically succeed in test mode
- No actual OTP verification is required

For **Orange Money** testing:
- **Phone Number Format**: +237 69XXXXXXX (e.g., +237 690123456)
- All payments will automatically succeed in test mode
- No actual validation is performed

### Payment Receipt

After successful payment, you will:
- Receive a confirmation page
- Be able to view your event registration in your account
- See the registered event in your 'My Events' section

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

## Favicon

To add a custom favicon to the application:

1. Create your favicon.ico file (typically 32x32 pixels)
2. Place it in the `public` directory at the root of the project
3. Next.js will automatically detect and use this file as the favicon

You can also add additional icon sizes and formats in the public directory:
- apple-touch-icon.png (180x180 pixels) for iOS devices
- favicon-16x16.png and favicon-32x32.png for different device resolutions
- site.webmanifest for PWA configuration

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
- **providers/**: Context providers (Supabase, Theme, Authentication)
- **public/**: Static assets
- **styles/**: Global styles and Tailwind configuration

### Authentication Flow

The application uses a dual authentication system:

1. **Supabase Authentication**: Provides secure, production-ready authentication via phone OTP
2. **Custom Auth Hook**: Implemented with Zustand for state management and persistence

For development and testing, all authenticated users can access admin features to facilitate easier testing.

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

- Email: jospenwolongwo@gmail.com
- Phone: +237 678 901 234

## Recent Updates

- Added advanced event filtering and search functionality
- Implemented skeleton loading states for improved UX
- Fixed authentication state synchronization issues
- Enhanced admin access for testing purposes
- Added data persistence with caching

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.io/)
- [TailwindCSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Vercel](https://vercel.com/)
