'use client';

import React from 'react';
import {
    X,
    ArrowUpRight,
    ArrowDownLeft,
    Download,
    Clock,
    RefreshCw,
    User,
    Calendar,
    CreditCard,
    FileText,
    Hash,
    Wallet,
    Building
} from 'lucide-react';
import { Transaction } from '@/src/types/transaction';

interface TransactionDetailModalProps {
    transaction: Transaction;
    currency?: string;
    isOpen: boolean;
    onClose: () => void;
    onInvoiceClick?: (invoiceId: string) => void;
    loadingInvoice?: boolean;
}

export default function TransactionDetailModal({
    transaction,
    currency = 'TRY',
    isOpen,
    onClose,
    onInvoiceClick,
    loadingInvoice = false
}: TransactionDetailModalProps) {
    if (!isOpen) return null;

    const isIncome = transaction.type === 'INCOME';
    const fullName = [transaction.receiverFirstName, transaction.receiverSecondName, transaction.receiverLastName]
        .filter(Boolean)
        .join(' ');

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: currency
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = () => {
        switch (transaction.status) {
            case 'COMPLETED':
                return <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400">Tamamlandı</span>;
            case 'PENDING':
                return <span className="px-2 py-1 text-xs rounded-full bg-amber-500/20 text-amber-400">Beklemede</span>;
            case 'FAILED':
                return <span className="px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-400">Başarısız</span>;
            default:
                return <span className="px-2 py-1 text-xs rounded-full bg-gray-500/20 text-gray-400">{transaction.status}</span>;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#0c0d13] border border-[#1e222d] rounded-2xl shadow-2xl w-full max-w-md text-white overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-[#1e222d]">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isIncome ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {isIncome ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">İşlem Detayı</h2>
                            <p className="text-xs text-gray-400">{isIncome ? 'Gelen Transfer' : 'Giden Transfer'}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white hover:bg-[#1e293b] p-2 rounded-lg transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Amount */}
                <div className={`p-5 border-b border-[#1e222d] ${isIncome ? 'bg-green-500/5' : 'bg-red-500/5'}`}>
                    <div className="text-center">
                        <p className="text-gray-400 text-sm mb-1">Tutar</p>
                        <p className={`text-3xl font-bold ${isIncome ? 'text-green-400' : 'text-red-400'}`}>
                            {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </p>
                    </div>
                </div>

                {/* Details */}
                <div className="p-5 space-y-4">
                    {/* Receiver/Sender Section - only show if fullName or TCKN exists */}
                    {(transaction.receiverFullName || transaction.receiverTCKN) && (
                        <div className="p-3 rounded-lg bg-[#1e293b]/30 border border-[#1e222d]">
                            <p className="text-xs text-gray-500 mb-3 font-medium">{isIncome ? 'Gönderen Bilgileri' : 'Alıcı Bilgileri'}</p>

                            {/* Full Name */}
                            {transaction.receiverFullName && (
                                <div className="flex items-center justify-between py-1.5 border-b border-[#1e222d]/50">
                                    <span className="text-xs text-gray-500">Ad Soyad</span>
                                    <span className="text-white text-sm font-medium">{transaction.receiverFullName}</span>
                                </div>
                            )}

                            {/* TCKN (hashed, if exists) */}
                            {transaction.receiverTCKN && (
                                <div className="flex items-center justify-between py-1.5">
                                    <span className="text-xs text-gray-500">TCKN</span>
                                    <span className="text-white text-sm font-mono">{transaction.receiverTCKN}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* IBAN */}
                    {transaction.receiverIBAN && (
                        <div className="flex items-start gap-3">
                            <CreditCard className="w-4 h-4 text-gray-500 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-xs text-gray-500">ALICI IBAN</p>
                                <p className="text-white font-mono text-sm break-all">{transaction.receiverIBAN}</p>
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    {transaction.description && (
                        <div className="flex items-start gap-3">
                            <FileText className="w-4 h-4 text-gray-500 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-xs text-gray-500">Açıklama</p>
                                <p className="text-white text-sm">{transaction.description}</p>
                            </div>
                        </div>
                    )}

                    {/* Category & Channel */}
                    <div className="flex gap-4">
                        <div className="flex items-start gap-3 flex-1">
                            <Hash className="w-4 h-4 text-gray-500 mt-0.5" />
                            <div>
                                <p className="text-xs text-gray-500">Kategori</p>
                                <p className="text-white text-sm">{transaction.category}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 flex-1">
                            <Building className="w-4 h-4 text-gray-500 mt-0.5" />
                            <div>
                                <p className="text-xs text-gray-500">Kanal</p>
                                <p className="text-white text-sm">{transaction.channel}</p>
                            </div>
                        </div>
                    </div>

                    {/* Date */}
                    <div className="flex items-start gap-3">
                        <Calendar className="w-4 h-4 text-gray-500 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-xs text-gray-500">Tarih</p>
                            <p className="text-white text-sm">{formatDate(transaction.date)}</p>
                        </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-start gap-3">
                        <Wallet className="w-4 h-4 text-gray-500 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-xs text-gray-500 mb-1">Durum</p>
                            {getStatusBadge()}
                        </div>
                    </div>
                </div>

                {/* Footer - Invoice Button */}
                {(transaction.invoiceStatus === 'COMPLETED' || transaction.invoiceStatus === 'PENDING') && (
                    <div className="p-5 border-t border-[#1e222d] bg-[#0a0b10]">
                        <button
                            onClick={() => transaction.invoiceId && onInvoiceClick?.(transaction.invoiceId)}
                            disabled={!transaction.invoiceId || loadingInvoice || transaction.invoiceStatus === 'PENDING'}
                            className={`w-full py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${transaction.invoiceStatus === 'COMPLETED'
                                ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                                : 'bg-amber-500/20 text-amber-400 cursor-wait'
                                }`}
                        >
                            {loadingInvoice ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    Yükleniyor...
                                </>
                            ) : transaction.invoiceStatus === 'COMPLETED' ? (
                                <>
                                    <Download className="w-4 h-4" />
                                    Dekont İndir
                                </>
                            ) : (
                                <>
                                    <Clock className="w-4 h-4" />
                                    Dekont Hazırlanıyor...
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
