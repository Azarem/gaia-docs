import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'GaiaLabs Documentation',
    template: '%s | GaiaLabs Docs',
  },
  description: 'Comprehensive documentation for GaiaLabs ROM analysis tools, data structures, and assembly generation.',
  keywords: ['ROM analysis', 'SNES', 'assembly', 'data structures', 'game development'],
  authors: [{ name: 'GaiaLabs' }],
  creator: 'GaiaLabs',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://docs.gaialabs.studio',
    title: 'GaiaLabs Documentation',
    description: 'Comprehensive documentation for GaiaLabs ROM analysis tools',
    siteName: 'GaiaLabs Docs',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GaiaLabs Documentation',
    description: 'Comprehensive documentation for GaiaLabs ROM analysis tools',
    creator: '@gaialabs',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/android-chrome-192x192.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background font-sans antialiased`}>
        <div className="relative flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}




