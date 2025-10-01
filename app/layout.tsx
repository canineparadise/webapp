import type { Metadata } from 'next'
import './globals.css'
import AnnouncementBanner from '@/components/AnnouncementBanner'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'Canine Paradise - Premier Doggy Day Care in the UK',
  description: 'Professional and loving doggy day care services. Your furry friends deserve paradise!',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <AnnouncementBanner />
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a3a52',
              color: '#fff',
            },
          }}
        />
      </body>
    </html>
  )
}