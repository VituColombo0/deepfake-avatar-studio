import './globals.css'
import type { Metadata } from 'next'

// Next.js recommended fonts
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Deepfake Avatar Studio',
  description: 'Crie avatares fotorrealistas e utilize para deepfake em tempo real',
}

import Link from 'next/link';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`${inter.className} dark bg-dark-900`}>
      <body className="min-h-screen text-foreground antialiased selection:bg-primary-light selection:text-dark-900">
        
        {/* Navegação Global Moderna */}
        <nav className="fixed top-0 w-full z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                 <div className="flex items-center gap-4">
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-500">
                      AvatarStudio AI
                    </span>
                 </div>
                 <div className="flex gap-6">
                    <Link href="/studio" className="text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200">
                      Estúdio
                    </Link>
                    <Link href="/gallery" className="text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200">
                      Galeria
                    </Link>
                    <Link href="/stream" className="text-sm font-medium text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                      Webcam Stream
                    </Link>
                 </div>
              </div>
            </div>
        </nav>

        <main className="flex min-h-screen flex-col pt-20">
          {children}
        </main>
      </body>
    </html>
  )
}
