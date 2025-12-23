import type {Metadata} from 'next'
import './globals.css'
import { AuthProvider } from '@/src/providers/AuthProvider';
import { PopUpMap } from "@/src/components/ui/atm-finder/PopUpMap";
import { NotificationProvider } from "@/src/providers/NotificationProvider";
import { MaintenanceProvider } from "@/src/providers/MaintenanceProvider";
import { TransactionConfirmationModal } from "@/src/components/ui/transaction/TransactionAdditionalConfirmationModal";
import { ConfirmationProvider } from "@/src/providers/ConfirmationProvider";

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
            <ConfirmationProvider>
                <AuthProvider>
                    <NotificationProvider>
                        {children}
                        <PopUpMap />
                        <TransactionConfirmationModal/>
                    </NotificationProvider>
                </AuthProvider>
            </ConfirmationProvider>
        </MaintenanceProvider>
        </body>
        </html>
    );
}