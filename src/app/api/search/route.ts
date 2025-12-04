import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get('q') || '';

        if (!query.trim()) {
            return NextResponse.json({ results: [] });
        }

        // Search published posts
        const posts = await prisma.post.findMany({
            where: {
                published: true,
                OR: [
                    {
                        title: {
                            contains: query,
                            mode: 'insensitive'
                        }
                    },
                    {
                        content: {
                            contains: query,
                            mode: 'insensitive'
                        }
                    },
                    {
                        tags: {
                            some: {
                                tag: {
                                    name: {
                                        contains: query,
                                        mode: 'insensitive'
                                    }
                                }
                            }
                        }
                    }
                ]
            },
            select: {
                id: true,
                title: true,
                slug: true,
                content: true,
                createdAt: true,
                tags: {
                    include: {
                        tag: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 10
        });

        // Format results with excerpts
        const results = posts.map(post => {
            // Create excerpt from content
            const plainText = post.content
                .replace(/```[\s\S]*?```/g, '') // Remove code blocks
                .replace(/`[^`]*`/g, '') // Remove inline code
                .replace(/[#*_~\[\]()]/g, '') // Remove markdown syntax
                .replace(/\n+/g, ' ') // Replace newlines with spaces
                .trim();

            // Find the query in the text for context
            const queryIndex = plainText.toLowerCase().indexOf(query.toLowerCase());
            let excerpt = '';

            if (queryIndex !== -1) {
                // Show context around the match
                const start = Math.max(0, queryIndex - 50);
                const end = Math.min(plainText.length, queryIndex + query.length + 80);
                excerpt = (start > 0 ? '...' : '') +
                    plainText.slice(start, end) +
                    (end < plainText.length ? '...' : '');
            } else {
                // Just show beginning of content
                excerpt = plainText.slice(0, 130) + (plainText.length > 130 ? '...' : '');
            }

            return {
                id: post.id,
                title: post.title,
                slug: post.slug,
                excerpt,
                type: 'post' as const
            };
        });

        return NextResponse.json({
            results,
            count: results.length
        });

    } catch (error) {
        console.error('Search API error:', error);
        return NextResponse.json(
            { error: 'Failed to search posts' },
            { status: 500 }
        );
    }
}
