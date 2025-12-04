'use client'

import React, { Suspense } from 'react'
import { useParams } from 'next/navigation'
import MarkdownEditor from '@/components/MarkdownEditor'
import PageLoader from '@/components/PageLoader'

export default function EditPostPage() {
    const params = useParams()
    const postId = params?.id

    if (!postId) {
        return <PageLoader text="LOADING..." />
    }

    return (
        <Suspense fallback={<PageLoader text="LOADING..." />}>
            <MarkdownEditor mode="edit" postId={postId as string} />
        </Suspense>
    )
}
