// src/app/lib/store/notificationStore.ts
import { create } from 'zustand';

interface NotificationState {
    message: string | null;
    type: 'success' | 'error' | null;
    showNotification: (msg: string, type: 'success' | 'error') => void;
    clearNotification: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
    message: null,
    type: null,
    showNotification: (msg, type) => set({ message: msg, type }),
    clearNotification: () => set({ message: null, type: null }),
}));