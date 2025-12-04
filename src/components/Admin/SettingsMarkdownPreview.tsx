'use client'

import React from 'react'
import BlogMarkdownRenderer from '@/components/BlogMarkdownRenderer'

interface SettingsMarkdownPreviewProps {
    content: string
}

export default function SettingsMarkdownPreview({ content }: SettingsMarkdownPreviewProps) {
    return (
        <div style={{
            minHeight: '300px',
            padding: '1.5rem',
            backgroundColor: '#111',
            border: '1px solid #333',
            borderRadius: '0',
            overflowY: 'auto',
            maxHeight: '500px'
        }}>
            <div className="prose" style={{ maxWidth: 'none' }}>
                <BlogMarkdownRenderer
                    content={content || '*No content yet. Click EDIT to add About content.*'}
                    components={{
                        h1({ children, ...props }: { children?: React.ReactNode, [key: string]: any }) {
                            return <h1 style={{
                                fontSize: '1rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                marginBottom: '1rem',
                                marginTop: '1.5rem'
                            }} {...props}>{children}</h1>
                        },
                        h2({ children, ...props }: { children?: React.ReactNode, [key: string]: any }) {
                            return <h2 style={{
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                marginBottom: '1rem',
                                marginTop: '1.5rem'
                            }} {...props}>{children}</h2>
                        },
                        p({ children, ...props }: { children?: React.ReactNode, [key: string]: any }) {
                            return <p style={{
                                fontSize: '0.875rem',
                                lineHeight: 1.8,
                                color: '#999',
                                marginBottom: '1rem'
                            }} {...props}>{children}</p>
                        },
                        ul({ children, ...props }: { children?: React.ReactNode, [key: string]: any }) {
                            return <ul style={{
                                fontSize: '0.875rem',
                                lineHeight: 1.8,
                                color: '#999',
                                marginBottom: '1rem',
                                paddingLeft: '1.5rem'
                            }} {...props}>{children}</ul>
                        },
                        ol({ children, ...props }: { children?: React.ReactNode, [key: string]: any }) {
                            return <ol style={{
                                fontSize: '0.875rem',
                                lineHeight: 1.8,
                                color: '#999',
                                marginBottom: '1rem',
                                paddingLeft: '1.5rem'
                            }} {...props}>{children}</ol>
                        },
                        a({ children, ...props }: { children?: React.ReactNode, [key: string]: any }) {
                            return <a style={{
                                color: '#fff',
                                textDecoration: 'underline'
                            }} {...props}>{children}</a>
                        }
                    }}
                />
            </div>
        </div>
    )
}
