import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        let settings = await prisma.settings.findFirst()

        // Create default settings if none exist
        if (!settings) {
            settings = await prisma.settings.create({
                data: {
                    siteName: 'Blackout',
                    description: 'Welcome to Blackout',
                },
            })
        }

        return NextResponse.json(settings)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    const session = await getServerSession(authOptions)

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const {
            siteName,
            description,
            aboutContent,
            // SEO fields
            metaTitle,
            metaDescription,
            metaKeywords,
            ogTitle,
            ogDescription,
            ogImage,
            twitterCard,
            twitterSite,
            sitemapEnabled,
            robotsTxt,
            // Google Analytics
            // Google Analytics
            googleAnalyticsId,
            // Privacy Policy
            privacyPolicy,
            contactEmail
        } = body

        let settings = await prisma.settings.findFirst()

        const dataToSave = {
            siteName,
            description,
            aboutContent,
            ...(metaTitle !== undefined && { metaTitle }),
            ...(metaDescription !== undefined && { metaDescription }),
            ...(metaKeywords !== undefined && { metaKeywords }),
            ...(ogTitle !== undefined && { ogTitle }),
            ...(ogDescription !== undefined && { ogDescription }),
            ...(ogImage !== undefined && { ogImage }),
            ...(twitterCard !== undefined && { twitterCard }),
            ...(twitterSite !== undefined && { twitterSite }),
            ...(sitemapEnabled !== undefined && { sitemapEnabled }),
            ...(robotsTxt !== undefined && { robotsTxt }),
            ...(googleAnalyticsId !== undefined && { googleAnalyticsId }),
            ...(privacyPolicy !== undefined && { privacyPolicy }),
            ...(contactEmail !== undefined && { contactEmail })
        }

        if (!settings) {
            settings = await prisma.settings.create({
                data: dataToSave,
            })
        } else {
            settings = await prisma.settings.update({
                where: { id: settings.id },
                data: dataToSave,
            })
        }

        return NextResponse.json(settings)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
    }
}
