import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const settings = await prisma.settings.findFirst()

        // Default robots.txt if nothing in DB
        const robotsTxt = settings?.robotsTxt || 'User-agent: *\nAllow: /'

        // Append sitemap URL if enabled
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
        const sitemapLine = settings?.sitemapEnabled !== false
            ? `\nSitemap: ${baseUrl}/sitemap.xml`
            : ''

        return new NextResponse(robotsTxt + sitemapLine, {
            headers: {
                'Content-Type': 'text/plain',
            },
        })
    } catch (error) {
        return new NextResponse('User-agent: *\nAllow: /', {
            headers: {
                'Content-Type': 'text/plain',
            },
        })
    }
}
