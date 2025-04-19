import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/app/providers'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { SupabaseProvider } from '@/providers/SupabaseProvider'
import { ChatProvider } from '@/providers/ChatProvider'
import PWAPrompts from '@/components/pwa/PWAPrompts'
import { Analytics } from '@vercel/analytics/react'

export const viewport = {
  themeColor: '#28C496',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: 'Event Portal - Your Comprehensive Event Planning Platform',
  description: 'Discover, plan, and attend amazing events with our comprehensive event management platform.',
  applicationName: 'Event Portal',
  appleWebApp: {
    capable: true,
    title: 'Event Portal',
    statusBarStyle: 'default',
  },
  formatDetection: {
    telephone: false,
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      {
        url: '/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png'
      },
      {
        url: '/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png'
      }
    ],
    apple: [
      { url: '/apple-touch-icon.png' },
      { url: '/apple-icon-180x180.png', sizes: '180x180', type: 'image/png' },
      { url: '/apple-icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/apple-icon-120x120.png', sizes: '120x120', type: 'image/png' }
    ]
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Event Portal" />
        <meta name="theme-color" content="#28C496" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className="h-full font-sans">
        <SupabaseProvider>
          <ChatProvider>
            <Providers>
              <div className="relative flex min-h-screen flex-col">
                <PWAPrompts />
                <Navbar />
                <main className="flex-1">{children}</main>
                <Footer />
                <Analytics />
              </div>
            </Providers>
          </ChatProvider>
        </SupabaseProvider>
      </body>
    </html>
  )
}