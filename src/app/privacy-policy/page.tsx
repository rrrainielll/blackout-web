import Link from 'next/link';
import { ArrowLeft, Shield, Mail } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import dynamic from 'next/dynamic';
import PageLoader from '@/components/PageLoader';
import styles from './privacy-policy.module.css';

const BlogMarkdownRenderer = dynamic(() => import('@/components/BlogMarkdownRenderer'), {
    loading: () => <PageLoader fullScreen={false} text="LOADING..." />
});

export const metadata = {
    title: 'Privacy Policy - Blackout',
    description: 'Privacy policy and cookie information for Blackout blog',
};

export default async function PrivacyPolicyPage() {
    let settings;
    try {
        settings = await prisma.settings.findFirst();
    } catch (error) {
        // Fallback for build time when DB isn't available
        settings = null;
    }
    const customPrivacyPolicy = settings?.privacyPolicy || '';
    const contactEmail = settings?.contactEmail || `privacy@${process.env.NEXTAUTH_URL}`;
    const hasCustomPolicy = customPrivacyPolicy.trim().length > 0;

    return (
        <div className={styles.container}>
            <Link href="/" className={styles.backLink}>
                <ArrowLeft size={16} />
                Back to Home
            </Link>

            <div className={styles.header}>
                <Shield size={48} />
                <h1>Privacy Policy</h1>
                <p className={styles.lastUpdated}>Last Updated: {new Date(settings?.updatedAt || new Date()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            <div className={styles.content}>
                {hasCustomPolicy ? (
                    <>
                        {/* Custom Privacy Policy from Database */}
                        <div className={styles.customPolicy}>
                            <BlogMarkdownRenderer content={customPrivacyPolicy} />
                        </div>
                    </>
                ) : (
                    <>
                        {/* Default Privacy Policy */}
                        <section className={styles.section}>
                            <h2>1. Introduction</h2>
                            <p>
                                Welcome to Blackout. We respect your privacy and are committed to protecting your personal data.
                                This privacy policy explains how we collect, use, and safeguard your information when you visit our website.
                            </p>
                            <p className={styles.note}>
                                <strong>Note:</strong> This is the default privacy policy. The site administrator can customize this content from the admin dashboard.
                            </p>
                        </section>

                        <section className={styles.section}>
                            <h2>2. Information We Collect</h2>
                            <p>We may collect personal information when you interact with our website, including account information and usage data.</p>
                        </section>

                        <section className={styles.section}>
                            <h2>3. How We Use Your Information</h2>
                            <p>We use collected information for authentication, website functionality, analytics (with consent), security, and communication.</p>
                        </section>

                        <section className={styles.section}>
                            <h2>4. Cookies</h2>
                            <p>We use cookies to enhance your browsing experience. You can manage your cookie preferences through our cookie consent banner.</p>
                        </section>

                        <section className={styles.section}>
                            <h2>5. Data Security</h2>
                            <p>We implement appropriate technical and organizational measures to protect your personal data.</p>
                        </section>

                        <section className={styles.section}>
                            <h2>6. Your Rights</h2>
                            <p>Depending on your location, you may have rights regarding your personal data including access, correction, deletion, and portability.</p>
                        </section>

                        <section className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <Mail size={24} />
                                <h2>7. Contact Us</h2>
                            </div>
                            <p>
                                If you have any questions about this privacy policy or our data practices, please contact us:
                            </p>
                            <div className={styles.contactInfo}>
                                <p><strong>Email:</strong> {contactEmail}</p>
                                <p><strong>Website:</strong> <Link href="/">{process.env.NEXTAUTH_URL}</Link></p>
                            </div>
                        </section>
                    </>
                )}
            </div>

            <div className={styles.footer}>
                <Link href="/" className={styles.homeLink}>
                    Return to Home
                </Link>
            </div>
        </div>
    );
}
