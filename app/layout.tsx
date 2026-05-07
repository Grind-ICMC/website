import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Grind ICMC - Prepare-se para Big Tech',
  description: 'Grupo de extensão do ICMC-USP focado em preparação técnica para entrevistas de computação com práticas semanais, mock interviews e produção de conteúdo.',
  generator: 'v0.app',
  keywords: ['ICMC', 'USP', 'Big Tech', 'interviews', 'coding', 'LeetCode', 'preparation'],
  authors: [{ name: 'Grind ICMC' }],
  icons: {
    icon: '/favicon.svg',
  },
}

export const viewport: Viewport = {
  themeColor: '#0c1220',
  width: 'device-width',
  initialScale: 1,
}

import { Providers } from "@/components/providers"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="bg-background">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          {children}
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </Providers>
      </body>
    </html>
  )
}
