'use client';

import React, { useState } from 'react';
import { AnalyzeRange } from '@/src/types/analysis';
import { X, Calendar, Loader2, Sparkles } from 'lucide-react';

interface CreateAnalysisModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (range: AnalyzeRange) => Promise<void>;
}

export const CreateAnalysisModal: React.FC<CreateAnalysisModalProps> = ({
    isOpen,
    onClose,
    onSubmit
}) => {
    const [selectedRange, setSelectedRange] = useState<AnalyzeRange>('LAST_7_DAYS');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await onSubmit(selectedRange);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Analiz oluşturulurken bir hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    const rangeOptions: { value: AnalyzeRange; label: string; description: string }[] = [
        {
            value: 'LAST_7_DAYS',
            label: 'Son 7 Gün',
            description: 'Son bir haftadaki işlemlerinizi analiz eder'
        },
        {
            value: 'LAST_30_DAYS',
            label: 'Son 30 Gün',
            description: 'Son bir aydaki işlemlerinizi analiz eder'
        }
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-md mx-4 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">Yeni Analiz Oluştur</h2>
                            <p className="text-sm text-gray-400">İşlemlerinizi AI ile analiz edin</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                        <Calendar className="inline w-4 h-4 mr-2" />
                        Analiz Aralığı Seçin
                    </label>
                    <div className="space-y-3">
                        {rangeOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => setSelectedRange(option.value)}
                                className={`w-full p-4 rounded-xl border text-left transition-all ${selectedRange === option.value
                                        ? 'border-blue-500 bg-blue-500/10'
                                        : 'border-gray-600 hover:border-gray-500 bg-gray-700/30'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-white font-medium">{option.label}</span>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedRange === option.value
                                            ? 'border-blue-500 bg-blue-500'
                                            : 'border-gray-500'
                                        }`}>
                                        {selectedRange === option.value && (
                                            <div className="w-2 h-2 bg-white rounded-full" />
                                        )}
                                    </div>
                                </div>
                                <p className="text-sm text-gray-400 mt-1">{option.description}</p>
                            </button>
                        ))}
                    </div>

                    {error && (
                        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-6 border-t border-gray-700">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white rounded-xl font-medium transition-colors"
                    >
                        İptal
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Analiz Ediliyor...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" />
                                Analiz Oluştur
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
