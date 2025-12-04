'use client';

import React, { useEffect, useState } from 'react';
import CommandPalette from './CommandPalette';
import { Menu } from 'lucide-react';
import { useMobileMenu } from '@/contexts/MobileMenuContext';
import styles from './HeaderActions.module.css';

export default function HeaderActions() {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const { openMenu } = useMobileMenu();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(true);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <>
            <div className={styles.headerActions}>
                <button
                    onClick={() => setIsSearchOpen(true)}
                    className={`btn ${styles.actionBtn} ${styles.searchBtn}`}
                    aria-label="Search (Ctrl+K)"
                >
                    <svg
                        style={{ width: '16px', height: '16px', flexShrink: 0 }}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                            clipRule="evenodd"
                        />
                    </svg>
                    <span className={styles.searchText}>Search</span>
                    <kbd className={styles.searchKbd}>
                        ⌘K
                    </kbd>
                </button>

                <button
                    onClick={openMenu}
                    className={`btn ${styles.actionBtn} ${styles.menuBtn}`}
                    aria-label="Open Menu"
                >
                    <Menu size={20} />
                </button>
            </div>

            <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </>
    );
}
