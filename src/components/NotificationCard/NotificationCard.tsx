'use client';

import React, { useEffect, useState } from 'react';
import styles from './NotificationCard.module.css';

export type NotificationType = 'success' | 'error' | 'info';

export interface Notification {
    id: number;
    message: string;
    type: NotificationType;
    duration?: number;
}

interface NotificationCardProps extends Notification {
    onClose: (id: number) => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ id, message, type, duration = 5000, onClose }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration]);

    const handleClose = () => {
        setVisible(false);
        setTimeout(() => onClose(id), 300); // Allow for fade-out animation
    };

    return (
        <div className={`${styles.notification} ${styles[type]} ${visible ? styles.visible : ''}`}>
            <div className={styles.message}>{message}</div>
            <button onClick={handleClose} className={styles.closeButton}>
                &times;
            </button>
        </div>
    );
};

export default NotificationCard;
