import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI-GAMNET',
  description: 'AI-GAMNET is a community that conducts various events including the IndabaX as our flagship event',
  keywords: ['IndabaX', 'AIGAMNET', 'AI', 'Deep Learning', 'Conference', 'Gambia', 'Machine Learning'],
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-white">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  )
}
