import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Public_Sans } from 'next/font/google'
import { ReliefProvider } from '@/lib/store'
import './globals.css'

const publicSans = Public_Sans({
  subsets: ['latin'],
  variable: '--font-public-sans',
})

export const metadata: Metadata = {
  title: {
    default: 'Helping Hands | Disaster relief coordination for India',
    template: '%s | Helping Hands',
  },
  description:
    'Helping Hands helps individuals and organisations see which communities in India are affected by disasters, understand verified supply needs, and coordinate pledges and deliveries. No Need Too Big, No Help Too Far.',
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#0f5a6b',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={publicSans.variable}>
      <body className="antialiased">
        <ReliefProvider>{children}</ReliefProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
