import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')

    try {
        const tags = await prisma.tag.findMany({
            where: {
                name: {
                    contains: query || '',
                    mode: 'insensitive'
                }
            },
            orderBy: {
                name: 'asc'
            }
        })

        return NextResponse.json(tags)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 })
    }
}
