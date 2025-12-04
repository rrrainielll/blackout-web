'use client';

import { SessionProvider } from 'next-auth/react';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { MobileMenuProvider } from '@/contexts/MobileMenuContext';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <NotificationProvider>
                <MobileMenuProvider>
                    {children}
                </MobileMenuProvider>
            </NotificationProvider>
        </SessionProvider>
    );
}
