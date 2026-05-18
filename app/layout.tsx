import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { absoluteUrl, siteConfig } from "@/lib/site"

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: siteConfig.url,
  applicationName: siteConfig.name,
  title: {
    default: 'Grind ICMC | Preparação para entrevistas técnicas',
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    'Grind ICMC',
    'ICMC USP',
    'grupo de extensão USP',
    'entrevistas técnicas',
    'coding interview',
    'Big Tech',
    'algoritmos',
    'LeetCode',
    'System Design',
    'carreira em tecnologia',
  ],
  authors: [{ name: 'Grind ICMC' }],
  creator: 'Grind ICMC',
  publisher: 'Grind ICMC',
  alternates: {
    canonical: absoluteUrl('/'),
  },
  openGraph: {
    title: 'Grind ICMC | Preparação para entrevistas técnicas',
    description: siteConfig.description,
    url: absoluteUrl('/'),
    siteName: siteConfig.name,
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Grind ICMC | Preparação para entrevistas técnicas',
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
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
        </Providers>
      </body>
    </html>
  )
}
