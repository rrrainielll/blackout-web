import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { generateSlug } from '@/lib/slug'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await params
        const id = parseInt(idStr)
        const post = await prisma.post.findUnique({
            where: { id },
        })

        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 })
        }

        return NextResponse.json(post)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 })
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { id: idStr } = await params
        const id = parseInt(idStr)
        const body = await request.json()
        const { title, content, published, tags } = body

        const currentPost = await prisma.post.findUnique({
            where: { id }
        })

        if (!currentPost) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 })
        }

        let newSlug = currentPost.slug
        if (title !== currentPost.title) {
            const baseSlug = generateSlug(title)
            newSlug = baseSlug
            let counter = 1
            while (await prisma.post.findFirst({ where: { slug: newSlug, NOT: { id } } })) {
                newSlug = `${baseSlug}-${counter}`
                counter++
            }
        }

        const post = await prisma.post.update({
            where: { id },
            data: {
                title,
                slug: newSlug,
                content,
                published,
            },
        })

        // More robust tag handling
        if (tags && Array.isArray(tags)) {
            // Step 1: Find or create all tags in a batch
            const tagOperations = tags.map(async (tagName: string) => {
                const name = tagName.toLowerCase().trim()
                if (!name) return null

                return prisma.tag.upsert({
                    where: { name },
                    update: {},
                    create: { name }
                })
            })
            const createdOrFoundTags = (await Promise.all(tagOperations)).filter(t => t !== null)

            // Step 2: Clear existing associations
            await prisma.postTag.deleteMany({
                where: { postId: id }
            })

            // Step 3: Create new associations in a batch
            if (createdOrFoundTags.length > 0) {
                await prisma.postTag.createMany({
                    data: createdOrFoundTags.map(tag => ({
                        postId: id,
                        tagId: tag!.id
                    }))
                })
            }
        }

        const updatedPost = await prisma.post.findUnique({
            where: { id },
            include: {
                tags: {
                    include: {
                        tag: true
                    }
                }
            }
        })

        return NextResponse.json(updatedPost)
    } catch (error) {
        console.error('Error updating post:', error)
        return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { id: idStr } = await params
        const id = parseInt(idStr)
        await prisma.post.delete({
            where: { id },
        })

        return NextResponse.json({ message: 'Post deleted successfully' })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions)

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { id: idStr } = await params
        const id = parseInt(idStr)
        const body = await request.json()
        const { pinned, archived } = body

        // Prepare update data
        const updateData: any = {}

        // Handle pinned status
        if (pinned !== undefined) {
            if (pinned) {
                // Check if we already have 5 pinned posts
                const pinnedCount = await prisma.post.count({
                    where: {
                        pinned: true,
                        NOT: { id }
                    }
                })

                if (pinnedCount >= 5) {
                    return NextResponse.json({ error: 'MAXIMUM 5 PINNED POSTS ALLOWED' }, { status: 400 })
                }
            }
            updateData.pinned = pinned
        }

        // Handle archived status
        if (archived !== undefined) {
            updateData.archived = archived
            // If archiving a post, also unpin it
            if (archived) {
                updateData.pinned = false
            }
        }

        // Update the target post
        const post = await prisma.post.update({
            where: { id },
            data: updateData,
        })

        return NextResponse.json(post)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
    }
}
