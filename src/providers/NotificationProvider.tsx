'use client';

import React, { createContext, useState, useCallback } from 'react';
import { NotificationItem } from '@/src/components/ui/notification/NotificationItem';
import { Notification, NotificationType } from '@/src/types/notification';

interface NotificationContextType {
    showNotification: (type: NotificationType, title: string, message: string) => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const showNotification = useCallback((type: NotificationType, title: string, message: string) => {
        const id = crypto.randomUUID();
        setNotifications((prev) => [...prev, { id, type, title, message, timestamp: new Date() }]);

        // 5 saniye sonra otomatik sil
        setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, 5000);
    }, []);

    const removeNotification = (id: string | number) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none">
                {notifications.map((n) => (
                    <NotificationItem key={n.id} notification={n} onClose={() => removeNotification(n.id)} />
                ))}
            </div>
        </NotificationContext.Provider>
    );
}