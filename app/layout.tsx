import 'css/tailwind.scss'

import NeueMontreal from '@/resources/fonts/neue-montreal'

// import { Analytics, AnalyticsConfig } from 'pliny/analytics'
import Footer from '@/components/Footer'
import siteMetadata from '@/data/siteMetadata'
import { Metadata } from 'next'
import Nav from '@/components/Nav'

import { Space_Grotesk } from 'next/font/google'
import Main from './Main'
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
})

export const metadata: Metadata = {
  metadataBase: new URL(siteMetadata.siteUrl),
  title: {
    default: siteMetadata.title,
    template: `%s | ${siteMetadata.title}`,
  },
  description: siteMetadata.description,
  openGraph: {
    title: siteMetadata.title,
    description: siteMetadata.description,
    url: './',
    siteName: siteMetadata.title,
    images: [siteMetadata.socialBanner],
    locale: 'en_US',
    type: 'website',
  },
  alternates: {
    canonical: './',
    types: {
      'application/rss+xml': `${siteMetadata.siteUrl}/feed.xml`,
    },
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
  twitter: {
    title: siteMetadata.title,
    card: 'summary_large_image',
    images: [siteMetadata.socialBanner],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang={siteMetadata.language}
      className={`${NeueMontreal.className} ${spaceGrotesk.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <link rel="apple-touch-icon" sizes="76x76" href="/static/favicons/logo.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/static/favicons/logo.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/static/favicons/logo.png" />
      <link rel="manifest" href="/static/favicons/site.webmanifest" />
      <link rel="alternate" type="application/rss+xml" href="/feed.xml" />
      <body className="bg-primary-100 text-primary-900 antialiased">
        {/* <Analytics analyticsConfig={siteMetadata.analytics as AnalyticsConfig} /> */}
        <section className="h-screen w-full">
          <div className="flex h-full  flex-col  lg:flex-row">
            <Nav />
            <Main>
              {children} <Footer />
            </Main>
          </div>
        </section>
      </body>
    </html>
  )
}
