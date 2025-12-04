import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { makeUniqueSlug } from '@/lib/slug'

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions)

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const posts = await prisma.post.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                tags: {
                    include: {
                        tag: true
                    }
                }
            }
        })
        return NextResponse.json(posts)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions)

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { title, content, published, tags } = body

        const uniqueSlug = await makeUniqueSlug(title)

        // Handle tags: find existing or create new ones
        const tagOperations = (tags || []).map(async (tagName: string) => {
            const name = tagName.toLowerCase().trim()
            if (!name) return null

            return prisma.tag.upsert({
                where: { name },
                update: {},
                create: { name }
            })
        })
        const createdOrFoundTags = (await Promise.all(tagOperations)).filter(t => t !== null)

        // Create post and connect tags
        const post = await prisma.post.create({
            data: {
                title,
                slug: uniqueSlug,
                content,
                published: published || false,
                tags: {
                    create: createdOrFoundTags.map(tag => ({
                        tag: {
                            connect: { id: tag!.id }
                        }
                    }))
                }
            },
            include: {
                tags: {
                    include: {
                        tag: true
                    }
                }
            }
        })

        return NextResponse.json(post)
    } catch (error) {
        console.error('Error creating post:', error)
        return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
    }
}
