'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import styles from './RouteLoadingBar.module.css'

export default function RouteLoadingBar() {
    const [loading, setLoading] = useState(false)
    const pathname = usePathname()
    const searchParams = useSearchParams()

    useEffect(() => {
        setLoading(false)
    }, [pathname, searchParams])

    // Show loading on navigation start
    useEffect(() => {
        const handleStart = () => setLoading(true)
        const handleComplete = () => setLoading(false)

        // Listen for link clicks
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement
            const link = target.closest('a')
            if (link && link.href && !link.target && !link.download) {
                const url = new URL(link.href)
                if (url.origin === window.location.origin && url.pathname !== pathname) {
                    setLoading(true)
                }
            }
        }

        document.addEventListener('click', handleClick)

        return () => {
            document.removeEventListener('click', handleClick)
        }
    }, [pathname])

    if (!loading) return null

    return (
        <div className={styles.loadingBar}>
            <div className={styles.loadingBarInner}>
                <Loader2 size={16} className={styles.spinner} strokeWidth={2} />
            </div>
        </div>
    )
}
