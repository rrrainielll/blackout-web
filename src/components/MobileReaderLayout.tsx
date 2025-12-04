'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ArrowLeft, Calendar, Tag as TagIcon, Eye } from 'lucide-react';
import { getTagColor } from '@/lib/colors';
import PageLoader from '@/components/PageLoader';
import styles from './MobileReaderLayout.module.css';

const BlogMarkdownRenderer = dynamic(() => import('./BlogMarkdownRenderer'), {
    loading: () => <PageLoader fullScreen={false} text="LOADING CONTENT..." />,
    ssr: false
});

interface Post {
    id: number;
    title: string;
    slug: string;
    content: string;
    published: boolean;
    pinned: boolean;
    createdAt: string;
    views: number;
    tags: { tag: { id: number; name: string } }[];
}

interface MobileReaderLayoutProps {
    posts: Post[];
    selectedPost: Post | null;
    onSelectPost: (slug: string) => void;
    settings: {
        siteName: string;
        description: string;
        aboutContent: string;
    };
    aboutComponents: any;
}

export default function MobileReaderLayout({ posts, selectedPost, onSelectPost, settings, aboutComponents }: MobileReaderLayoutProps) {
    // If a post is selected, we show the reader view (post content)
    // If no post is selected, we show the homepage content
    const isPostView = !!selectedPost;

    return (
        <div className={styles.mobileReaderContainer}>
            {/* Homepage Content (Visible when no post is selected) */}
            {!isPostView && (
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

            {/* Post Content (Visible when a post is selected) */}
            {isPostView && selectedPost && (
                <div className={styles.readerView} style={{ transform: 'none', position: 'relative' }}>
                    <div className={styles.readerContent}>
                        <BlogMarkdownRenderer content={selectedPost.content} />
                    </div>

                    {/* Post metadata footer */}
                    <div className={styles.articleMetadata}>
                        <div className={styles.articleDate}>
                            <Calendar size={12} />
                            {new Date(selectedPost.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </div>
                        <div className={styles.articleDate}>
                            <Eye size={12} />
                            {(selectedPost.views || 0) + ' VIEWS'}
                        </div>
                        {selectedPost.tags && selectedPost.tags.length > 0 && (
                            <div className={styles.articleTags}>
                                <TagIcon size={12} />
                                {selectedPost.tags.map(({ tag }) => (
                                    <span
                                        key={tag.id}
                                        className={styles.articleTag}
                                        style={{
                                            color: getTagColor(tag.name),
                                            borderColor: getTagColor(tag.name)
                                        }}
                                    >
                                        {tag.name}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
