import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { BRAND } from '@/lib/brand'

const sans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
})

const mono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
})

const description =
  'Kaydırdıkça ilerleyen, içinde 360° dönebildiğin sinematik interaktif kısa hikâyeler: TEKERRÜR, EMANET, ÖFKE NÖBETİ, YAŞAMAK, KALAN, EŞİK. Scroll-driven cinematic short stories you can turn around inside. Powered by MeMoDe.'

const site =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000')

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: 'STROLLY — Hikâyeler',
  description,
  applicationName: 'STROLLY',
  authors: [{ name: BRAND.owner, url: BRAND.studioUrl }],
  creator: BRAND.studio,
  publisher: BRAND.studio,
  openGraph: {
    title: 'STROLLY — Hikâyeler',
    description,
    type: 'website',
    locale: 'tr_TR',
    images: [{ url: '/og/strolly', width: 1200, height: 630, alt: 'STROLLY' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'STROLLY — Hikâyeler',
    description,
    images: ['/og/strolly'],
  },
}

export const viewport: Viewport = {
  themeColor: '#050505',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="tr" className={`${sans.variable} ${mono.variable}`}>
      <body>
        {children}
        <noscript>
          <style>{'.strolly,.skip-link{display:none}.transcript{position:static!important;clip-path:none!important;width:auto!important;height:auto!important;margin:0 auto!important;padding:12vh 24px!important;max-width:40rem!important;overflow:visible!important}'}</style>
        </noscript>
      </body>
    </html>
  )
}
