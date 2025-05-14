import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { Providers } from './providers'
import '@/styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Astrology AI Copilot',
  description: 'AI-powered astrological guide integrating ancient wisdom with modern technology',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta name="theme-color" content="#111827" />
        </head>
        <body className={inter.className}>
          <Providers>
            <div id="main-content" className="min-h-screen bg-dark-void text-starlight-white">
              {children}
            </div>
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  )
}