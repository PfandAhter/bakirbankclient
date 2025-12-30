'use client';

import React from 'react';
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
    Sparkles
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

    const formatCurrency = (value: string) => {
        if (!value) return '₺0,00';
        const num = parseFloat(value);
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY'
        }).format(num);
    };

    return (
        <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-all duration-200">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-white font-semibold">Analiz Raporu #{report.id}</h3>
                        <div className="flex items-center gap-2 text-gray-400 text-sm mt-0.5">
                            <Calendar size={14} />
                            <span>{getAnalysisRangeLabel()}</span>
                        </div>
                    </div>
                </div>
                {getRiskBadge()}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-700/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                        <TrendingUp size={12} />
                        <span>Toplam Gelen</span>
                    </div>
                    <p className="text-green-400 font-semibold">{formatCurrency(report.totalIncoming)}</p>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                        <TrendingDown size={12} />
                        <span>Toplam Giden</span>
                    </div>
                    <p className="text-red-400 font-semibold">{formatCurrency(report.totalOutgoing)}</p>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                        {parseFloat(report.netFlow || '0') >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownLeft size={12} />}
                        <span>Net Akış</span>
                    </div>
                    <p className={`font-semibold ${parseFloat(report.netFlow || '0') >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatCurrency(report.netFlow)}
                    </p>
                </div>
            </div>

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

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                <div className="text-gray-500 text-xs">
                    <span>Oluşturulma: {formatDate(report.createdAt)}</span>
                    <span className="mx-2">•</span>
                    <span>{report.totalTransactions} işlem analiz edildi</span>
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
