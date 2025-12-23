'use client';

import React from 'react';
import { Button } from '@/src/components/ui/Button';

interface TermsAndPrivacyModalProps {
    type: 'terms' | 'privacy';
    onClose: () => void;
}

const TermsAndPrivacyModal: React.FC<TermsAndPrivacyModalProps> = ({ type, onClose }) => {
    const isTerms = type === 'terms';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-lg border border-gray-700 shadow-xl relative">
                <h2 className="text-2xl font-semibold text-white mb-4">
                    {isTerms ? 'Kullanım Koşulları' : 'Gizlilik Politikası'}
                </h2>

                <div className="max-h-80 overflow-y-auto text-gray-300 space-y-3 text-sm pr-2">
                    {isTerms ? (
                        <>
                            <p>Bu platformu kullanarak aşağıdaki şartları kabul etmiş sayılırsınız.</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>Hesap bilgilerinizin güvenliğinden siz sorumlusunuz.</li>
                                <li>Başka kişilerin bilgilerini izinsiz kullanmanız yasaktır.</li>
                                <li>Platform üzerindeki tüm içerikler ve hizmetler yasal koruma altındadır.</li>
                                <li>Hizmet, teknik nedenlerle veya bakım çalışmaları sebebiyle zaman zaman erişilemez olabilir.</li>
                                <li>Kullanıcı, mevzuata aykırı davranışlardan doğabilecek tüm sorumluluğu kabul eder.</li>
                            </ul>
                            <p>
                                Bu koşullar, platform tarafından gerektiğinde güncellenebilir. Güncellemeler yayımlandığı anda
                                geçerli olur.
                            </p>
                        </>
                    ) : (
                        <>
                            <p>Kişisel verilerinizin gizliliği bizim için önemlidir.</p>
                            <ul className="list-disc list-inside space-y-1">
                                <li>
                                    Kayıt esnasında sağladığınız kişisel bilgiler yalnızca hizmetin sunulması amacıyla kullanılacaktır.
                                </li>
                                <li>Bilgileriniz üçüncü taraflarla yalnızca yasal zorunluluk halinde paylaşılır.</li>
                                <li>Sunucularımızda saklanan veriler güvenlik önlemleri ile korunmaktadır.</li>
                                <li>Kullanıcılar, istedikleri zaman kişisel verilerinin silinmesini talep edebilir.</li>
                                <li>Çerezler, kullanıcı deneyimini geliştirmek amacıyla kullanılabilir.</li>
                            </ul>
                            <p>
                                Gizlilik politikamızda yapılacak değişiklikler, platform üzerinden duyurulacaktır.
                            </p>
                        </>
                    )}
                </div>

                <div className="text-right mt-4">
                    <Button onClick={onClose}>Kapat</Button>
                </div>
            </div>
        </div>
    );
};

export default TermsAndPrivacyModal;
