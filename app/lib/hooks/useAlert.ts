import { useState, useCallback } from "react";
import React from "react";

export type AlertType = "success" | "error" | "info" | "warning" | "destructive";

interface AlertState {
    type: AlertType | null;
    title?: string;
    message?: React.ReactNode;
}

export function useAlert() {
    const [alert, setAlert] = useState<AlertState>({ type: null });

    const showAlert = useCallback((type: AlertType, title: string, message: React.ReactNode) => {
        setAlert({ type, title, message });

        setTimeout(() => {
            setAlert({ type: null });
        }, 10000);
    }, []);

    return { alert, showAlert };
}
