import type { Metadata, Viewport } from 'next'
import { ThemeProvider, UnitProvider, AuthProvider } from '@/contexts'
import PWAInitializer from '@/components/pwa/PWAInitializer'
import './globals.css'

export const metadata: Metadata = {
  title: 'REPPIT - Strength Tracker',
  description: 'Track your reps, build your strength. Progress tracking for compound lifts.',
  applicationName: 'REPPIT',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'REPPIT'
  },
  other: {
    'mobile-web-app-capable': 'yes'
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased transition-colors workout-bg" suppressHydrationWarning>
        <PWAInitializer />
        <AuthProvider>
          <ThemeProvider>
            <UnitProvider>
              {children}
            </UnitProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
