'use client';

import React, { useState } from 'react';
import { AnalysisReportDTO } from '@/src/types/analysis';
import {
    FileText,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    CheckCircle2,
    AlertCircle,
    Calendar,
    ArrowUpRight,
    ArrowDownLeft,
    Download,
    Sparkles,
    Clock,
    Hash,
    ChevronDown,
    ChevronUp,
    Flag
} from 'lucide-react';

interface AnalysisReportCardProps {
    report: AnalysisReportDTO;
    onDownloadPdf: (invoiceId: string) => void;
    isDownloading?: boolean;
}

export const AnalysisReportCard: React.FC<AnalysisReportCardProps> = ({
    report,
    onDownloadPdf,
    isDownloading = false
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const getRiskBadge = () => {
        switch (report.overallRiskLevel) {
            case 'LOW':
                return (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
                        <CheckCircle2 size={14} />
                        Düşük Risk
                    </span>
                );
            case 'MEDIUM':
                return (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-semibold">
                        <AlertCircle size={14} />
                        Orta Risk
                    </span>
                );
            case 'HIGH':
                return (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-semibold">
                        <AlertTriangle size={14} />
                        Yüksek Risk
                    </span>
                );
            default:
                return null;
        }
    };

    const getAnalysisRangeLabel = () => {
        switch (report.analysisRange) {
            case 'LAST_7_DAYS':
                return 'Son 7 Gün';
            case 'LAST_30_DAYS':
                return 'Son 30 Gün';
            default:
                return report.analysisRange;
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('tr-TR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatShortDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Backend zaten formatlanmış para birimi gönderiyor (₺0,00 veya ₺29.620,00)
    const displayCurrency = (value: string) => {
        if (!value) return '₺0,00';
        // Backend zaten ₺ ile formatlanmış değer gönderiyorsa direkt döndür
        if (value.startsWith('₺')) {
            return value;
        }
        // Sayısal değerse formatla
        const num = parseFloat(value);
        if (isNaN(num)) return '₺0,00';
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY'
        }).format(num);
    };

    // Net flow değerinden pozitif/negatif kontrolü
    const isPositiveFlow = () => {
        const netFlow = report.netFlow || '₺0,00';
        // Negatif değer kontrolü
        return !netFlow.includes('-');
    };

    // keyFindings JSON array string olarak geliyor, parse et
    const parseKeyFindings = (): string[] => {
        if (!report.keyFindings) return [];
        try {
            const parsed = JSON.parse(report.keyFindings);
            if (Array.isArray(parsed)) {
                return parsed.filter(item => item !== null && item !== '');
            }
            return [];
        } catch {
            // JSON değilse, direkt string olarak göster
            return report.keyFindings ? [report.keyFindings] : [];
        }
    };

    // flaggedTransactionIds JSON array string olarak geliyor
    const getFlaggedTransactionCount = (): number => {
        if (!report.flaggedTransactionIds) return 0;
        try {
            const parsed = JSON.parse(report.flaggedTransactionIds);
            if (Array.isArray(parsed)) {
                // null olmayan değerleri say
                return parsed.filter(id => id !== null && id !== '').length;
            }
            return 0;
        } catch {
            return 0;
        }
    };

    const keyFindings = parseKeyFindings();
    const flaggedCount = getFlaggedTransactionCount();

    return (
        <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-all duration-200">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-white font-semibold">Analiz Raporu</h3>
                            <span className="text-gray-500 text-xs font-mono">#{report.id.slice(0, 8)}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-400 text-sm mt-0.5">
                            <div className="flex items-center gap-1">
                                <Calendar size={14} />
                                <span>{getAnalysisRangeLabel()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Hash size={14} />
                                <span>{report.totalTransactions} işlem</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    {getRiskBadge()}
                    {flaggedCount > 0 && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500/10 text-red-400 rounded text-xs">
                            <Flag size={12} />
                            {flaggedCount} şüpheli işlem
                        </span>
                    )}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-gray-700/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                        <TrendingUp size={12} />
                        <span>Toplam Gelen</span>
                    </div>
                    <p className="text-green-400 font-semibold text-sm">{displayCurrency(report.totalIncoming)}</p>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                        <TrendingDown size={12} />
                        <span>Toplam Giden</span>
                    </div>
                    <p className="text-red-400 font-semibold text-sm">{displayCurrency(report.totalOutgoing)}</p>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                        {isPositiveFlow() ? <ArrowUpRight size={12} /> : <ArrowDownLeft size={12} />}
                        <span>Net Akış</span>
                    </div>
                    <p className={`font-semibold text-sm ${isPositiveFlow() ? 'text-green-400' : 'text-red-400'}`}>
                        {displayCurrency(report.netFlow)}
                    </p>
                </div>
            </div>

            {/* Summary (always visible if exists) */}
            {report.summary && (
                <div className="bg-gray-700/20 border border-gray-600/30 rounded-lg p-3 mb-4">
                    <p className="text-gray-300 text-sm leading-relaxed">{report.summary}</p>
                </div>
            )}

            {/* AI Summary */}
            {report.aiSummary && (
                <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 text-purple-400 text-sm font-medium mb-2">
                        <Sparkles size={16} />
                        <span>AI Özeti</span>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">{report.aiSummary}</p>
                </div>
            )}

            {/* Expandable Details */}
            {(keyFindings.length > 0 || report.userGuidance) && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-medium mb-4 transition-colors"
                >
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    {isExpanded ? 'Detayları Gizle' : 'Detayları Göster'}
                </button>
            )}

            {isExpanded && (
                <div className="space-y-4 mb-4 animate-fadeIn">
                    {/* Key Findings */}
                    {keyFindings.length > 0 && (
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-amber-400 text-sm font-medium mb-2">
                                <AlertTriangle size={16} />
                                <span>Önemli Bulgular</span>
                            </div>
                            <ul className="text-gray-300 text-sm leading-relaxed space-y-1">
                                {keyFindings.map((finding, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <span className="text-amber-400 mt-0.5">•</span>
                                        <span>{finding}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* User Guidance */}
                    {report.userGuidance && (
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-blue-400 text-sm font-medium mb-2">
                                <CheckCircle2 size={16} />
                                <span>Öneriler</span>
                            </div>
                            <p className="text-gray-300 text-sm leading-relaxed">{report.userGuidance}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                <div className="flex flex-col gap-1 text-gray-500 text-xs">
                    <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>Oluşturulma: {formatShortDate(report.createdAt)}</span>
                    </div>
                    {report.generatedAt && report.generatedAt !== report.createdAt && (
                        <div className="flex items-center gap-1">
                            <Sparkles size={12} />
                            <span>Analiz: {formatShortDate(report.generatedAt)}</span>
                        </div>
                    )}
                </div>
                <button
                    onClick={() => onDownloadPdf(report.invoiceId)}
                    disabled={isDownloading || !report.invoiceId}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
                >
                    <Download size={16} />
                    {isDownloading ? 'İndiriliyor...' : 'PDF İndir'}
                </button>
            </div>
        </div>
    );
};
