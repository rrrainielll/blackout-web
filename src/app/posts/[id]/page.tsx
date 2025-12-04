import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const post = await prisma.post.findUnique({
        where: { id: Number(id) },
    })

    if (!post) {
        notFound()
    }

    return (
        <article style={{ maxWidth: '800px', margin: '0 auto' }}>
            <Link href="/" style={{ color: '#94a3b8', marginBottom: '2rem', display: 'inline-block' }}>← Back to Home</Link>
            <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>{post.title}</h1>
            <div style={{ color: '#94a3b8', marginBottom: '3rem' }}>
                {new Date(post.createdAt).toLocaleDateString()}
            </div>
            <div style={{ fontSize: '1.2rem', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                {post.content}
            </div>
        </article>
    )
}
