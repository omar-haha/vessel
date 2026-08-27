import type { Metadata } from 'next'
import { Inter, Orbitron } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { CartProvider } from '@/components/providers/CartProvider'
import { SmoothScrollProvider } from '@/components/providers/SmoothScrollProvider'
import { PageTransitionProvider } from '@/components/providers/PageTransitionProvider'
import { LanguageProvider } from '@/components/providers/LanguageProvider'
import { Analytics } from '@/components/Analytics'
import { DemoBanner } from '@/components/ui/DemoBanner'
import { BRAND } from '@/config/brand'

const inter = Inter({ subsets: ['latin'] })
const orbitron = Orbitron({ subsets: ['latin'], variable: '--font-orbitron' })

const titleFull = `${BRAND.name} | ${BRAND.tagline}`

export const metadata: Metadata = {
  metadataBase: new URL(BRAND.url),
  title: {
    default: titleFull,
    template: `%s | ${BRAND.name}`,
  },
  description: BRAND.description,
  keywords: [...BRAND.keywords],
  openGraph: {
    title: titleFull,
    description: BRAND.description,
    type: 'website',
    url: '/',
    siteName: BRAND.name,
  },
  twitter: {
    card: 'summary_large_image',
    title: titleFull,
    description: BRAND.description,
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND.name,
    url: BRAND.url,
    logo: `${BRAND.url}/icon.svg`,
    email: BRAND.supportEmail,
    contactPoint: {
      "@type": "ContactPoint",
      email: BRAND.supportEmail,
      contactType: "customer service",
    },
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('rc_theme');document.documentElement.setAttribute('data-theme',t||'light');}catch(e){}`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className={`${inter.className} ${orbitron.variable} antialiased min-h-screen flex flex-col`}>
        <ThemeProvider>
          <LanguageProvider>
            {/* Inside LanguageProvider — both banners are localised. */}
            <DemoBanner />
            <Analytics />
            <CartProvider>
              <SmoothScrollProvider>
                <PageTransitionProvider>
                  {children}
                </PageTransitionProvider>
              </SmoothScrollProvider>
            </CartProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
