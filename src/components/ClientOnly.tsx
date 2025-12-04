'use client'

import { useEffect, useState } from 'react'

export default function ClientOnly({ children }: { children: React.ReactNode }) {
    const [hasMounted, setHasMounted] = useState(false)

    useEffect(() => {
        setHasMounted(true)
    }, [])

    if (!hasMounted) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
                <p>Loading...</p>
            </div>
        )
    }

    return <>{children}</>
}
