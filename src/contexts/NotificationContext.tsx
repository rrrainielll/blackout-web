'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import NotificationCard, { Notification, NotificationType } from '@/components/NotificationCard';

interface NotificationContextType {
    addNotification: (message: string, type: NotificationType, duration?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const addNotification = useCallback((message: string, type: NotificationType, duration?: number) => {
        const newNotification: Notification = {
            id: Date.now(),
            message,
            type,
            duration
        };
        setNotifications(prev => [...prev, newNotification]);
    }, []);

    const removeNotification = (id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    return (
        <NotificationContext.Provider value={{ addNotification }}>
            {children}
            <div style={{ position: 'fixed', bottom: '1rem', right: '1rem', zIndex: 10000 }}>
                {notifications.map((notification) => (
                    <NotificationCard
                        key={notification.id}
                        {...notification}
                        onClose={removeNotification}
                    />
                ))}
            </div>
        </NotificationContext.Provider>
    );
};
