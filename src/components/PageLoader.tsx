'use client'

import { Loader2 } from 'lucide-react'
import styles from './PageLoader.module.css'

interface PageLoaderProps {
    fullScreen?: boolean
    size?: number
    text?: string
}

export default function PageLoader({
    fullScreen = true,
    size = 32,
    text
}: PageLoaderProps) {
    if (fullScreen) {
        return (
            <div className={styles.fullScreenLoader}>
                <div className={styles.loaderContent}>
                    <Loader2
                        size={size}
                        className={styles.spinner}
                        strokeWidth={2}
                    />
                    {text && <p className={styles.loaderText}>{text}</p>}
                </div>
            </div>
        )
    }

    return (
        <div className={styles.inlineLoader}>
            <Loader2
                size={size}
                className={styles.spinner}
                strokeWidth={2}
            />
            {text && <p className={styles.loaderText}>{text}</p>}
        </div>
    )
}
