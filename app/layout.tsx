import type {Metadata} from 'next'
import './globals.css'
import {AuthProvider} from '@/src/providers/AuthProvider';
import PopUpMap from "@/src/components/ui/atm-finder/PopUpMap";
import {NotificationProvider} from "@/src/providers/NotificationProvider";
import {MaintenanceProvider} from "@/src/providers/MaintenanceProvider";


export const metadata: Metadata = {
    title: 'BAKIRBANK A.Ş.',
    description: 'Banking and Finance Web Application',
    icons: {
        icon: '/bakirbankicon.png', // public klasöründeki dosya
        shortcut: '/favicon-16x16.png',
        apple: '/apple-touch-icon.png',
    },
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="tr">
        <body>
        <MaintenanceProvider>
            <AuthProvider>
                <NotificationProvider>
                    {children}
                    <PopUpMap />
                </NotificationProvider>
            </AuthProvider>
        </MaintenanceProvider>
        </body>
        </html>
    );
}