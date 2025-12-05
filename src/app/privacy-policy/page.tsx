import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';
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

async function getPrivacyPolicy() {
    try {
        const settings = await prisma.settings.findFirst();
        if (settings?.privacyPolicy && settings.privacyPolicy.trim().length > 0) {
            return {
                content: settings.privacyPolicy,
                lastUpdated: settings.updatedAt,
            };
        }
    } catch (error) {
        // DB not available at build time, fall through to default
    }

    const filePath = path.join(process.cwd(), 'PRIVACY_POLICY.md');
    const content = fs.readFileSync(filePath, 'utf8');
    const stats = fs.statSync(filePath);

    return {
        content,
        lastUpdated: stats.mtime,
    };
}

export default async function PrivacyPolicyPage() {
    const { content, lastUpdated } = await getPrivacyPolicy();

    return (
        <div className={styles.container}>
            <Link href="/" className={styles.backLink}>
                <ArrowLeft size={16} />
                Back to Home
            </Link>

            <div className={styles.header}>
                <Shield size={48} />
                <h1>Privacy Policy</h1>
                <p className={styles.lastUpdated}>
                    Last Updated: {new Date(lastUpdated).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </div>

            <div className={styles.content}>
                <BlogMarkdownRenderer content={content} />
            </div>

            <div className={styles.footer}>
                <Link href="/" className={styles.homeLink}>
                    Return to Home
                </Link>
            </div>
        </div>
    );
}
