export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'FORCE_LOGOUT' | 'CONFIRMATION_REQUIRED' | 'MAINTENANCE';

export interface Notification {
    id: number;
    type: NotificationType;
    title: string;
    message: string;
    timestamp: string;
    isRead?: boolean;
    isDeleted?: boolean;
    arguments?: Record<string, unknown>;
}