'use client'

import React from 'react'
import BlogMarkdownRenderer from '@/components/BlogMarkdownRenderer'
import styles from './ContentEditor.module.css'

interface MarkdownPreviewProps {
    content: string
}

export default function MarkdownPreview({ content }: MarkdownPreviewProps) {
    return (
        <div className={styles.previewContainer}>
            <div className={`prose ${styles.previewContent}`}>
                <BlogMarkdownRenderer content={content || '*No content yet. Start writing in the Edit mode.*'} />
            </div>
        </div>
    )
}
