'use client'

import React, { useRef, useState } from 'react'
import { Edit2, Eye } from 'lucide-react'
import dynamic from 'next/dynamic'
import PageLoader from '@/components/PageLoader'
import styles from './ContentEditor.module.css'

const MarkdownPreview = dynamic(() => import('./MarkdownPreview'), {
    loading: () => <PageLoader fullScreen={false} text="LOADING PREVIEW..." />,
    ssr: false
})

interface ContentEditorProps {
    content: string
    setContent: (value: string) => void
    disabled?: boolean
}

export default function ContentEditor({ content, setContent, disabled = false }: ContentEditorProps) {
    const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit')
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value)
    }

    return (
        <div className={styles.container}>
            {/* View Mode Toggle */}
            <div className={styles.toolbar}>
                <div className={styles.toolbarGroup}>
                    <button
                        type="button"
                        onClick={() => setViewMode('edit')}
                        className={`${styles.toolbarBtn} ${viewMode === 'edit' ? styles.toolbarBtnActive : ''}`}
                        disabled={disabled}
                    >
                        <Edit2 size={16} /> Edit
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode('preview')}
                        className={`${styles.toolbarBtn} ${viewMode === 'preview' ? styles.toolbarBtnActive : ''}`}
                        disabled={disabled}
                    >
                        <Eye size={16} /> Preview
                    </button>
                </div>
            </div>

            {/* Editor/Preview Area */}
            <div className={styles.editorArea}>
                {viewMode === 'edit' && (
                    <textarea
                        ref={textareaRef}
                        value={content}
                        onChange={handleContentChange}
                        placeholder="Start writing in Markdown..."
                        className={styles.textarea}
                        disabled={disabled}
                        required
                    />
                )}

                {/* Preview */}
                {viewMode === 'preview' && (
                    <MarkdownPreview content={content} />
                )}
            </div>
        </div>
    )
}
