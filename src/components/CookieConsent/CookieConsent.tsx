'use client';

import { useState, useEffect } from 'react';
import { X, Cookie, Shield, Settings } from 'lucide-react';
import styles from './CookieConsent.module.css';

interface CookiePreferences {
    necessary: boolean;
    analytics: boolean;
    timestamp: number;
}

export default function CookieConsent() {
    const [showBanner, setShowBanner] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [preferences, setPreferences] = useState<CookiePreferences>({
        necessary: true,
        analytics: false,
        timestamp: 0,
    });

    useEffect(() => {
        // Check if user has already made a choice
        const savedPreferences = localStorage.getItem('cookie-preferences');

        if (savedPreferences) {
            const parsed = JSON.parse(savedPreferences) as CookiePreferences;
            setPreferences(parsed);

            // Apply analytics preference
            if (parsed.analytics) {
                enableAnalytics();
            } else {
                disableAnalytics();
            }
        } else {
            // Show banner if no preference is saved
            setShowBanner(true);
        }
    }, []);

    const enableAnalytics = () => {
        // Enable Google Analytics if configured
        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('consent', 'update', {
                analytics_storage: 'granted',
            });
        }
    };

    const disableAnalytics = () => {
        // Disable Google Analytics
        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('consent', 'update', {
                analytics_storage: 'denied',
            });
        }
    };

    const savePreferences = (prefs: Partial<CookiePreferences>) => {
        const newPreferences: CookiePreferences = {
            ...preferences,
            ...prefs,
            timestamp: Date.now(),
        };

        setPreferences(newPreferences);
        localStorage.setItem('cookie-preferences', JSON.stringify(newPreferences));

        // Apply analytics preference
        if (newPreferences.analytics) {
            enableAnalytics();
        } else {
            disableAnalytics();
        }

        setShowBanner(false);
        setShowSettings(false);
    };

    const acceptAll = () => {
        savePreferences({ necessary: true, analytics: true });
    };

    const acceptNecessary = () => {
        savePreferences({ necessary: true, analytics: false });
    };

    const handleCustomSave = () => {
        savePreferences(preferences);
    };

    if (!showBanner) return null;

    return (
        <>
            {/* Cookie Banner */}
            <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="cookie-banner-title">
                <div className={styles.banner}>
                    <div className={styles.header}>
                        <div className={styles.iconTitle}>
                            <Cookie size={24} />
                            <h2 id="cookie-banner-title">Cookie Preferences</h2>
                        </div>
                        <button
                            onClick={acceptNecessary}
                            className={styles.closeBtn}
                            aria-label="Close and accept necessary cookies only"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className={styles.content}>
                        <p className={styles.description}>
                            We use cookies to enhance your browsing experience and analyze our traffic.
                            Necessary cookies are required for the site to function properly.
                            You can choose to accept all cookies or customize your preferences.
                        </p>

                        <div className={styles.actions}>
                            <button
                                onClick={acceptAll}
                                className={`${styles.btn} ${styles.btnPrimary}`}
                            >
                                Accept All
                            </button>
                            <button
                                onClick={acceptNecessary}
                                className={`${styles.btn} ${styles.btnSecondary}`}
                            >
                                Necessary Only
                            </button>
                            <button
                                onClick={() => setShowSettings(true)}
                                className={`${styles.btn} ${styles.btnOutline}`}
                            >
                                <Settings size={16} />
                                Customize
                            </button>
                        </div>

                        <a href="/privacy-policy" className={styles.privacyLink}>
                            <Shield size={14} />
                            View Privacy Policy
                        </a>
                    </div>
                </div>
            </div>

            {/* Settings Modal */}
            {showSettings && (
                <div className={styles.modalOverlay} onClick={() => setShowSettings(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>Cookie Settings</h3>
                            <button
                                onClick={() => setShowSettings(false)}
                                className={styles.closeBtn}
                                aria-label="Close settings"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className={styles.modalContent}>
                            {/* Necessary Cookies */}
                            <div className={styles.cookieCategory}>
                                <div className={styles.categoryHeader}>
                                    <div className={styles.categoryInfo}>
                                        <h4>Necessary Cookies</h4>
                                        <span className={styles.badge}>Always Active</span>
                                    </div>
                                    <label className={styles.switch}>
                                        <input
                                            type="checkbox"
                                            checked={true}
                                            disabled
                                            aria-label="Necessary cookies (always active)"
                                        />
                                        <span className={`${styles.slider} ${styles.disabled}`}></span>
                                    </label>
                                </div>
                                <p className={styles.categoryDescription}>
                                    These cookies are essential for the website to function properly.
                                    They enable core functionality such as security, authentication, and network management.
                                </p>
                                <div className={styles.cookieDetails}>
                                    <strong>Cookies used:</strong>
                                    <ul>
                                        <li><code>next-auth.session-token</code> - Authentication session</li>
                                        <li><code>next-auth.csrf-token</code> - CSRF protection</li>
                                        <li><code>cookie-preferences</code> - Your cookie preferences</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Analytics Cookies */}
                            <div className={styles.cookieCategory}>
                                <div className={styles.categoryHeader}>
                                    <div className={styles.categoryInfo}>
                                        <h4>Analytics Cookies</h4>
                                        <span className={styles.badgeOptional}>Optional</span>
                                    </div>
                                    <label className={styles.switch}>
                                        <input
                                            type="checkbox"
                                            checked={preferences.analytics}
                                            onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                                            aria-label="Analytics cookies"
                                        />
                                        <span className={styles.slider}></span>
                                    </label>
                                </div>
                                <p className={styles.categoryDescription}>
                                    These cookies help us understand how visitors interact with our website
                                    by collecting and reporting information anonymously.
                                </p>
                                <div className={styles.cookieDetails}>
                                    <strong>Cookies used:</strong>
                                    <ul>
                                        <li><code>_ga</code> - Google Analytics (2 years)</li>
                                        <li><code>_gid</code> - Google Analytics (24 hours)</li>
                                        <li><code>_gat</code> - Google Analytics (1 minute)</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className={styles.modalActions}>
                            <button
                                onClick={handleCustomSave}
                                className={`${styles.btn} ${styles.btnPrimary}`}
                            >
                                Save Preferences
                            </button>
                            <button
                                onClick={() => setShowSettings(false)}
                                className={`${styles.btn} ${styles.btnSecondary}`}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
