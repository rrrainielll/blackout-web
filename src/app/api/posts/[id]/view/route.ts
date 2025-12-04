import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idString } = await params
        const id = parseInt(idString)

        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 })
        }

        const post = await prisma.post.update({
            where: { id },
            data: {
                views: {
                    increment: 1
                }
            }
        })

        return NextResponse.json({ views: post.views })
    } catch (error) {
        console.error('Error incrementing view count:', error)
        return NextResponse.json({ error: 'Failed to increment view count' }, { status: 500 })
    }
}
