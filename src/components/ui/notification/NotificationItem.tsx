'use client';

import { AlertOctagon, AlertTriangle, CheckCircle, Info, X } from "lucide-react";
import { Notification } from '@/src/types/notification';

export const NotificationItem = ({ notification, onClose }: { notification: Notification; onClose: () => void }) => {
    const styles: Record<string, { border: string; bg: string; icon: React.ReactNode; shadow: string }> = {
        success: { border: 'border-green-500/50', bg: 'bg-green-500/10', icon: <CheckCircle className="w-6 h-6 text-green-400" />, shadow: 'shadow-green-900/20' },
        error: { border: 'border-red-500/50', bg: 'bg-red-500/10', icon: <AlertOctagon className="w-6 h-6 text-red-400" />, shadow: 'shadow-red-900/20' },
        warning: { border: 'border-yellow-500/50', bg: 'bg-yellow-500/10', icon: <AlertTriangle className="w-6 h-6 text-yellow-400" />, shadow: 'shadow-yellow-900/20' },
        info: { border: 'border-blue-500/50', bg: 'bg-blue-500/10', icon: <Info className="w-6 h-6 text-blue-400" />, shadow: 'shadow-blue-900/20' },
        FORCE_LOGOUT: { border: 'border-red-500/50', bg: 'bg-red-500/10', icon: <AlertOctagon className="w-6 h-6 text-red-400" />, shadow: 'shadow-red-900/20' },
    };

    const style = styles[notification.type] || styles.info;

    return (
        <div className={`pointer-events-auto transform transition-all duration-500 ease-in-out animate-slide-in-right flex items-start gap-4 p-4 rounded-xl backdrop-blur-md border ${style.border} ${style.bg} shadow-lg ${style.shadow} bg-[#0c0d13]/90`}>
            <div className="flex-shrink-0 mt-0.5">
                {style.icon}
            </div>
            <div className="flex-1">
                <h4 className="text-white font-semibold text-sm tracking-wide mb-1">{notification.title}</h4>
                <p className="text-gray-400 text-xs leading-relaxed">{notification.message}</p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
            </button>

            <div className="absolute bottom-0 left-0 h-0.5 bg-current opacity-30 animate-progress-shrink w-full" />
        </div>
    );
};