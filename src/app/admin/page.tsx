'use client';

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import ClientOnly from '@/components/ClientOnly'
import Masonry from 'react-masonry-css'
import { Plus, Edit, Trash2, Settings, FileText, LogOut, Calendar, Pin, Archive, Globe } from 'lucide-react'
import dynamicImport from 'next/dynamic'
import PageLoader from '@/components/PageLoader'
import ConfirmationDialog from '@/components/ConfirmationDialog'
import styles from './admin.module.css'

import { getTagColor } from '@/lib/colors'

const SettingsMarkdownPreview = dynamicImport(() => import('@/components/Admin/SettingsMarkdownPreview'), {
    loading: () => <PageLoader fullScreen={false} text="LOADING PREVIEW..." />,
    ssr: false
})

export const dynamic = 'force-dynamic'

interface Post {
    id: number
    title: string
    slug: string
    content: string
    published: boolean
    pinned: boolean
    archived: boolean
    createdAt: string
    tags: { tag: { id: number; name: string } }[]
}

import { useNotification } from '@/contexts/NotificationContext';

// ... other imports

function AdminContent() {
    const router = useRouter();
    const { data: session, status } = useSession({
        required: true,
        onUnauthenticated() {
            router.push('/login');
        }
    });
    const { addNotification } = useNotification();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('all');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [postToDelete, setPostToDelete] = useState<number | null>(null);

    // Settings form state
    const [siteName, setSiteName] = useState('')
    const [description, setDescription] = useState('')
    const [aboutContent, setAboutContent] = useState('')
    const [privacyPolicy, setPrivacyPolicy] = useState('')
    const [contactEmail, setContactEmail] = useState('')
    const [settingsLoading, setSettingsLoading] = useState(true)
    const [isEditingAbout, setIsEditingAbout] = useState(false)
    const [isEditingPrivacy, setIsEditingPrivacy] = useState(false)

    // SEO state
    const [metaTitle, setMetaTitle] = useState('')
    const [metaDescription, setMetaDescription] = useState('')
    const [metaKeywords, setMetaKeywords] = useState('')
    const [ogTitle, setOgTitle] = useState('')
    const [ogDescription, setOgDescription] = useState('')
    const [ogImage, setOgImage] = useState('')
    const [twitterCard, setTwitterCard] = useState('summary_large_image')
    const [twitterSite, setTwitterSite] = useState('')
    const [sitemapEnabled, setSitemapEnabled] = useState(true)
    const [robotsTxt, setRobotsTxt] = useState('User-agent: *\\nAllow: /')
    const [googleAnalyticsId, setGoogleAnalyticsId] = useState('')

    // SMTP state
    const [smtpHost, setSmtpHost] = useState('')
    const [smtpPort, setSmtpPort] = useState(587)
    const [smtpUser, setSmtpUser] = useState('')
    const [smtpPassword, setSmtpPassword] = useState('')
    const [smtpSecure, setSmtpSecure] = useState(false)
    const [smtpFromEmail, setSmtpFromEmail] = useState('')

    useEffect(() => {
        const loadAllData = async () => {
            setLoading(true)
            setSettingsLoading(true)
            await Promise.all([fetchPosts(), fetchSettings()])
            setLoading(false)
            setSettingsLoading(false)
        }
        loadAllData()
    }, [])

    const fetchPosts = async () => {
        try {
            const response = await fetch('/api/posts')
            if (response.ok) {
                const data = await response.json()
                setPosts(data)
            }
        } catch (error) {
            // Post fetching error handled silently
        }
    }

    const fetchSettings = async () => {
        try {
            const response = await fetch('/api/settings')
            const data = await response.json()
            setSiteName(data.siteName || '')
            setDescription(data.description || '')
            setAboutContent(data.aboutContent || '')
            setPrivacyPolicy(data.privacyPolicy || '')
            setContactEmail(data.contactEmail || '')
            // SEO fields
            setMetaTitle(data.metaTitle || '')
            setMetaDescription(data.metaDescription || '')
            setMetaKeywords(data.metaKeywords || '')
            setOgTitle(data.ogTitle || '')
            setOgDescription(data.ogDescription || '')
            setOgImage(data.ogImage || '')
            setTwitterCard(data.twitterCard || 'summary_large_image')
            setTwitterSite(data.twitterSite || '')
            setSitemapEnabled(data.sitemapEnabled ?? true)
            setRobotsTxt(data.robotsTxt || 'User-agent: *\\nAllow: /')
            setGoogleAnalyticsId(data.googleAnalyticsId || '')
            // SMTP fields
            setSmtpHost(data.smtpHost || '')
            setSmtpPort(data.smtpPort || 587)
            setSmtpUser(data.smtpUser || '')
            setSmtpPassword(data.smtpPassword || '')
            setSmtpSecure(data.smtpSecure || false)
            setSmtpFromEmail(data.smtpFromEmail || '')
            // SMTP fields
            setSmtpHost(data.smtpHost || '')
            setSmtpPort(data.smtpPort || 587)
            setSmtpUser(data.smtpUser || '')
            setSmtpPassword(data.smtpPassword || '')
            setSmtpSecure(data.smtpSecure || false)
            setSmtpFromEmail(data.smtpFromEmail || '')
        } catch (error) {
            // Settings fetch error handled silently
        }
    }

    const handleDeletePost = (id: number) => {
        setPostToDelete(id)
        setShowDeleteConfirm(true)
    }

    const handleConfirmDelete = async () => {
        if (postToDelete === null) return

        try {
            const response = await fetch(`/api/posts/${postToDelete}`, {
                method: 'DELETE',
            })

            if (response.ok) {
                addNotification('Post deleted successfully', 'success');
                fetchPosts();
            } else {
                addNotification('Delete failed', 'error');
            }
        } catch (error) {
            addNotification('An error occurred', 'error');
        } finally {
            setPostToDelete(null);
        }
    }

    const handleToggleArchive = async (id: number, currentStatus: boolean) => {
        try {
            const response = await fetch(`/api/posts/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ archived: !currentStatus }),
            })

            if (response.ok) {
                addNotification(!currentStatus ? 'Post archived' : 'Post unarchived', 'success');
                fetchPosts();
            } else {
                addNotification('Archive toggle failed', 'error');
            }
        } catch (error) {
            addNotification('An error occurred', 'error');
        }
    }

    const handleTogglePin = async (id: number, currentStatus: boolean) => {
        try {
            const response = await fetch(`/api/posts/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pinned: !currentStatus }),
            })

            if (response.ok) {
                addNotification(!currentStatus ? 'Post pinned' : 'Post unpinned', 'success');
                fetchPosts();
            } else {
                const data = await response.json();
                addNotification(data.error || 'Pin toggle failed', 'error');
            }
        } catch (error) {
            addNotification('An error occurred', 'error');
        }
    }

    const handleUpdateSiteSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setSettingsLoading(true);

        try {
            const payload = {
                siteName,
                description,
                aboutContent
            };

            const response = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                addNotification('Site settings updated', 'success');
                setIsEditingAbout(false);
            } else {
                addNotification('Update failed', 'error');
            }
        } catch (error) {
            addNotification('An error occurred', 'error');
        } finally {
            setSettingsLoading(false);
        }
    };

    const handleUpdatePrivacySettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setSettingsLoading(true);

        try {
            const payload = {
                privacyPolicy,
                contactEmail
            };

            const response = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                addNotification('Privacy settings updated', 'success');
                setIsEditingPrivacy(false);
            } else {
                addNotification('Update failed', 'error');
            }
        } catch (error) {
            addNotification('An error occurred', 'error');
        } finally {
            setSettingsLoading(false);
        }
    };

    const handleUpdateSEO = async (e: React.FormEvent) => {
        e.preventDefault();
        setSettingsLoading(true);

        try {
            const payload = {
                metaTitle,
                metaDescription,
                metaKeywords,
                ogTitle,
                ogDescription,
                ogImage,
                twitterCard,
                twitterSite,
                sitemapEnabled,
                robotsTxt,
                googleAnalyticsId
            };

            const response = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                addNotification('SEO settings updated', 'success');
            } else {
                addNotification('Update failed', 'error');
            }
        } catch (error) {
            addNotification('An error occurred', 'error');
        } finally {
            setSettingsLoading(false);
        }
    };

    const handleUpdateSMTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setSettingsLoading(true);

        try {
            const payload = {
                smtpHost,
                smtpPort,
                smtpUser,
                smtpPassword,
                smtpSecure,
                smtpFromEmail
            };

            const response = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                addNotification('SMTP settings updated', 'success');
            } else {
                addNotification('Update failed', 'error');
            }
        } catch (error) {
            addNotification('An error occurred', 'error');
        } finally {
            setSettingsLoading(false);
        }
    };

    const dashboardBreakpoints = {
        default: 2,
        1100: 2,
        700: 1
    }

    const filteredPosts = posts.filter(post => {
        if (filter === 'all') return !post.archived
        if (filter === 'live') return post.published && !post.archived
        if (filter === 'draft') return !post.published && !post.archived
        if (filter === 'pinned') return post.pinned && !post.archived
        if (filter === 'archived') return post.archived
        return false
    })

    if (status === 'loading') {
        return <PageLoader text="AUTHENTICATING..." />
    }

    if (!session) {
        return null
    }

    return (
        <div className={styles.adminContainer}>
            {/* Delete Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={showDeleteConfirm}
                title="Delete Post"
                message="Are you sure you want to delete this post? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={handleConfirmDelete}
                onCancel={() => setShowDeleteConfirm(false)}
                isDangerous={true}
            />

            {/* Header */}
            <div className={styles.header}>
                <div>
                    <h1 className={styles.headerTitle}>
                        DASHBOARD
                    </h1>
                    <p className={styles.headerSubtitle}>
                        {session.user?.name}
                    </p>
                </div>
                <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className={`btn ${styles.logoutBtn}`}
                >
                    <LogOut size={14} />
                    LOGOUT
                </button>
            </div>

            <Masonry
                breakpointCols={dashboardBreakpoints}
                className="my-masonry-grid"
                columnClassName="my-masonry-grid_column"
            >
                {/* 1. POSTS COLUMN/CARD */}
                <div className={`card ${styles.dashboardCard}`}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>
                            POSTS ({filteredPosts.length})
                        </h2>
                        <button
                            onClick={() => router.push('/admin/posts/create')}
                            className={styles.actionBtn}
                            title="Create New Post"
                            style={{ borderColor: 'var(--foreground)', color: 'var(--foreground)' }}
                        >
                            <Plus size={14} />
                        </button>
                    </div>

                    <div className={styles.filterGroup}>
                        <button onClick={() => setFilter('all')} className={`${styles.filterBtn} ${filter === 'all' ? styles.filterBtnActive : ''}`}>All</button>
                        <button onClick={() => setFilter('live')} className={`${styles.filterBtn} ${filter === 'live' ? styles.filterBtnActive : ''}`}>Live</button>
                        <button onClick={() => setFilter('draft')} className={`${styles.filterBtn} ${filter === 'draft' ? styles.filterBtnActive : ''}`}>Draft</button>
                        <button onClick={() => setFilter('pinned')} className={`${styles.filterBtn} ${filter === 'pinned' ? styles.filterBtnActive : ''}`}>Pinned</button>
                        <button onClick={() => setFilter('archived')} className={`${styles.filterBtn} ${filter === 'archived' ? styles.filterBtnActive : ''}`}>Archived</button>
                    </div>

                    <div className={styles.postsList}>
                        {filteredPosts.length === 0 ? (
                            <div className={styles.emptyState}>
                                <FileText size={24} className={styles.emptyIcon} />
                                <p className={styles.emptyText}>NO POSTS IN THIS VIEW</p>
                            </div>
                        ) : (
                            filteredPosts
                                .map((post) => (
                                    <div key={post.id} className={styles.postListItem}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                            <h3 className={styles.postListTitle}>{post.title}</h3>
                                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                                                <button
                                                    onClick={() => handleToggleArchive(post.id, post.archived)}
                                                    className={styles.actionBtn}
                                                    title={post.archived ? 'Unarchive' : 'Archive'}
                                                >
                                                    <Archive size={12} />
                                                </button>
                                                <button
                                                    onClick={() => router.push(`/admin/posts/edit/${post.id}`)}
                                                    className={styles.actionBtn}
                                                    title="Edit"
                                                >
                                                    <Edit size={12} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeletePost(post.id)}
                                                    className={styles.actionBtn}
                                                    title="Delete"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </div>
                                        {post.tags && post.tags.length > 0 && (
                                            <div className={styles.tagList} style={{ marginBottom: '0.5rem' }}>
                                                {post.tags.map(({ tag }) => {
                                                    const tagColor = getTagColor(tag.name)
                                                    return (
                                                        <span
                                                            key={tag.id}
                                                            className={styles.tag}
                                                            style={{
                                                                borderColor: tagColor,
                                                                color: tagColor,
                                                                fontSize: '0.65rem',
                                                                padding: '0.1rem 0.3rem'
                                                            }}
                                                        >
                                                            {tag.name}
                                                        </span>
                                                    )
                                                })}
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            <span className={`${styles.statusBadge} ${post.published ? styles.statusLive : ''}`}>
                                                {post.published ? 'LIVE' : 'DRAFT'}
                                            </span>
                                            <button
                                                onClick={() => handleTogglePin(post.id, post.pinned)}
                                                className={`${styles.inlinePinBtn} ${post.pinned ? styles.inlinePinBtnActive : ''}`}
                                                title={post.pinned ? 'Unpin' : 'Pin'}
                                            >
                                                <Pin size={10} />
                                            </button>
                                            <span className={styles.postDate}>
                                                {new Date(post.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                ))
                        )}
                    </div>
                </div>

                {/* 2. SITE SETTINGS CARD */}
                <div className={`card ${styles.dashboardCard}`}>
                    <h2 className={styles.sectionTitle}>
                        SITE SETTINGS
                    </h2>
                    <form onSubmit={handleUpdateSiteSettings}>
                        <div className={styles.formGroup}>
                            <label htmlFor="siteName">Site Name</label>
                            <input
                                type="text"
                                id="siteName"
                                value={siteName}
                                onChange={(e) => setSiteName(e.target.value)}
                                placeholder="Blackout"
                                required
                                disabled={settingsLoading}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                rows={3}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="A developer's blog..."
                                required
                                disabled={settingsLoading}
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '0.5rem'
                            }}>
                                <label htmlFor="aboutContent" style={{ marginBottom: 0 }}>
                                    About Content
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setIsEditingAbout(!isEditingAbout)}
                                    className={styles.textBtn}
                                >
                                    {isEditingAbout ? 'PREVIEW' : 'EDIT'}
                                </button>
                            </div>

                            {!isEditingAbout ? (
                                <div className={styles.previewBox}>
                                    <SettingsMarkdownPreview content={aboutContent || 'No content.'} />
                                </div>
                            ) : (
                                <textarea
                                    id="aboutContent"
                                    rows={8}
                                    value={aboutContent}
                                    onChange={(e) => setAboutContent(e.target.value)}
                                    placeholder="# About..."
                                    disabled={settingsLoading}
                                    className={styles.codeTextarea}
                                />
                            )}
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={settingsLoading}>
                            SAVE SITE SETTINGS
                        </button>
                    </form>
                </div>

                {/* 3. PRIVACY POLICY CARD */}
                <div className={`card ${styles.dashboardCard}`}>
                    <h2 className={styles.sectionTitle}>
                        PRIVACY POLICY
                    </h2>
                    <form onSubmit={handleUpdatePrivacySettings}>
                        <div className={styles.formGroup}>
                            <label htmlFor="contactEmail">Contact Email</label>
                            <input
                                type="email"
                                id="contactEmail"
                                value={contactEmail}
                                onChange={(e) => setContactEmail(e.target.value)}
                                placeholder="privacy@blackout.com"
                                disabled={settingsLoading}
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '0.5rem'
                            }}>
                                <label htmlFor="privacyPolicy" style={{ marginBottom: 0 }}>
                                    Policy Content
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setIsEditingPrivacy(!isEditingPrivacy)}
                                    className={styles.textBtn}
                                >
                                    {isEditingPrivacy ? 'PREVIEW' : 'EDIT'}
                                </button>
                            </div>

                            {!isEditingPrivacy ? (
                                <div className={styles.previewBox}>
                                    <SettingsMarkdownPreview content={privacyPolicy || 'No policy set.'} />
                                </div>
                            ) : (
                                <textarea
                                    id="privacyPolicy"
                                    rows={8}
                                    value={privacyPolicy}
                                    onChange={(e) => setPrivacyPolicy(e.target.value)}
                                    placeholder="# Privacy Policy..."
                                    disabled={settingsLoading}
                                    className={styles.codeTextarea}
                                />
                            )}
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={settingsLoading}>
                            SAVE PRIVACY POLICY
                        </button>
                    </form>
                </div>

                {/* 4. SEO SETTINGS CARD */}
                <div className={`card ${styles.dashboardCard}`}>
                    <h2 className={styles.sectionTitle}>
                        SEO SETTINGS
                    </h2>
                    <form onSubmit={handleUpdateSEO}>
                        <div className={styles.formGroup}>
                            <label htmlFor="metaTitle">Meta Title</label>
                            <input
                                type="text"
                                id="metaTitle"
                                value={metaTitle}
                                onChange={(e) => setMetaTitle(e.target.value)}
                                placeholder="Site Title"
                                disabled={settingsLoading}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="metaDescription">Meta Description</label>
                            <textarea
                                id="metaDescription"
                                rows={2}
                                value={metaDescription}
                                onChange={(e) => setMetaDescription(e.target.value)}
                                placeholder="Description..."
                                disabled={settingsLoading}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="metaKeywords">Keywords</label>
                            <input
                                type="text"
                                id="metaKeywords"
                                value={metaKeywords}
                                onChange={(e) => setMetaKeywords(e.target.value)}
                                placeholder="blog, tech..."
                                disabled={settingsLoading}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="ogImage">OG Image URL</label>
                            <input
                                type="text"
                                id="ogImage"
                                value={ogImage}
                                onChange={(e) => setOgImage(e.target.value)}
                                placeholder="https://..."
                                disabled={settingsLoading}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="googleAnalyticsId">Google Analytics ID</label>
                            <input
                                type="text"
                                id="googleAnalyticsId"
                                value={googleAnalyticsId}
                                onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                                placeholder="G-XXXXXXXXXX"
                                disabled={settingsLoading}
                            />
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={settingsLoading}>
                            SAVE SEO SETTINGS
                        </button>
                    </form>
                </div>

                {/* 5. SMTP SETTINGS CARD */}
                <div className={`card ${styles.dashboardCard}`}>
                    <h2 className={styles.sectionTitle}>
                        SMTP SETTINGS
                    </h2>
                    <form onSubmit={handleUpdateSMTP}>
                        <div className={styles.formGroup}>
                            <label htmlFor="smtpHost">SMTP Host</label>
                            <input
                                type="text"
                                id="smtpHost"
                                value={smtpHost}
                                onChange={(e) => setSmtpHost(e.target.value)}
                                placeholder="smtp.example.com"
                                disabled={settingsLoading}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="smtpPort">SMTP Port</label>
                            <input
                                type="number"
                                id="smtpPort"
                                value={smtpPort}
                                onChange={(e) => setSmtpPort(parseInt(e.target.value))}
                                placeholder="587"
                                disabled={settingsLoading}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="smtpUser">SMTP User</label>
                            <input
                                type="text"
                                id="smtpUser"
                                value={smtpUser}
                                onChange={(e) => setSmtpUser(e.target.value)}
                                placeholder="user@example.com"
                                disabled={settingsLoading}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="smtpPassword">SMTP Password</label>
                            <input
                                type="password"
                                id="smtpPassword"
                                value={smtpPassword}
                                onChange={(e) => setSmtpPassword(e.target.value)}
                                placeholder="********"
                                disabled={settingsLoading}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="smtpFromEmail">From Email</label>
                            <input
                                type="email"
                                id="smtpFromEmail"
                                value={smtpFromEmail}
                                onChange={(e) => setSmtpFromEmail(e.target.value)}
                                placeholder="noreply@example.com"
                                disabled={settingsLoading}
                            />
                        </div>

                        <div className={styles.formGroup} style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
                            <input
                                type="checkbox"
                                id="smtpSecure"
                                checked={smtpSecure}
                                onChange={(e) => setSmtpSecure(e.target.checked)}
                                disabled={settingsLoading}
                                style={{ width: 'auto', margin: 0 }}
                            />
                            <label htmlFor="smtpSecure" style={{ marginBottom: 0 }}>Secure (SSL/TLS)</label>
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={settingsLoading}>
                            SAVE SMTP SETTINGS
                        </button>
                    </form>
                </div>
            </Masonry>
        </div>
    )
}

export default function AdminPage() {
    return (
        <ClientOnly>
            <AdminContent />
        </ClientOnly>
    )
}
