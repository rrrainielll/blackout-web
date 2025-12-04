import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Ensure base URL is provided via env
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

    try {
        const settings = await prisma.settings.findFirst()

        // If sitemap is disabled, return empty array
        if (settings?.sitemapEnabled === false) {
            return []
        }

        const posts = await prisma.post.findMany({
            where: { published: true },
            select: { slug: true, updatedAt: true },
        })

        const staticRoutes = [
            {
                url: baseUrl,
                lastModified: new Date(),
                changeFrequency: 'daily' as const,
                priority: 1,
            },
            {
                url: `${baseUrl}/about`,
                lastModified: new Date(),
                changeFrequency: 'monthly' as const,
                priority: 0.8,
            },
        ]

        const postRoutes = posts.map((post) => ({
            url: `${baseUrl}/posts/${post.slug}`,
            lastModified: post.updatedAt,
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }))

        return [...staticRoutes, ...postRoutes]
    } catch (error) {
        console.warn('Could not fetch data for sitemap (likely during build), returning default sitemap.')
        // Return a basic sitemap so the build doesn't fail
        return [
            {
                url: baseUrl,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 1,
            },
        ]
    }
}
