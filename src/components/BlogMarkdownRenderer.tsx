'use client'

import React, { useState, useEffect, memo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Copy, Check } from 'lucide-react'

interface BlogMarkdownRendererProps {
    content: string
    components?: Record<string, React.ComponentType<any>>
}

const customTheme = {
    ...vscDarkPlus,
    'pre[class*="language-"]': {
        ...vscDarkPlus['pre[class*="language-"]'],
        background: '#111',
        border: '1px solid #333',
        margin: 0,
    },
}

const CopyButton = memo(({ text }: { text: string }) => {
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        if (copied) {
            const timer = setTimeout(() => setCopied(false), 2000)
            return () => clearTimeout(timer)
        }
    }, [copied])

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text)
            setCopied(true)
        } catch (err) {
            console.error('Failed to copy text: ', err)
        }
    }

    return (
        <button
            onClick={handleCopy}
            style={{
                position: 'absolute',
                top: '0.5rem',
                right: '0.5rem',
                padding: '0.35rem',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '4px',
                cursor: 'pointer',
                color: '#ccc',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
            }}
            aria-label="Copy code"
            title="Copy code"
            onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                e.currentTarget.style.color = '#fff'
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                e.currentTarget.style.color = '#ccc'
            }}
        >
            {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
    )
})

CopyButton.displayName = 'CopyButton';

function BlogMarkdownRenderer({ content, components = {} }: BlogMarkdownRendererProps) {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
                code({ node, inline, className, children, ...props }: { node?: any, inline?: boolean, className?: string, children?: React.ReactNode, [key: string]: any }) {
                    const match = /language-(\w+)/.exec(className || '')
                    const codeText = String(children).replace(/\n$/, '')

                    return !inline && match ? (
                        <div style={{ position: 'relative', margin: '1rem 0' }}>
                            <CopyButton text={codeText} />
                            <SyntaxHighlighter
                                style={customTheme}
                                language={match[1]}
                                PreTag="div"
                                customStyle={{
                                    margin: 0,
                                    background: '#111',
                                    border: '1px solid #333',
                                    fontSize: '0.85rem',
                                    padding: '1rem',
                                    borderRadius: '4px',
                                }}
                                {...props}
                            >
                                {codeText}
                            </SyntaxHighlighter>
                        </div>
                    ) : (
                        <code
                            style={{
                                background: '#111',
                                padding: '0.2rem 0.4rem',
                                border: '1px solid #333',
                                fontSize: '0.85em',
                                fontFamily: 'var(--font-mono)',
                                borderRadius: '3px'
                            }}
                            {...props}
                        >
                            {children}
                        </code>
                    )
                },
                img({ node, ...props }: { node?: any, [key: string]: any }) {
                    if (!props.src) return null;
                    return (
                        <img
                            style={{
                                maxWidth: '100%',
                                height: 'auto',
                                borderRadius: '4px',
                                margin: '1.5rem 0',
                                display: 'block'
                            }}
                            {...props}
                        />
                    )
                },
                video({ node, ...props }: { node?: any, [key: string]: any }) {
                    return (
                        <video
                            controls
                            style={{
                                maxWidth: '100%',
                                borderRadius: '4px',
                                margin: '1.5rem 0',
                                display: 'block'
                            }}
                            {...props}
                        />
                    )
                },
                ...components
            }}
        >
            {content}
        </ReactMarkdown>
    )
}

export default memo(BlogMarkdownRenderer);
