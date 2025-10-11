import type {Metadata} from 'next'
import './globals.css'
import {AuthProvider} from '@/app/lib/providers/AuthProvider';


export const metadata: Metadata = {
    title: 'Bakir Web Service',
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
        <AuthProvider>
            {children}
        </AuthProvider>
        </body>
        </html>
    );
}