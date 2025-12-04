'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function LoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const setupSuccess = searchParams.get('setup') === 'success'

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const result = await signIn('credentials', {
            email,
            password,
            redirect: false,
        })

        if (result?.error) {
            setError('Invalid email or password')
            setLoading(false)
        } else {
            router.push('/admin')
            router.refresh()
        }
    }

    return (
        <div style={{ maxWidth: '450px', margin: '5rem auto', padding: '0 2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem' }}>Admin Login</h1>
                <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginTop: '1rem' }}>
                    Sign in to manage your blog
                </p>
            </div>

            {setupSuccess && (
                <div style={{
                    padding: '1rem',
                    marginBottom: '1.5rem',
                    backgroundColor: '#14532d20',
                    border: '1px solid #166534',
                    borderRadius: '0.5rem',
                    color: '#86efac',
                    textAlign: 'center'
                }}>
                    Account created successfully! Please log in.
                </div>
            )}

            <form onSubmit={handleSubmit} className="card">
                {error && (
                    <div style={{
                        padding: '1rem',
                        marginBottom: '1.5rem',
                        backgroundColor: '#991b1b20',
                        border: '1px solid #991b1b',
                        borderRadius: '0.5rem',
                        color: '#fca5a5'
                    }}>
                        {error}
                    </div>
                )}

                <div style={{ marginBottom: '1.5rem' }}>
                    <label htmlFor="email">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                    />
                    <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                        <Link href="/forgot-password" style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                            Forgot Password?
                        </Link>
                    </div>
                </div>

                <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                    disabled={loading}
                >
                    {loading ? 'Signing in...' : 'Sign In'}
                </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <Link href="/" style={{ color: '#94a3b8' }}>
                    ← Back to Blog
                </Link>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div style={{ maxWidth: '450px', margin: '5rem auto', padding: '0 2rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2.5rem' }}>Admin Login</h1>
                <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginTop: '1rem' }}>
                    Loading...
                </p>
            </div>
        }>
            <LoginForm />
        </Suspense>
    )
}
