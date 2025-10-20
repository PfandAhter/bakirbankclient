"use client";

import React, { useEffect, useState } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Info, Triangle } from "lucide-react";
import type { AlertType } from "@/app/lib/hooks/useAlert";

interface Props {
    type: AlertType;
    title?: string;
    message?: string;
}

export default function AlertBox({ type, title, message }: Props) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (type) {
            setVisible(true);
            const fadeTimeout = setTimeout(() => setVisible(false), 3500);
            return () => clearTimeout(fadeTimeout);
        }
    }, [type]);

    if (!type) return null;

    const iconMap = {
        success: <CheckCircle2 className="h-6 w-6 text-green-500" />,
        error: <AlertCircle className="h-6 w-6 text-red-500" />,
        destructive: <AlertCircle className="h-6 w-6 text-red-500" />,
        info: <Info className="h-6 w-6 text-blue-500" />,
        warning: <Triangle className="h-6 w-6 text-yellow-500" />,
    };

    const variant =
        type === "destructive" || type === "error" ? "destructive" : "default";

    return (
        <div
            className={`fixed bottom-10 left-10 z-[9999] w-[430px] transition-all duration-700 gap-4 ${
                visible ? "animate-slide-up opacity-100" : "animate-fade-out opacity-0"
            }`}
        >
            <Alert
                variant={variant}
                className="bg-[#0d0029] border border-gray-700 shadow-2xl rounded-2xl p-5 flex items-start gap-4"
            >
                {/* Icon ve metin hizalaması */}
                <div className="flex-shrink-0 mt-1">{iconMap[type]}</div>

                <div className="flex flex-col">
                    <AlertTitle className="text-base font-semibold text-white mb-1">
                        {title}
                    </AlertTitle>
                    <AlertDescription className="text-sm text-gray-300">
                        {message}
                    </AlertDescription>
                </div>
            </Alert>
        </div>
    );
}
