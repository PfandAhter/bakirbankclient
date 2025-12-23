'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface MaintenanceContextType {
    isUnderMaintenance: boolean;
    maintenanceMessage: string;
    setMaintenance: (status: boolean, message?: string) => void;
}

const MaintenanceContext = createContext<MaintenanceContextType>({
    isUnderMaintenance: false,
    maintenanceMessage: '',
    setMaintenance: () => {},
});

export const useMaintenance = () => useContext(MaintenanceContext);

export function MaintenanceProvider({ children }: { children: ReactNode }) {
    const [isUnderMaintenance, setIsUnderMaintenance] = useState(false);
    const [maintenanceMessage, setMaintenanceMessage] = useState('');

    const setMaintenance = (status: boolean, message?: string) => {
        setIsUnderMaintenance(status);
        setMaintenanceMessage(message || 'Sistem bakımda');
    };

    if (isUnderMaintenance) {
        return (
            <MaintenanceContext.Provider value={{ isUnderMaintenance, maintenanceMessage, setMaintenance }}>
                <div className="min-h-screen flex items-center justify-center bg-gray-100">
                    <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
                        <div className="text-6xl mb-4">🔧</div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">
                            Bakım Çalışması
                        </h1>
                        <p className="text-gray-600">{maintenanceMessage}</p>
                    </div>
                </div>
            </MaintenanceContext.Provider>
        );
    }

    return (
        <MaintenanceContext.Provider value={{ isUnderMaintenance, maintenanceMessage, setMaintenance }}>
            {children}
        </MaintenanceContext.Provider>
    );
}