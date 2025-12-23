import {useContext, useMemo} from "react";
import { NotificationContext } from "@/src/providers/NotificationProvider";


export function useNotify() {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotify must be used within NotificationProvider');

    const notify = useMemo(() => ({
        success: (title: string, msg: string) => context.showNotification('success', title, msg),
        error: (title: string, msg: string) => context.showNotification('error', title, msg),
        warning: (title: string, msg: string) => context.showNotification('warning', title, msg),
        info: (title: string, msg: string) => context.showNotification('info', title, msg),
    }), [context]);

    return notify;
}