import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const posts = await prisma.post.findMany({
            where: {
                published: true,
                archived: false
            },
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
