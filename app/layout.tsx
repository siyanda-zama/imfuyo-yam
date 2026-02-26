import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});
export const metadata: Metadata = {
  metadataBase: new URL('https://herd-guard.vercel.app'),
  title: 'HerdGuard — Smart Livestock Protection',
  description: 'Smart GPS livestock tracking and protection for South African farmers.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'HerdGuard',
  },
  icons: {
    icon: '/favicon-32.png',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'HerdGuard — Smart Livestock Protection',
    description: 'Smart GPS livestock tracking and protection for South African farmers.',
    siteName: 'HerdGuard',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'HerdGuard' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HerdGuard — Smart Livestock Protection',
    description: 'Smart GPS livestock tracking and protection for South African farmers.',
    images: ['/og-image.png'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0A1628',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={jakarta.variable}>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <link
          href="https://api.mapbox.com/mapbox-gl-js/v3.4.0/mapbox-gl.css"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="app-shell">{children}</div>
      </body>
    </html>
  );
}
