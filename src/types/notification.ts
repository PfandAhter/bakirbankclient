export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'FORCE_LOGOUT' | 'CONFIRMATION_REQUIRED' | 'MAINTENANCE';

export interface Notification {
    id: number | string;
    type: NotificationType;
    title: string;
    message: string;
    timestamp: string | Date;
    isRead?: boolean;
    isDeleted?: boolean;
    arguments?: Record<string, unknown>;
}