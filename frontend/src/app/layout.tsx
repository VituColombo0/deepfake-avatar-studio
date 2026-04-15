import './globals.css'
import type { Metadata } from 'next'

// Next.js recommended fonts
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Deepfake Avatar Studio',
  description: 'Crie avatares fotorrealistas e utilize para deepfake em tempo real',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`${inter.className} dark bg-dark-900`}>
      <body className="min-h-screen text-foreground antialiased selection:bg-primary-light selection:text-dark-900">
        <main className="flex min-h-screen flex-col">
          {children}
        </main>
      </body>
    </html>
  )
}
