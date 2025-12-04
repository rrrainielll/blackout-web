'use client';

import { useState, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [focused, setFocused] = useState<'password' | 'confirm' | null>(null);
    const passwordInputRef = useRef<HTMLInputElement>(null);

    // Password strength calculator
    const getPasswordStrength = (pwd: string) => {
        if (!pwd) return { strength: 0, label: '', color: '' };

        let strength = 0;
        if (pwd.length >= 8) strength++;
        if (pwd.length >= 12) strength++;
        if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
        if (/\d/.test(pwd)) strength++;
        if (/[^a-zA-Z0-9]/.test(pwd)) strength++;

        const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
        const colors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'];

        return {
            strength,
            label: labels[strength],
            color: colors[strength]
        };
    };

    const passwordStrength = getPasswordStrength(password);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            setLoading(false);
            passwordInputRef.current?.focus();
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (!token) {
            setError('Invalid token');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage(data.message || 'Password reset successfully!');
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            } else {
                setError(data.error || 'Something went wrong');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--background)',
                padding: '2rem 1rem'
            }}>
                <div style={{ textAlign: 'center', maxWidth: '480px' }}>
                    <div style={{
                        padding: '2rem',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        marginBottom: '2rem'
                    }}>
                        <svg
                            style={{ width: '48px', height: '48px', margin: '0 auto 1rem', color: '#f87171' }}
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <p style={{ color: '#f87171', fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                            Invalid or Missing Token
                        </p>
                        <p style={{ color: '#666', fontSize: '0.875rem' }}>
                            The reset link is invalid or has expired.
                        </p>
                    </div>
                    <Link
                        href="/forgot-password"
                        className="btn btn-primary"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.5rem'
                        }}
                    >
                        <svg style={{ width: '16px', height: '16px' }} viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                        </svg>
                        Request New Link
                    </Link>
                </div>
            </div>
        );
    }

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
                            Secure Password Reset
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
                            Reset Password
                        </h1>

                        <p style={{
                            color: '#666',
                            fontSize: '0.9rem',
                            lineHeight: '1.6',
                            maxWidth: '380px',
                            margin: '0 auto'
                        }}>
                            Choose a strong password to secure your account.
                        </p>
                    </div>

                    {/* Form Card */}
                    <form
                        onSubmit={handleSubmit}
                        aria-label="Reset password form"
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
                                    flexDirection: 'column',
                                    gap: '0.5rem'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
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
                                <span style={{ fontSize: '0.75rem', color: '#666', paddingLeft: '2rem' }}>
                                    Redirecting to login...
                                </span>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div
                                id="password-error"
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

                        {/* Password Input */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label
                                htmlFor="password"
                                style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontSize: '0.75rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    color: focused === 'password' ? '#fff' : '#999',
                                    transition: 'color 0.2s ease'
                                }}
                            >
                                New Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    ref={passwordInputRef}
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    aria-required="true"
                                    aria-invalid={!!error}
                                    aria-describedby={error ? 'password-error' : undefined}
                                    className="input-glow"
                                    style={{
                                        width: '100%',
                                        padding: '0.875rem 3rem 0.875rem 3rem',
                                        background: 'var(--background)',
                                        border: `1px solid ${focused === 'password' ? 'var(--foreground)' : 'var(--border)'}`,
                                        color: 'var(--foreground)',
                                        fontSize: '0.9rem',
                                        fontFamily: 'var(--font-mono)',
                                        transition: 'all 0.2s ease',
                                        outline: 'none'
                                    }}
                                    placeholder="Enter your new password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading}
                                    onFocus={() => setFocused('password')}
                                    onBlur={() => setFocused(null)}
                                />
                                {/* Lock Icon */}
                                <svg
                                    style={{
                                        position: 'absolute',
                                        left: '1rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        width: '18px',
                                        height: '18px',
                                        opacity: focused === 'password' ? 1 : 0.4,
                                        transition: 'opacity 0.2s ease'
                                    }}
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                </svg>
                                {/* Show/Hide Button */}
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '1rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '0',
                                        color: '#666',
                                        transition: 'color 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = '#666'}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? (
                                        <svg style={{ width: '18px', height: '18px' }} viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                                            <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                                        </svg>
                                    ) : (
                                        <svg style={{ width: '18px', height: '18px' }} viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {/* Password Strength Indicator */}
                            {password && (
                                <div style={{ marginTop: '0.75rem' }}>
                                    <div style={{
                                        display: 'flex',
                                        gap: '0.25rem',
                                        marginBottom: '0.5rem'
                                    }}>
                                        {[1, 2, 3, 4, 5].map((level) => (
                                            <div
                                                key={level}
                                                style={{
                                                    flex: 1,
                                                    height: '4px',
                                                    background: level <= passwordStrength.strength ? passwordStrength.color : '#333',
                                                    transition: 'background 0.3s ease'
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <p style={{
                                        fontSize: '0.75rem',
                                        color: passwordStrength.color || '#666'
                                    }}>
                                        {passwordStrength.label || 'Enter password'}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password Input */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label
                                htmlFor="confirm-password"
                                style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontSize: '0.75rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    color: focused === 'confirm' ? '#fff' : '#999',
                                    transition: 'color 0.2s ease'
                                }}
                            >
                                Confirm Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    id="confirm-password"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    required
                                    aria-required="true"
                                    className="input-glow"
                                    style={{
                                        width: '100%',
                                        padding: '0.875rem 3rem 0.875rem 3rem',
                                        background: 'var(--background)',
                                        border: `1px solid ${focused === 'confirm' ? 'var(--foreground)' : 'var(--border)'}`,
                                        color: 'var(--foreground)',
                                        fontSize: '0.9rem',
                                        fontFamily: 'var(--font-mono)',
                                        transition: 'all 0.2s ease',
                                        outline: 'none'
                                    }}
                                    placeholder="Confirm your new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    disabled={loading}
                                    onFocus={() => setFocused('confirm')}
                                    onBlur={() => setFocused(null)}
                                />
                                {/* Check Icon */}
                                <svg
                                    style={{
                                        position: 'absolute',
                                        left: '1rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        width: '18px',
                                        height: '18px',
                                        opacity: focused === 'confirm' ? 1 : 0.4,
                                        transition: 'opacity 0.2s ease',
                                        color: password && confirmPassword && password === confirmPassword ? '#22c55e' : 'currentColor'
                                    }}
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                {/* Show/Hide Button */}
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '1rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '0',
                                        color: '#666',
                                        transition: 'color 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = '#666'}
                                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showConfirmPassword ? (
                                        <svg style={{ width: '18px', height: '18px' }} viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                                            <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                                        </svg>
                                    ) : (
                                        <svg style={{ width: '18px', height: '18px' }} viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {/* Match Indicator */}
                            {confirmPassword && (
                                <p style={{
                                    marginTop: '0.5rem',
                                    fontSize: '0.75rem',
                                    color: password === confirmPassword ? '#22c55e' : '#ef4444'
                                }}>
                                    {password === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || !password || !confirmPassword}
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
                                    Resetting...
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
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                    </svg>
                                    Reset Password
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
                            Remember your password?{' '}
                            <Link
                                href="/login"
                                style={{
                                    color: '#999',
                                    textDecoration: 'underline',
                                    transition: 'color 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                                onMouseLeave={(e) => e.currentTarget.style.color = '#999'}
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--background)'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        border: '3px solid var(--border)',
                        borderTopColor: 'var(--foreground)',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto'
                    }} />
                    <style jsx>{`
                        @keyframes spin {
                            to { transform: rotate(360deg); }
                        }
                    `}</style>
                </div>
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    );
}
