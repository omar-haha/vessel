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

const inter = Inter({ subsets: ['latin'] })
const orbitron = Orbitron({ subsets: ['latin'], variable: '--font-orbitron' })

export const metadata: Metadata = {
  metadataBase: new URL('https://vesselwellness.example'),
  title: {
    default: 'VESSEL | Third-Party Tested Supplements',
    template: '%s | VESSEL',
  },
  description: 'Protein, performance, and wellness supplements with a Certificate of Analysis for every batch. Shipped Canada-wide in protective packaging.',
  keywords: ['supplements', 'protein', 'pre-workout', 'vitamins', 'creatine', 'Canada', 'third-party tested', 'nutraceuticals'],
  openGraph: {
    title: 'VESSEL | Third-Party Tested Supplements',
    description: 'Protein, performance, and wellness supplements with a Certificate of Analysis for every batch. Shipped Canada-wide in protective packaging.',
    type: 'website',
    url: '/',
    siteName: 'VESSEL',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VESSEL | Third-Party Tested Supplements',
    description: 'Protein, performance, and wellness supplements with a Certificate of Analysis for every batch. Shipped Canada-wide in protective packaging.',
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
    name: "VESSEL",
    url: "https://vesselwellness.example",
    logo: "https://vesselwellness.example/icon.svg",
    email: "support@vesselwellness.example",
    contactPoint: {
      "@type": "ContactPoint",
      email: "support@vesselwellness.example",
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
