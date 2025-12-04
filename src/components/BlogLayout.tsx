'use client'

import { useState, useEffect, useMemo, useRef, useCallback, memo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Tag, Pin, Calendar, Clock, X, Eye } from 'lucide-react'
import { getTagColor } from '@/lib/colors'
import { useMobileMenu } from '@/contexts/MobileMenuContext'
import MobileReaderLayout from './MobileReaderLayout'
import PageLoader from '@/components/PageLoader'
import styles from './BlogLayout.module.css'

const BlogMarkdownRenderer = dynamic(() => import('./BlogMarkdownRenderer'), {
    loading: () => <PageLoader fullScreen={false} text="LOADING CONTENT..." />,
    ssr: false
})

const MemoizedMobileReaderLayout = memo(MobileReaderLayout);

interface Post {
    id: number
    title: string
    slug: string
    content: string
    published: boolean
    pinned: boolean
    createdAt: string
    views: number
    tags: { tag: { id: number; name: string } }[]
}

interface Settings {
    siteName: string
    description: string
    aboutContent: string
}

const aboutComponents = {
    h1: ({ children, ...props }: any) => (
        <h1 style={{
            fontSize: '1rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '1rem',
            marginTop: '1.5rem'
        }} {...props}>{children}</h1>
    ),
    h2: ({ children, ...props }: any) => (
        <h2 style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '1rem',
            marginTop: '1.5rem'
        }} {...props}>{children}</h2>
    ),
    p: ({ children, ...props }: any) => (
        <p style={{
            fontSize: '0.875rem',
            lineHeight: 1.8,
            color: '#999',
            marginBottom: '1rem'
        }} {...props}>{children}</p>
    ),
    ul: ({ children, ...props }: any) => (
        <ul style={{
            fontSize: '0.875rem',
            lineHeight: 1.8,
            color: '#999',
            marginBottom: '1rem',
            paddingLeft: '1.5rem'
        }} {...props}>{children}</ul>
    ),
    ol: ({ children, ...props }: any) => (
        <ol style={{
            fontSize: '0.875rem',
            lineHeight: 1.8,
            color: '#999',
            marginBottom: '1rem',
            paddingLeft: '1.5rem'
        }} {...props}>{children}</ol>
    ),
    a: ({ children, ...props }: any) => (
        <a style={{
            color: '#fff',
            textDecoration: 'underline'
        }} {...props}>{children}</a>
    )
}

