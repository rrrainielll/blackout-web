import './globals.css'
import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import Script from 'next/script'
import { prisma } from '@/lib/prisma'
import { Providers } from './providers'
import HeaderActions from '@/components/HeaderActions'
import { MobileMenuProvider } from '@/contexts/MobileMenuContext'
import RouteLoadingBar from '@/components/RouteLoadingBar'
import CookieConsent from '@/components/CookieConsent'
import Footer from '@/components/Footer'

export async function generateMetadata(): Promise<Metadata> {
    try {
        let settings = await prisma.settings.findFirst()

        return {
            title: settings?.metaTitle || settings?.siteName || 'Blackout',
            description: settings?.metaDescription || settings?.description || 'Welcome to Blackout',
            keywords: settings?.metaKeywords ? settings.metaKeywords.split(',').map(k => k.trim()) : [],
            openGraph: {
                title: settings?.ogTitle || settings?.siteName || 'Blackout',
                description: settings?.ogDescription || settings?.description || 'Welcome to Blackout',
                images: settings?.ogImage ? [{ url: settings.ogImage }] : [],
                type: 'website',
            },
            twitter: {
                card: (settings?.twitterCard as any) || 'summary_large_image',
                site: settings?.twitterSite || '',
                title: settings?.ogTitle || settings?.siteName || 'Blackout',
                description: settings?.ogDescription || settings?.description || 'Welcome to Blackout',
                images: settings?.ogImage ? [settings.ogImage] : [],
            },
        }
    } catch (error) {
        // Fallback for build time when DB isn't available
        return {
            title: 'Blackout',
            description: 'A modern blogging platform',
        }
    }
}

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    let siteName = 'Blackout'
    let googleAnalyticsId = ''

    try {
        let settings = await prisma.settings.findFirst()
        siteName = settings?.siteName || 'Blackout'
        googleAnalyticsId = settings?.googleAnalyticsId || ''
    } catch (error) {
        // Fallback for build time when DB isn't available
    }

    return (
        <html lang="en" suppressHydrationWarning>
            <body>
                <Providers>
                    <Suspense fallback={null}>
                        <RouteLoadingBar />
                    </Suspense>
                    <MobileMenuProvider>
                        {googleAnalyticsId && (
                            <>
                                <Script
                                    src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
                                    strategy="afterInteractive"
                                />
                                <Script id="google-analytics" strategy="afterInteractive">
                                    {`
                                        window.dataLayer = window.dataLayer || [];
                                        function gtag(){dataLayer.push(arguments);}
                                        
                                        // Set default consent to denied
                                        gtag('consent', 'default', {
                                            'analytics_storage': 'denied'
                                        });
                                        
                                        gtag('js', new Date());
                                        gtag('config', '${googleAnalyticsId}');
                                    `}
                                </Script>
                            </>
                        )}
                        <header>
                            <div className="container">
                                <nav>
                                    <Link href="/" className="logo">
                                        {siteName}
                                    </Link>
                                    <HeaderActions />
                                </nav>
                            </div>
                        </header>
                        <main>
                            <div className="container">{children}</div>
                        </main>
                        <Footer />
                        <CookieConsent />
                    </MobileMenuProvider>
                </Providers>
            </body>
        </html>
    )
}
