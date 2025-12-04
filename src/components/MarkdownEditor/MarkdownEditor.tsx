'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ArrowLeft, Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import PostFormFields from '@/components/PostForm/PostFormFields'
import ContentEditor from '@/components/PostForm/ContentEditor'
import PageLoader from '@/components/PageLoader'
import ConfirmationDialog from '@/components/ConfirmationDialog'
import styles from './MarkdownEditor.module.css'

interface MarkdownEditorProps {
    mode?: 'create' | 'edit'
    postId?: string | number
}

import { useNotification } from '@/contexts/NotificationContext';

// ... other imports

export default function MarkdownEditor({ mode = 'create', postId }: MarkdownEditorProps) {
    const router = useRouter();
    const { data: session, status } = useSession({
        required: true,
        onUnauthenticated() {
            router.push('/login');
        }
    });
    const { addNotification } = useNotification();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [published, setPublished] = useState(false);
    const [loading, setLoading] = useState(mode === 'edit');
    const [saving, setSaving] = useState(false);
    const [progress, setProgress] = useState(0);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    const isMounted = useRef(true)

    useEffect(() => {
        return () => {
            isMounted.current = false
        }
    }, [])

    // Fetch post data for edit mode
    useEffect(() => {
        if (mode === 'edit' && postId) {
            fetchPost()
        }
    }, [postId, mode])

    const fetchPost = async () => {
        try {
            const response = await fetch(`/api/posts/${postId}`)
            if (response.ok) {
                const post = await response.json();
                setTitle(post.title);
                setContent(post.content);
                setPublished(post.published);
                setTags(post.tags?.map((t: any) => t.tag.name) || []);
            } else {
                addNotification('Failed to load post', 'error');
            }
        } catch (error) {
            addNotification('An error occurred', 'error');
        } finally {
            setLoading(false);
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim() || !content.trim()) {
            addNotification('Title and content are required', 'error');
            return;
        }

        setSaving(true);
        setProgress(0);
        addNotification(mode === 'create' ? 'Creating post...' : 'Saving changes...', 'info');

        // Simulate progress animation for create mode
        let progressInterval: NodeJS.Timeout | null = null
        if (mode === 'create') {
            progressInterval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 90) {
                        if (progressInterval) clearInterval(progressInterval)
                        return 90
                    }
                    return prev + 10
                })
            }, 100)
        }

        // Timeout safety
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 15000) // 15s timeout
        let isSuccess = false

        try {
            const url = mode === 'create' ? '/api/posts' : `/api/posts/${postId}`
            const method = mode === 'create' ? 'POST' : 'PUT'

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content, published, tags }),
                signal: controller.signal
            })

            clearTimeout(timeoutId)
            if (progressInterval) clearInterval(progressInterval)
            setProgress(100)

            if (!isMounted.current) return

            if (response.ok) {
                isSuccess = true;
                const successText =
                    mode === 'create'
                        ? `Post created successfully! ${published ? '(Published)' : '(Draft)'}`
                        : 'Post updated successfully';
                addNotification(successText, 'success');

                // Redirect after showing success message
                setTimeout(() => {
                    if (isMounted.current) {
                        router.push('/admin');
                    }
                }, 1500);
            } else {
                const data = await response.json();
                if (isMounted.current) {
                    addNotification(data.error || `Failed to ${mode === 'create' ? 'create' : 'update'} post`, 'error');
                    setProgress(0);
                }
            }
        } catch (error: any) {
            clearTimeout(timeoutId);
            if (progressInterval) clearInterval(progressInterval);
            if (isMounted.current) {
                if (error.name === 'AbortError') {
                    addNotification('Request timed out - please try again', 'error');
                } else {
                    addNotification('Network error - please check your connection', 'error');
                }
                setProgress(0);
            }
        } finally {
            if (isMounted.current && !isSuccess) {
                setSaving(false);
            }
        }
    }

    const handleCancel = () => {
        if (title || content || tags.length > 0) {
            setShowConfirmDialog(true)
        } else {
            router.push('/admin')
        }
    }

    const handleConfirmLeave = () => {
        router.push('/admin')
    }

    if (status === 'loading' || (mode === 'edit' && loading)) {
        return <PageLoader text={loading ? 'LOADING POST...' : 'AUTHENTICATING...'} />
    }

    if (!session) {
        return null
    }

    const headerTitle = mode === 'create' ? 'CREATE NEW POST' : 'EDIT POST'
    const headerSubtitle = mode === 'edit' ? (published ? 'PUBLISHED' : 'DRAFT') : undefined
    const saveButtonText = mode === 'create' ? 'Create Post' : 'Save Changes'
    const saveButtonLoadingText = mode === 'create' ? 'Creating Post...' : 'Saving...'

    return (
        <div className={styles.container}>
            {/* Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={showConfirmDialog}
                title="Unsaved Changes"
                message="You have unsaved changes. Are you sure you want to leave?"
                confirmText="Leave"
                cancelText="Cancel"
                onConfirm={handleConfirmLeave}
                onCancel={() => setShowConfirmDialog(false)}
                isDangerous={true}
            />

            {/* Progress Bar */}
            {saving && mode === 'create' && (
                <div className={styles.progressBar}>
                    <div
                        className={styles.progressFill}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}

            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.headerLeft}>
                        <button
                            type="button"
                            onClick={handleCancel}
                            className={styles.backBtn}
                            disabled={saving}
                        >
                            <ArrowLeft size={18} />
                            Back to Dashboard
                        </button>
                        <h1 className={styles.headerTitle}>{headerTitle}</h1>
                        {headerSubtitle && <p className={styles.headerSubtitle}>{headerSubtitle}</p>}
                    </div>
                    <div className={styles.headerRight}>
                        <button
                            type="button"
                            onClick={handleCancel}
                            className={styles.cancelBtn}
                            disabled={saving}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="markdown-editor-form"
                            className={`${styles.saveBtn} ${saving ? styles.saveBtnLoading : ''}`}
                            disabled={saving || !title.trim() || !content.trim()}
                        >
                            {saving ? (
                                <>
                                    <Loader2 size={16} className={styles.spinIcon} />
                                    {saveButtonLoadingText}
                                </>
                            ) : (
                                <>
                                    <Save size={16} />
                                    {saveButtonText}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form id="markdown-editor-form" onSubmit={handleSubmit} className={styles.form}>
                <div className={`${styles.formContent} ${saving ? styles.formContentDisabled : ''}`}>
                    <PostFormFields
                        title={title}
                        setTitle={setTitle}
                        tags={tags}
                        setTags={setTags}
                        published={published}
                        setPublished={setPublished}
                        disabled={saving}
                    />
                    <ContentEditor
                        content={content}
                        setContent={setContent}
                        disabled={saving}
                    />
                </div>
            </form>
        </div>
    )
}