export default function BlogLayout() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const postSlug = searchParams.get('post')
    const selectedTag = searchParams.get('tag')
    const { isOpen: isMobileMenuOpen, closeMenu: closeMobileMenu } = useMobileMenu()

    const [posts, setPosts] = useState<Post[]>([])
    const [selectedPost, setSelectedPost] = useState<Post | null>(null)
    const [settings, setSettings] = useState<Settings>({ siteName: 'Blackout', description: 'Welcome to Blackout', aboutContent: '' })
    const [loading, setLoading] = useState(true)

    const mobileMenuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        fetchData()
    }, [])

    useEffect(() => {
        if (postSlug && posts.length > 0) {
            const post = posts.find(p => p.slug === postSlug)
            setSelectedPost(post || null)
        } else {
            setSelectedPost(null)
        }
    }, [postSlug, posts])

    // Handle escape key and click outside to close mobile menu
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isMobileMenuOpen) {
                closeMobileMenu()
            }
        }

        const handleClickOutside = (e: MouseEvent) => {
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
                closeMobileMenu()
            }
        }

        if (isMobileMenuOpen) {
            document.addEventListener('keydown', handleEscape)
            document.addEventListener('mousedown', handleClickOutside)
            // Prevent body scroll when menu is open
            document.body.style.overflow = 'hidden'
        }

        return () => {
            document.removeEventListener('keydown', handleEscape)
            document.removeEventListener('mousedown', handleClickOutside)
            document.body.style.overflow = ''
        }
    }, [isMobileMenuOpen, closeMobileMenu])

    const fetchData = async () => {
        try {
            const postsRes = await fetch('/api/posts/public')
            if (postsRes.ok) {
                const postsData = await postsRes.json()
                setPosts(postsData)
            }

            const settingsRes = await fetch('/api/settings')
            if (settingsRes.ok) {
                const settingsData = await settingsRes.json()
                setSettings(settingsData)
            }
        } catch (error) {
            console.error('Failed to fetch data:', error)
        } finally {
            setLoading(false)
        }
    }

    const incrementView = async (id: number) => {
        try {
            // Check if we've already viewed this post in this session to prevent spamming
            const viewedPosts = JSON.parse(sessionStorage.getItem('viewedPosts') || '[]')
            if (viewedPosts.includes(id)) return

            const res = await fetch(`/api/posts/${id}/view`, { method: 'PATCH' })
            if (res.ok) {
                const data = await res.json()
                // Update local state
                setPosts(prev => prev.map(p =>
                    p.id === id ? { ...p, views: data.views } : p
                ))
                if (selectedPost?.id === id) {
                    setSelectedPost(prev => prev ? { ...prev, views: data.views } : null)
                }

                // Mark as viewed
                viewedPosts.push(id)
                sessionStorage.setItem('viewedPosts', JSON.stringify(viewedPosts))
            }
        } catch (error) {
            console.error('Failed to increment view count:', error)
        }
    }

    const selectPost = useCallback((slug: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('post', slug)
        router.push(`/?${params.toString()}`)

        // Find post and increment view
        const post = posts.find(p => p.slug === slug)
        if (post) {
            incrementView(post.id)
        }
    }, [searchParams, router, posts])

    const selectTag = useCallback((tag: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (selectedTag === tag) {
            params.delete('tag')
        } else {
            params.set('tag', tag)
        }
        router.push(`/?${params.toString()}`)
    }, [searchParams, router, selectedTag])

    const clearTagFilter = useCallback(() => {
        const params = new URLSearchParams(searchParams.toString())
        params.delete('tag')
        router.push(`/?${params.toString()}`)
    }, [searchParams, router])

    // Filter posts based on selected tag
    const filteredPosts = useMemo(() => {
        if (!selectedTag) return posts
        return posts.filter(post =>
            post.tags.some(({ tag }) => tag.name === selectedTag)
        )
    }, [posts, selectedTag])

    const pinnedPosts = posts.filter(p => p.pinned)
    const latestPosts = posts.slice(0, 5)
    const allTags = Array.from(new Set(posts.flatMap(p => p.tags.map(({ tag }) => tag.name))))


    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <p className={styles.loadingText}>
                    LOADING...
                </p>
            </div>
        )
    }

    return (
        <>
            {/* Mobile/Tablet Reader Layout - Shows on screens < 1024px */}
            {/* Mobile/Tablet Reader Layout - Shows on screens < 1024px */}
            <div className={styles.mobileReaderWrapper}>
                <MemoizedMobileReaderLayout
                    posts={filteredPosts}
                    selectedPost={selectedPost}
                    onSelectPost={selectPost}
                    settings={settings}
                    aboutComponents={aboutComponents}
                />
            </div>

            {/* Desktop Layout - Hidden on mobile/tablet */}
            <div className={styles.desktopLayoutWrapper}>
                <div className={styles.blogLayout}>
                    {/* LEFT COLUMN - Navigation (Desktop Only) */}
                    <div className={styles.blogSidebarLeft}>
                        {/* Pinned Posts */}
                        {pinnedPosts.length > 0 && (
                            <div style={{ marginBottom: '2rem' }}>
                                <div className={styles.sectionHeader}>
                                    <Pin size={10} />
                                    PINNED
                                </div>
                                {pinnedPosts.map(post => (
                                    <button
                                        key={post.id}
                                        onClick={() => selectPost(post.slug)}
                                        className={styles.pinnedPostBtn}
                                        style={{ marginBottom: '0.5rem' }}
                                    >
                                        {post.title}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Latest Posts */}
                        <div style={{ marginBottom: '2rem' }}>
                            <div className={styles.sectionHeader}>
                                LATEST POSTS
                            </div>
                            <div className={styles.latestPostsList}>
                                {latestPosts.map((post) => (
                                    <button
                                        key={post.id}
                                        onClick={() => selectPost(post.slug)}
                                        className={`${styles.latestPostBtn} ${selectedPost?.id === post.id ? styles.active : ''}`}
                                    >
                                        {post.title}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tags */}
                        {allTags.length > 0 && (
                            <div>
                                <div className={styles.sectionHeader}>
                                    TAGS
                                </div>
                                <div className={styles.tagsContainer}>
                                    {allTags.map((tag) => {
                                        const tagColor = getTagColor(tag)
                                        const isSelected = selectedTag === tag
                                        return (
                                            <button
                                                key={tag}
                                                onClick={() => selectTag(tag)}
                                                className={styles.tagBtn}
                                                style={{
                                                    borderColor: isSelected ? tagColor : '#333',
                                                    backgroundColor: isSelected ? tagColor : 'transparent',
                                                    color: isSelected ? '#fff' : tagColor,
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!isSelected) {
                                                        e.currentTarget.style.borderColor = tagColor
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (!isSelected) {
                                                        e.currentTarget.style.borderColor = '#333'
                                                    }
                                                }}
                                            >
                                                {tag}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* MIDDLE COLUMN - All Posts (Desktop Only) */}
                    <div className={styles.blogSidebarMiddle}>
                        <div className={styles.allPostsHeader}>
                            <span>
                                {selectedTag ? `TAGGED: ${selectedTag}` : `ALL POSTS`} ({filteredPosts.length})
                            </span>
                            {selectedTag && (
                                <button
                                    onClick={clearTagFilter}
                                    className={styles.clearFilterBtn}
                                    title="Clear filter"
                                >
                                    <X size={12} />
                                </button>
                            )}
                        </div>

                        <div className={styles.postsList}>
                            {filteredPosts.map((post) => (
                                <div
                                    key={post.id}
                                    className={styles.postItem}
                                    onClick={() => selectPost(post.slug)}
                                >
                                    {/* Post Title */}
                                    <h3 className={`${styles.postTitle} ${selectedPost?.id === post.id ? styles.active : ''}`}>
                                        {post.title}
                                    </h3>

                                    {/* Tags */}
                                    {post.tags && post.tags.length > 0 && (
                                        <div className={styles.postTags}>
                                            {post.tags.map(({ tag }) => (
                                                <span
                                                    key={tag.id}
                                                    className={styles.postTag}
                                                    style={{ color: getTagColor(tag.name) }}
                                                >
                                                    {tag.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Date and Time */}
                                    <div className={styles.postMeta}>
                                        <div className={styles.postMetaItem}>
                                            <Calendar size={10} />
                                            {new Date(post.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            }).toUpperCase()}
                                        </div>
                                        <div className={styles.postMetaItem}>
                                            <Clock size={10} />
                                            {new Date(post.createdAt).toLocaleTimeString('en-US', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                hour12: true
                                            }).toUpperCase()}
                                        </div>
                                        <div className={styles.postMetaItem}>
                                            <Eye size={10} />
                                            {post.views || 0}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT COLUMN - Content */}
                    <div className={styles.blogContent}>
                        {selectedPost ? (
                            <div>
                                <div className="prose" style={{ maxWidth: 'none' }}>
                                    <BlogMarkdownRenderer content={selectedPost.content} />
                                </div>

                                {/* Post metadata */}
                                <div className={styles.postMetadata}>
                                    <div className={styles.postMetadataDate}>
                                        <Calendar size={10} />
                                        {new Date(selectedPost.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        }).toUpperCase()}
                                    </div>
                                    <div className={styles.postMetadataDate}>
                                        <Eye size={10} />
                                        {(selectedPost.views || 0) + ' VIEWS'}
                                    </div>
                                    {selectedPost.tags && selectedPost.tags.length > 0 && (
                                        <div className={styles.postMetadataTags}>
                                            <Tag size={10} style={{ color: '#999' }} />
                                            {selectedPost.tags.map(({ tag }) => {
                                                const tagColor = getTagColor(tag.name)
                                                const isSelected = selectedTag === tag.name
                                                return (
                                                    <button
                                                        key={tag.id}
                                                        onClick={() => selectTag(tag.name)}
                                                        className={styles.tagBtn}
                                                        style={{
                                                            borderColor: isSelected ? tagColor : '#333',
                                                            backgroundColor: isSelected ? tagColor : 'transparent',
                                                            color: isSelected ? '#fff' : tagColor,
                                                        }}
                                                    >
                                                        {tag.name}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                        ) : (
                            <div className={styles.homepageContent}>
                                <h1 className={styles.contentTitle}>
                                    {settings.siteName}
                                </h1>
                                <div className="prose" style={{ maxWidth: 'none' }}>
                                    <p className={styles.contentDescription}>
                                        {settings.description}
                                    </p>

                                    <div className={styles.aboutBox}>
                                        <BlogMarkdownRenderer content={settings.aboutContent} components={aboutComponents} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Off-Canvas Menu */}
            {isMobileMenuOpen && (
                <div
                    className={styles.mobileMenuOverlay}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Navigation menu"
                >
                    {/* Backdrop */}
                    <div className={styles.mobileMenuBackdrop} />

                    {/* Menu Panel */}
                    <div
                        ref={mobileMenuRef}
                        className={styles.mobileMenuPanel}
                    >
                        {/* Sidebar Content */}
                        <div className={styles.mobileMenuContent}>
                            {/* LEFT COLUMN - Navigation */}
                            <div className={styles.mobileMenuSection}>
                                {/* Pinned Posts */}
                                {pinnedPosts.length > 0 && (
                                    <div style={{ marginBottom: '2rem' }}>
                                        <div className={styles.sectionHeader}>
                                            <Pin size={10} />
                                            PINNED
                                        </div>
                                        {pinnedPosts.map(post => (
                                            <button
                                                key={post.id}
                                                onClick={() => {
                                                    selectPost(post.slug)
                                                    closeMobileMenu()
                                                }}
                                                className={styles.pinnedPostBtn}
                                                style={{ marginBottom: '0.5rem' }}
                                            >
                                                {post.title}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Latest Posts */}
                                <div style={{ marginBottom: '2rem' }}>
                                    <div className={styles.sectionHeader}>
                                        LATEST POSTS
                                    </div>
                                    <div className={styles.latestPostsList}>
                                        {latestPosts.map((post) => (
                                            <button
                                                key={post.id}
                                                onClick={() => {
                                                    selectPost(post.slug)
                                                    closeMobileMenu()
                                                }}
                                                className={`${styles.latestPostBtn} ${selectedPost?.id === post.id ? styles.active : ''}`}
                                            >
                                                {post.title}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Tags */}
                                {allTags.length > 0 && (
                                    <div style={{ marginBottom: '2rem' }}>
                                        <div className={styles.sectionHeader}>
                                            TAGS
                                        </div>
                                        <div className={styles.tagsContainer}>
                                            {allTags.map((tag) => {
                                                const tagColor = getTagColor(tag)
                                                const isSelected = selectedTag === tag
                                                return (
                                                    <button
                                                        key={tag}
                                                        onClick={() => selectTag(tag)}
                                                        className={styles.tagBtn}
                                                        style={{
                                                            borderColor: isSelected ? tagColor : '#333',
                                                            backgroundColor: isSelected ? tagColor : 'transparent',
                                                            color: isSelected ? '#fff' : tagColor,
                                                        }}
                                                    >
                                                        {tag}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* MIDDLE COLUMN - All Posts */}
                            <div className={styles.mobileMenuSection}>
                                <div className={styles.allPostsHeader}>
                                    <span>
                                        {selectedTag ? `TAGGED: ${selectedTag}` : `ALL POSTS`} ({filteredPosts.length})
                                    </span>
                                    {selectedTag && (
                                        <button
                                            onClick={clearTagFilter}
                                            className={styles.clearFilterBtn}
                                            title="Clear filter"
                                        >
                                            <X size={12} />
                                        </button>
                                    )}
                                </div>

                                <div className={styles.postsList}>
                                    {filteredPosts.map((post) => (
                                        <div
                                            key={post.id}
                                            className={styles.postItem}
                                            onClick={() => {
                                                selectPost(post.slug)
                                                closeMobileMenu()
                                            }}
                                        >
                                            {/* Post Title */}
                                            <h3 className={`${styles.postTitle} ${selectedPost?.id === post.id ? styles.active : ''}`}>
                                                {post.title}
                                            </h3>

                                            {/* Tags */}
                                            {post.tags && post.tags.length > 0 && (
                                                <div className={styles.postTags}>
                                                    {post.tags.map(({ tag }) => (
                                                        <span
                                                            key={tag.id}
                                                            className={styles.postTag}
                                                            style={{ color: getTagColor(tag.name) }}
                                                        >
                                                            {tag.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Date and Time */}
                                            <div className={styles.postMeta}>
                                                <div className={styles.postMetaItem}>
                                                    <Calendar size={10} />
                                                    {new Date(post.createdAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    }).toUpperCase()}
                                                </div>
                                                <div className={styles.postMetaItem}>
                                                    <Clock size={10} />
                                                    {new Date(post.createdAt).toLocaleTimeString('en-US', {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        hour12: true
                                                    }).toUpperCase()}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Close Button at Bottom */}
                        <button
                            className={styles.mobileMenuClose}
                            onClick={closeMobileMenu}
                            aria-label="Close navigation menu"
                        >
                            <X size={20} />
                            <span>CLOSE</span>
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}
