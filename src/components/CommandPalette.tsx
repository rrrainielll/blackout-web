'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createPortal } from 'react-dom';

interface SearchResult {
    id: number;
    title: string;
    slug: string;
    excerpt?: string;
    type: 'post' | 'page';
}

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [mounted, setMounted] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
    }, []);

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen) {
            // Small timeout to ensure element is rendered
            setTimeout(() => {
                inputRef.current?.focus();
            }, 50);
            setQuery('');
            setResults([]);
            setSelectedIndex(0);
            // Prevent body scroll
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Search debounce
    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        const controller = new AbortController();
        const signal = controller.signal;

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal });
                if (res.ok) {
                    const data = await res.json();
                    if (!signal.aborted) {
                        setResults(data.results || []);
                    }
                }
            } catch (error) {
                if (error instanceof Error && error.name === 'AbortError') {
                    return;
                }
                console.error('Search error:', error);
            } finally {
                if (!signal.aborted) {
                    setLoading(false);
                }
            }
        }, 300);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [query]);

    // Keyboard navigation
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter' && results.length > 0) {
            e.preventDefault();
            const selected = results[selectedIndex];
            if (selected) {
                router.push(`/?post=${selected.slug}`);
                onClose();
            }
        } else if (e.key === 'Escape') {
            onClose();
        }
    }, [results, selectedIndex, router, onClose]);

    if (!mounted || !isOpen) return null;

    const Highlighted = ({ text, highlight }: { text: string, highlight: string }) => {
        if (!highlight.trim()) {
            return <>{text}</>;
        }
        const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        const parts = text.split(regex);

        return (
            <>
                {parts.map((part, i) =>
                    regex.test(part) ? <mark key={i}>{part}</mark> : <span key={i}>{part}</span>
                )}
            </>
        );
    };

    return createPortal(
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                paddingTop: '20vh'
            }}
        >
            {/* Backdrop */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    backdropFilter: 'blur(4px)',
                    animation: 'fadeIn 0.2s ease-out'
                }}
                onClick={onClose}
            />

            {/* Modal */}
            <div
                style={{
                    position: 'relative',
                    width: '90%',
                    maxWidth: '640px',
                    zIndex: 10000,
                    animation: 'slideDown 0.3s ease-out'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <style jsx>{`
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    @keyframes slideDown {
                        from {
                            opacity: 0;
                            transform: translateY(-20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                    mark {
                        background-color: var(--color-yellow-300);
                        color: var(--color-gray-900);
                        padding: 0.1em 0;
                        border-radius: 3px;
                    }
                `}</style>

                <div
                    style={{
                        background: 'var(--secondary)',
                        border: '1px solid var(--border)',
                        borderRadius: '0',
                        overflow: 'hidden',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}
                >
                    {/* Search Input */}
                    <div style={{
                        padding: '1.5rem',
                        borderBottom: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                    }}>
                        {/* Search Icon */}
                        <svg
                            style={{ width: '20px', height: '20px', opacity: 0.5 }}
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>

                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Search posts..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            style={{
                                flex: 1,
                                background: 'transparent',
                                border: 'none',
                                outline: 'none',
                                color: 'var(--foreground)',
                                fontSize: '1rem',
                                fontFamily: 'var(--font-mono)'
                            }}
                            className="font-mono"
                        />

                        {/* Keyboard hint */}
                        <kbd style={{
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.75rem',
                            border: '1px solid var(--border)',
                            color: '#666',
                            fontFamily: 'var(--font-mono)'
                        }}>
                            ESC
                        </kbd>
                    </div>

                    {/* Results */}
                    <div style={{
                        maxHeight: '400px',
                        overflowY: 'auto'
                    }}>
                        {loading && (
                            <div style={{
                                padding: '3rem',
                                textAlign: 'center',
                                color: '#666'
                            }}>
                                <div style={{
                                    display: 'inline-block',
                                    width: '20px',
                                    height: '20px',
                                    border: '2px solid var(--border)',
                                    borderTopColor: 'var(--foreground)',
                                    borderRadius: '50%',
                                    animation: 'spin 0.8s linear infinite'
                                }} />
                            </div>
                        )}

                        {!loading && !query && (
                            <div style={{
                                padding: '3rem',
                                textAlign: 'center',
                                color: '#666',
                                fontSize: '0.875rem'
                            }}>
                                <svg
                                    style={{ width: '48px', height: '48px', margin: '0 auto 1rem', opacity: 0.3 }}
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                </svg>
                                <p>Type to search posts...</p>
                            </div>
                        )}

                        {!loading && query && results.length === 0 && (
                            <div style={{
                                padding: '3rem',
                                textAlign: 'center',
                                color: '#666',
                                fontSize: '0.875rem'
                            }}>
                                No results found for &quot;{query}&quot;
                            </div>
                        )}

                        {!loading && results.length > 0 && (
                            <div>
                                {results.map((result, index) => (
                                    <Link
                                        key={result.id}
                                        href={`/?post=${result.slug}`}
                                        onClick={onClose}
                                        style={{
                                            display: 'block',
                                            padding: '1rem 1.5rem',
                                            borderBottom: index < results.length - 1 ? '1px solid var(--border)' : 'none',
                                            background: index === selectedIndex ? 'var(--hover)' : 'transparent',
                                            cursor: 'pointer',
                                            transition: 'background 0.15s ease',
                                            textDecoration: 'none',
                                            color: 'inherit'
                                        }}
                                        onMouseEnter={() => setSelectedIndex(index)}
                                    >
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '1rem'
                                        }}>
                                            {/* Icon */}
                                            <svg
                                                style={{
                                                    width: '16px',
                                                    height: '16px',
                                                    marginTop: '0.25rem',
                                                    flexShrink: 0,
                                                    opacity: 0.5
                                                }}
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                                            </svg>

                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{
                                                    fontWeight: '600',
                                                    marginBottom: '0.25rem',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    <Highlighted text={result.title} highlight={query} />
                                                </div>
                                                {result.excerpt && (
                                                    <div style={{
                                                        fontSize: '0.875rem',
                                                        color: '#666',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap'
                                                    }}>
                                                        <Highlighted text={result.excerpt} highlight={query} />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Enter hint for selected item */}
                                            {index === selectedIndex && (
                                                <kbd style={{
                                                    padding: '0.25rem 0.5rem',
                                                    fontSize: '0.75rem',
                                                    border: '1px solid var(--border)',
                                                    color: '#666',
                                                    fontFamily: 'var(--font-mono)',
                                                    flexShrink: 0
                                                }}>
                                                    ↵
                                                </kbd>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div style={{
                        padding: '0.75rem 1.5rem',
                        borderTop: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.75rem',
                        color: '#666'
                    }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <kbd style={{ padding: '0.125rem 0.375rem', border: '1px solid var(--border)' }}>↑</kbd>
                                <kbd style={{ padding: '0.125rem 0.375rem', border: '1px solid var(--border)' }}>↓</kbd>
                                <span>Navigate</span>
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <kbd style={{ padding: '0.125rem 0.375rem', border: '1px solid var(--border)' }}>↵</kbd>
                                <span>Select</span>
                            </span>
                        </div>
                        <div>{results.length} {results.length === 1 ? 'result' : 'results'}</div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
