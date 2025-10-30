'use client';

import React from 'react';
import {Message} from '@/app/types/Message';
import {QRCodeCanvas} from 'qrcode.react';
import {Button} from '@/components/ui/button';
import {CardContent} from '@/app/components/ui/CardContent';
import {Card} from '@/app/components/ui/Card';
import {AlertCircle, CheckCircle, Info, AlertTriangle, Wallet, TrendingUp, TrendingDown} from 'lucide-react';

interface MessageRendererProps {
    message: Message;
    globalArgs?: Record<string, any>;
    onAccountSelect?: (accountId: string) => void;
}

export const MessageRenderer: React.FC<MessageRendererProps> = ({message,globalArgs, onAccountSelect}) => {
    switch (message.type) {
        case 'text':
            return (
                <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed">
                    {message.content}
                </p>
            );

        case 'account_selection': {
            const msg = message as Extract<Message, { type: 'account_selection' }>;
            const accounts = msg.data?.accounts ?? [];
            if (!accounts.length) {
                return (
                    <div
                        className="space-y-4 p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                                <Wallet className="w-6 h-6 text-blue-600 dark:text-blue-400"/>
                            </div>
                            <div>
                                <p className="text-gray-600 dark:text-gray-400 font-medium">
                                    Hesabınız bulunmamaktadır.
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-500">
                                    Yeni bir hesap oluşturarak başlayın
                                </p>
                            </div>
                        </div>
                        <a href="/transactions" className="inline-block">
                            <Button
                                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30 transition-all duration-200">
                                Hesap Oluştur
                            </Button>
                        </a>
                    </div>
                );
            }

            return (
                <div className="space-y-4">
                    <p className="text-gray-800 dark:text-gray-200 font-medium">
                        {msg.content ?? 'Bir hesap seçin:'}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {accounts.map((acc: {
                            id: string;
                            name: string;
                            iban?: string;
                            balance: number;
                            currency?: string
                        }) => (
                            <Card
                                key={acc.id}
                                className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 overflow-hidden group h-32"
                            >
                                <button
                                    type="button"
                                    className="w-full h-full text-left cursor-pointer"
                                    onClick={() => onAccountSelect?.(acc.id)}
                                >
                                    <CardContent className="p-5 relative h-full flex flex-col justify-between">
                                        <div
                                            className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"/>
                                        <div className="relative z-10 flex flex-col h-full justify-between">
                                            <div className="flex items-start gap-2 mb-2 min-h-[24px] flex-shrink-0">
                                                <Wallet
                                                    className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"/>
                                                <p className="font-semibold text-gray-900 dark:text-white text-sm leading-tight break-words line-clamp-2 max-w-full overflow-hidden">
                                                    {acc.name}
                                                </p>
                                            </div>
                                            <div className="mb-2 min-h-[20px] flex-shrink-0">
                                                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded inline-block truncate max-w-full">
                                                    {acc.iban}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <span
                                                    className="text-lg mb-6 font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent truncate flex-1 min-w-0">
                                                        {acc.balance.toLocaleString()}
                                                </span>
                                                <span
                                                    className="text-sm mb-6 text-gray-600 dark:text-gray-400 font-medium flex-shrink-0">
                                                    {acc.currency}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </button>
                            </Card>
                        ))}
                    </div>
                </div>
            );
        }

        case 'transaction_list':
            console.log("Rendering transaction list message:", message);
            if (!message.data?.transactions?.length) {
                return (
                    <div
                        className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <Info className="w-5 h-5 text-gray-400"/>
                            <p className="text-gray-500 dark:text-gray-400 italic">
                                Bu hesaba ait transfer geçmişi bulunmamaktadır.
                            </p>
                        </div>
                    </div>
                );
            }
            return (
                <div
                    className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg space-y-1">
                    <p className="text-gray-900 dark:text-white font-semibold text-lg">
                        {message.content ?? 'Son İşlemler'}
                    </p>
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700 ">
                        {message.data.transactions.map((tx) => (
                            <li key={tx.id}
                                className="max-h-25 flex justify-between items-center py-5 group hover:bg-gray-50 dark:hover:bg-gray-800/50 -mx-2 px-2 rounded-lg transition-colors">
                                <div className="flex items-center gap-1 flex-1 min-w-0">
                                    <div className={`p-2 rounded-full ${
                                        tx.type === 'INCOME'
                                            ? 'bg-green-100 dark:bg-green-900/30'
                                            : 'bg-red-100 dark:bg-red-900/30'
                                    }`}>
                                        {tx.type === 'INCOME' ? (
                                            <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400"/>
                                        ) : (
                                            <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400"/>
                                        )}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span
                                            className="text-gray-700 dark:text-gray-300 text-sm font-bold truncate max-w-[120px] sm:max-w-[200px]">
                                            {tx.description}
                                        </span>
                                        {(tx.receiverFullName || tx.receiverTCKN) && (
                                            <span
                                                className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-2 truncate">
                                                Alıcı bilgisi: {tx.receiverFullName ?? tx.receiverTCKN}
                                            </span>
                                        )}
                                        <div
                                            className="flex items-center gap-1 text-sm text-gray-500 whitespace-nowrap mb-0">
                                            <span>{new Date(tx.date).toLocaleDateString()}</span>
                                            <span>{new Date(tx.date).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}</span>
                                        </div>

                                    </div>
                                </div>
                                <span className={`font-bold text-lg text-right ml-1 ${
                                    tx.type === 'INCOME'
                                        ? 'text-green-600 dark:text-green-400'
                                        : 'text-red-600 dark:text-red-400'
                                }`}>
                                    {tx.type === 'INCOME' ? '+' : '-'}
                                    {tx.amount.toLocaleString()}
                                </span>
                            </li>
                        ))}
                    </ul>

                    <a href="/transactions" className="inline-block mb-0 mt-3">
                        <Button
                            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transform hover:scale-105 transition-all duration-300 border border-blue-500/20 backdrop-blur-sm">
                            <span className="flex items-center gap-2">
                                Daha detaylı bilgi için
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M9 5l7 7-7 7"/>
                                </svg>
                            </span>
                        </Button>
                    </a>
                </div>
            );

        case 'saved_account_selection': {
            const accounts = message.data?.savedAccounts ?? [];

            if (!accounts.length) {
                return (
                    <div
                        className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                        <p className="text-gray-600 dark:text-gray-300">
                            Kayıtlı alıcı bulunamadı.
                        </p>
                    </div>
                );
            }

            return (
                <div className="space-y-3">
                    <p className="text-gray-800 dark:text-gray-200 font-medium">
                        {message.content ?? 'Bir alıcı seçin:'}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {accounts.map((acc: any) => (
                            <Card
                                key={acc.id}
                                className="p-4 cursor-pointer border border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-all rounded-xl"
                            >
                                <button
                                    type="button"
                                    className="w-full h-full text-left cursor-pointer"
                                    onClick={() => onAccountSelect?.(acc.accountIBAN)}
                                >
                                    {/*<p className="font-semibold text-gray-900 dark:text-gray-100">
                                        {acc.firstName} {acc.lastName}
                                    </p>*/}

                                    <div className="flex items-start gap-2 mb-2 min-h-[24px] flex-shrink-0">
                                        <Wallet
                                            className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"/>
                                        <p className="font-semibold text-gray-900 dark:text-white text-sm leading-tight break-words line-clamp-2 max-w-full overflow-hidden">
                                            {acc.firstName} {acc.lastName}
                                        </p>
                                    </div>

                                    <div className="mb-2 min-h-[20px] flex-shrink-0">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded inline-block truncate max-w-full">
                                            {acc.accountIBAN}
                                        </p>
                                    </div>
                                    {acc.nickname && (
                                        <p className="text-xs text-gray-400 italic font-bold mt-1">
                                            ({acc.nickname})
                                        </p>
                                    )}
                                </button>
                            </Card>
                        ))}
                    </div>
                </div>
            );
        }

        case 'confirm_transfer': {
            const details = globalArgs || {};
            console.log("confirm_transfer details log: ", details);
            return (
                <div
                    className="p-5 rounded-2xl border border-green-400/50 bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-gray-900 shadow-lg">
                    <p className="text-gray-800 dark:text-gray-200 mb-3">
                        💸 <strong>{details.savedRecipient.firstName} {details.savedRecipient.secondName} {details.savedRecipient.lastName}</strong> adlı kişiye<br/>
                                                <span
                            className="font-mono text-green-600 dark:text-green-400"
                            aria-label={`IBAN numarası: ${details.toIBAN}`}
                        >
                            {details.toIBAN}
                        </span> IBAN numarasına<br/>
                        <span
                            className="font-bold"
                            aria-label={`Tutar: ${details.amount} Türk Lirası`}
                        >
                            {details.amount} ₺
                        </span> göndermek üzeresiniz.
                    </p>
                    {details.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Açıklama: {details.description}
                        </p>
                    )}
                    <div className="flex gap-3 mt-4">
                        <Button
                            onClick={() => onAccountSelect?.('CONFIRM_TRANSFER_YES')}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                            Evet
                        </Button>
                        <Button
                            onClick={() => onAccountSelect?.('CONFIRM_TRANSFER_NO')}
                            variant="destructive"
                            className="flex-1"
                        >
                            Hayır
                        </Button>
                    </div>
                </div>
            );
        }

        case 'notification':
            const icons = {
                success: CheckCircle,
                error: AlertCircle,
                warning: AlertTriangle,
                info: Info,
            };
            const Icon = icons[message.level as keyof typeof icons] || Info;
            console.log("Rendering Notification Message in Message Renderer: ", message);

            return (
                <div
                    className={`p-5 rounded-2xl border-2 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] ${
                        message.level === 'success'
                            ? 'border-green-500/50 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20'
                            : message.level === 'error'
                                ? 'border-red-500/50 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20'
                                : message.level === 'warning'
                                    ? 'border-yellow-500/50 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20'
                                    : 'border-blue-500/50 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20'
                    }`}
                >
                    <div className="flex gap-4">
                        <div className={`flex-shrink-0 ${
                            message.level === 'success'
                                ? 'text-green-600 dark:text-green-400'
                                : message.level === 'error'
                                    ? 'text-red-600 dark:text-red-400'
                                    : message.level === 'warning'
                                        ? 'text-yellow-600 dark:text-yellow-400'
                                        : 'text-blue-600 dark:text-blue-400'
                        }`}>
                            <Icon className="w-6 h-6"/>
                        </div>
                        <div className="flex-1">
                            <p className="font-bold text-gray-900 dark:text-white text-lg mb-1">
                                {message.title}
                            </p>
                            <p className="text-gray-700 dark:text-gray-300">
                                {message.message}
                            </p>
                        </div>
                    </div>
                </div>
            );

        case 'qr':
            return (
                <div
                    className="flex flex-col items-center gap-4 p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700">
                    <div className="p-4 bg-white rounded-2xl shadow-xl">
                        <QRCodeCanvas value={message.data} size={200} level="H"/>
                    </div>
                    {message.label && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium text-center">
                            {message.label}
                        </p>
                    )}
                </div>
            );

        default:
            return (
                <div
                    className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400 italic flex items-center gap-2">
                        <AlertCircle className="w-4 h-4"/>
                        Desteklenmeyen mesaj türü
                    </p>
                </div>
            );
    }
};