'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [focused, setFocused] = useState(false);
    const emailInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        // Basic email validation
        if (!email || !/^[^\s]+@[^\s]+\.[^\s]+$/.test(email)) {
            setError('Please enter a valid email address.');
            setLoading(false);
            emailInputRef.current?.focus();
            return;
        }

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            let data;
            try {
                data = await res.json();
            } catch {
                data = {};
            }
            if (res.ok) {
                setMessage(data.message || 'If your email is registered, a reset link has been sent.');
                setEmail('');
            } else {
                setError(data.error || 'Something went wrong. Please try again.');
                emailInputRef.current?.focus();
            }
        } catch (err) {
            setError('Network error. Please try again.');
            emailInputRef.current?.focus();
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateX(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                @keyframes pulse {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.8;
                    }
                }

                .animate-fade-in {
                    animation: fadeIn 0.6s ease-out;
                }

                .animate-slide-in {
                    animation: slideIn 0.4s ease-out;
                }

                .animate-pulse-slow {
                    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }

                .glass-effect {
                    background: rgba(17, 17, 17, 0.8);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                }

                .input-glow:focus {
                    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
                }
            `}</style>

            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--background)',
                padding: '2rem 1rem',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Subtle background gradient effect */}
                <div style={{
                    position: 'absolute',
                    top: '20%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '600px',
                    height: '600px',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 70%)',
                    pointerEvents: 'none',
                    zIndex: 0
                }} />

                <div style={{
                    maxWidth: '480px',
                    width: '100%',
                    position: 'relative',
                    zIndex: 1
                }} className="animate-fade-in">

                    {/* Header Section */}
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <div style={{
                            display: 'inline-block',
                            padding: '0.5rem 1rem',
                            border: '1px solid var(--border)',
                            marginBottom: '1.5rem',
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            color: '#999'
                        }}>
                            Password Recovery
                        </div>

                        <h1 style={{
                            fontSize: '2.5rem',
                            fontWeight: '700',
                            marginBottom: '1rem',
                            letterSpacing: '-0.02em',
                            background: 'linear-gradient(to bottom, #ffffff 0%, #999999 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>
                            Forgot Password?
                        </h1>

                        <p style={{
                            color: '#666',
                            fontSize: '0.9rem',
                            lineHeight: '1.6',
                            maxWidth: '380px',
                            margin: '0 auto'
                        }}>
                            No worries. Enter your email address and we&apos;ll send you instructions to reset your password.
                        </p>
                    </div>

                    {/* Form Card */}
                    <form
                        onSubmit={handleSubmit}
                        aria-label="Forgot password form"
                        className="card glass-effect"
                        style={{
                            padding: '2rem',
                            marginBottom: '1.5rem'
                        }}
                    >
                        {/* Success Message */}
                        {message && (
                            <div
                                role="status"
                                className="animate-slide-in"
                                style={{
                                    padding: '1rem',
                                    marginBottom: '1.5rem',
                                    background: 'rgba(34, 197, 94, 0.1)',
                                    border: '1px solid rgba(34, 197, 94, 0.3)',
                                    color: '#4ade80',
                                    fontSize: '0.875rem',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '0.75rem'
                                }}
                            >
                                <svg
                                    style={{ minWidth: '20px', marginTop: '2px' }}
                                    width="20"
                                    height="20"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                >
                                    <path
                                        d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zm5.707 7.707l-7 7a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414L8 12.586l6.293-6.293a1 1 0 111.414 1.414z"
                                        fill="currentColor"
                                    />
                                </svg>
                                <span style={{ flex: 1 }}>{message}</span>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div
                                id="email-error"
                                role="alert"
                                className="animate-slide-in"
                                style={{
                                    padding: '1rem',
                                    marginBottom: '1.5rem',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    color: '#f87171',
                                    fontSize: '0.875rem',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '0.75rem'
                                }}
                            >
                                <svg
                                    style={{ minWidth: '20px', marginTop: '2px' }}
                                    width="20"
                                    height="20"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                >
                                    <path
                                        d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zm1 14a1 1 0 11-2 0 1 1 0 012 0zm-1-3a1 1 0 01-1-1V6a1 1 0 112 0v4a1 1 0 01-1 1z"
                                        fill="currentColor"
                                    />
                                </svg>
                                <span style={{ flex: 1 }}>{error}</span>
                            </div>
                        )}

                        {/* Email Input */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label
                                htmlFor="email-address"
                                style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontSize: '0.75rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    color: focused ? '#fff' : '#999',
                                    transition: 'color 0.2s ease'
                                }}
                            >
                                Email Address
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    ref={emailInputRef}
                                    id="email-address"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    aria-required="true"
                                    aria-invalid={!!error}
                                    aria-describedby={error ? 'email-error' : undefined}
                                    className="input-glow"
                                    style={{
                                        width: '100%',
                                        padding: '0.875rem 1rem',
                                        paddingLeft: '3rem',
                                        background: 'var(--background)',
                                        border: `1px solid ${focused ? 'var(--foreground)' : 'var(--border)'}`,
                                        color: 'var(--foreground)',
                                        fontSize: '0.9rem',
                                        fontFamily: 'var(--font-mono)',
                                        transition: 'all 0.2s ease',
                                        outline: 'none'
                                    }}
                                    placeholder="your.email@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                    onFocus={() => setFocused(true)}
                                    onBlur={() => setFocused(false)}
                                />
                                <svg
                                    style={{
                                        position: 'absolute',
                                        left: '1rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        width: '18px',
                                        height: '18px',
                                        opacity: focused ? 1 : 0.4,
                                        transition: 'opacity 0.2s ease'
                                    }}
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                </svg>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || !email}
                            className="btn btn-primary"
                            style={{
                                width: '100%',
                                padding: '1rem',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                letterSpacing: '0.05em',
                                textTransform: 'uppercase',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            aria-busy={loading}
                        >
                            {loading ? (
                                <span style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <svg
                                        className="animate-pulse-slow"
                                        style={{ width: '20px', height: '20px' }}
                                        viewBox="0 0 24 24"
                                        fill="none"
                                    >
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.25" />
                                        <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                            <animateTransform
                                                attributeName="transform"
                                                type="rotate"
                                                from="0 12 12"
                                                to="360 12 12"
                                                dur="1s"
                                                repeatCount="indefinite"
                                            />
                                        </path>
                                    </svg>
                                    Sending...
                                </span>
                            ) : (
                                <span style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                }}>
                                    <svg
                                        style={{ width: '18px', height: '18px' }}
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                                    </svg>
                                    Send Reset Link
                                </span>
                            )}
                        </button>
                    </form>

                    {/* Back to Login Link */}
                    <div style={{ textAlign: 'center' }}>
                        <Link
                            href="/login"
                            aria-label="Back to Login"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                color: '#666',
                                fontSize: '0.875rem',
                                transition: 'color 0.2s ease',
                                padding: '0.5rem'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#666'}
                        >
                            <svg
                                style={{ width: '16px', height: '16px' }}
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                            Back to Login
                        </Link>
                    </div>

                    {/* Footer Help Text */}
                    <div style={{
                        textAlign: 'center',
                        marginTop: '3rem',
                        paddingTop: '2rem',
                        borderTop: '1px solid var(--border)'
                    }}>
                        <p style={{
                            color: '#666',
                            fontSize: '0.8rem',
                            lineHeight: '1.6'
                        }}>
                            Need help?{' '}
                            <Link
                                href="/"
                                style={{
                                    color: '#999',
                                    textDecoration: 'underline',
                                    transition: 'color 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                                onMouseLeave={(e) => e.currentTarget.style.color = '#999'}
                            >
                                Visit our blog
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
