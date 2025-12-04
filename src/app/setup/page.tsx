'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './setup.module.css'

export default function SetupPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match')
            return
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        setLoading(true)

        try {
            const response = await fetch('/api/setup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                })
            })

            if (!response.ok) {
                const data = await response.json()
                setError(data.error || 'Failed to create account')
                setLoading(false)
                return
            }

            router.push('/login?setup=success')
        } catch (err) {
            setError('An error occurred. Please try again.')
            setLoading(false)
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles['form-container']}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Welcome to Blackout</h1>
                    <p className={styles.subtitle}>Create your admin account to get started</p>
                </div>

                <form onSubmit={handleSubmit} className="card">
                    {error && <div className={styles.error}>{error}</div>}

                    <div className={styles.field}>
                        <label htmlFor="name">Full Name</label>
                        <input
                            type="text"
                            id="name"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                            disabled={loading}
                            placeholder="John Doe"
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            required
                            disabled={loading}
                            placeholder="john@example.com"
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            required
                            minLength={6}
                            disabled={loading}
                            placeholder="••••••••"
                        />
                    </div>

                    <div className={styles['field-last']}>
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={e =>
                                setFormData({ ...formData, confirmPassword: e.target.value })
                            }
                            required
                            minLength={6}
                            disabled={loading}
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        className={`btn btn-primary ${styles.button}`}
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Create Admin Account'}
                    </button>
                </form>
            </div>
        </div>
    )
}
