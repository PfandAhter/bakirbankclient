
import React, { useState } from 'react';
import { City, District, Branch } from '@/src/types/location';
import { NewAccountFormState } from '@/src/types/account';
import { v4 as uuidv4 } from 'uuid';
import { Sparkles, Building2, MapPin, AlignLeft, Info } from 'lucide-react';

interface AccountCreationFormProps {
    newAccount: NewAccountFormState;
    setNewAccount: React.Dispatch<React.SetStateAction<NewAccountFormState>>;
    cities: City[] | null;
    districts: District[] | null;
    branches: Branch[];
    onSubmit: (e: React.FormEvent, idempotencyKey: string) => Promise<boolean>;
    onCityChange: (city: string) => Promise<void>;
    onDistrictChange: (district: string) => Promise<void>;
}

const AccountCreationForm: React.FC<AccountCreationFormProps> = ({
    newAccount,
    setNewAccount,
    cities,
    districts,
    branches,
    onSubmit,
    onCityChange,
    onDistrictChange
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [idempotencyKey, setIdempotencyKey] = useState(uuidv4());

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const success = await onSubmit(e, idempotencyKey);
            if (success) {
                setIdempotencyKey(uuidv4());
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-[#0f1015]/80 backdrop-blur-md border border-[#740001]/30 rounded-2xl p-6 shadow-2xl w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#D3A625]" />
                Yeni Hesap Aç
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wide text-[#D3A625] flex items-center gap-1">
                        <Info className="w-3.5 h-3.5" /> Hesap Adı
                    </label>
                    <input
                        type="text"
                        value={newAccount.name}
                        onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                        className="w-full bg-[#12131a] border border-[#740001]/30 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:border-[#D3A625] focus:ring-1 focus:ring-[#D3A625] outline-none transition-all"
                        placeholder="Örn: Maaş Hesabı"
                        required={true}
                    />
                    {!newAccount.name && (
                        <p className="text-[#8B1A1A] text-xs mt-1 font-medium">* Hesap adı zorunludur</p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wide text-[#D3A625] flex items-center gap-1">
                        <AlignLeft className="w-3.5 h-3.5" /> Açıklama
                    </label>
                    <input
                        type="text"
                        value={newAccount.description}
                        onChange={(e) => setNewAccount({
                            ...newAccount,
                            description: e.target.value
                        })}
                        className="w-full bg-[#12131a] border border-[#740001]/30 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:border-[#D3A625] focus:ring-1 focus:ring-[#D3A625] outline-none transition-all"
                        placeholder="Hesap açıklaması (isteğe bağlı)"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wide text-[#D3A625] flex items-center gap-1">
                        <span className="text-sm font-bold">₺</span> Para Birimi
                    </label>
                    <select
                        value={newAccount.currency}
                        onChange={(e) => setNewAccount({
                            ...newAccount,
                            currency: e.target.value
                        })}
                        className="w-full bg-[#12131a] border border-[#740001]/30 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:border-[#D3A625] focus:ring-1 focus:ring-[#D3A625] outline-none transition-all appearance-none"
                    >
                        <option value="TRY">₺ Türk Lirası</option>
                        <option value="USD">$ Dolar</option>
                        <option value="EUR">€ Euro</option>
                        <option value="GOLD">🥇 Altın</option>
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wide text-[#D3A625] flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" /> Şehir
                        </label>
                        <select
                            value={newAccount.city}
                            onChange={(e) => {
                                const selectedCity = e.target.value;
                                setNewAccount({
                                    ...newAccount,
                                    city: selectedCity,
                                    district: "",
                                    branchId: ""
                                });
                                onCityChange(selectedCity);
                            }}
                            className="w-full bg-[#12131a] border border-[#740001]/30 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:border-[#D3A625] focus:ring-1 focus:ring-[#D3A625] outline-none transition-all"
                        >
                            <option value="">Seçiniz</option>
                            {cities?.map((city: City) => (
                                <option key={city.id} value={city.id}>
                                    {city.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {districts && districts.length > 0 && (
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wide text-[#D3A625] flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" /> İlçe
                            </label>
                            <select
                                value={newAccount.district}
                                onChange={(e) => {
                                    const selectedDistrictId = e.target.value;
                                    setNewAccount({
                                        ...newAccount,
                                        district: selectedDistrictId,
                                        branchId: ""
                                    });
                                    onDistrictChange(selectedDistrictId);
                                }}
                                className="w-full bg-[#12131a] border border-[#740001]/30 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:border-[#D3A625] focus:ring-1 focus:ring-[#D3A625] outline-none transition-all"
                            >
                                <option value="">Seçiniz</option>
                                {districts.map((district: District) => (
                                    <option key={district.id} value={district.id}>
                                        {district.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {branches.length > 0 && (
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wide text-[#D3A625] flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5" /> Şube
                        </label>
                        <select
                            value={newAccount.branchId}
                            onChange={(e) =>
                                setNewAccount({
                                    ...newAccount,
                                    branchId: e.target.value
                                })
                            }
                            className="w-full bg-[#12131a] border border-[#740001]/30 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:border-[#D3A625] focus:ring-1 focus:ring-[#D3A625] outline-none transition-all"
                        >
                            <option value="">Şube seçiniz</option>
                            {branches.map((branch: Branch) => (
                                <option key={branch.id} value={branch.id}>
                                    {branch.name} ({branch.address})
                                </option>
                            ))}
                        </select>

                        {!newAccount.branchId && (
                            <p className="text-[#8B1A1A] text-xs mt-1 font-medium">* Şube seçilmelidir</p>
                        )}
                    </div>
                )}

                <button
                    type="submit"
                    className="w-full mt-4 bg-gradient-to-r from-[#740001] to-[#8B1A1A] hover:from-[#8B1A1A] hover:to-[#740001] text-white px-4 py-3 rounded-xl font-bold border border-[#D3A625]/20 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    disabled={isSubmitting || !newAccount.name || !newAccount.branchId}
                >
                    {isSubmitting ? (
                        <>
                            <span className="animate-spin">↻</span> İşleniyor...
                        </>
                    ) : (
                        <>
                            Hesap Aç <Sparkles className="w-4 h-4 text-[#D3A625]" />
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default AccountCreationForm;