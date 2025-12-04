import Link from 'next/link';
import { Shield } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.content}>
                    <p className={styles.copyright}>
                        © {currentYear} BLACKOUT. All rights reserved.
                    </p>

                    <div className={styles.links}>
                        <Link href="/privacy-policy" className={styles.link}>
                            <Shield size={14} />
                            Privacy Policy
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
