import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import BlogLayout from '@/components/BlogLayout'

export const dynamic = 'force-dynamic'

export default async function Home() {
    // Check if setup is needed
    const userCount = await prisma.user.count()
    if (userCount === 0) {
        redirect('/setup')
    }

    return (
        <Suspense fallback={
            <div style={{ textAlign: 'center', padding: '4rem', color: '#666' }}>
                <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    LOADING...
                </p>
            </div>
        }>
            <BlogLayout />
        </Suspense>
    )
}
