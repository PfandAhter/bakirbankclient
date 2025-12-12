import { User, Phone, Mail, Calendar, Home } from "lucide-react";
import { ProfileFormData } from "@/src/types/profile";

interface Props {
    formData: ProfileFormData;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    tcknError: string;
    onTcknBlur: (tckn: string) => void;
}

export default function PersonalInfoSection({ formData, handleChange, tcknError, onTcknBlur }: Props) {

    const handleNumericKeyDown = (e: React.KeyboardEvent) => {
        if (/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
        }
    };

    const handleTcknChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!/^\d*$/.test(e.target.value)) return;
        handleChange(e);
    };

    return (
        <>
            <h1 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-400"/> Kişisel Bilgiler
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-gray-300 mb-1">Ad</label>
                    <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} onKeyDown={handleNumericKeyDown} disabled={!!formData.firstName} className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed" />
                </div>
                <div>
                    <label className="block text-gray-300 mb-1">İkinci Ad</label>
                    <input type="text" name="secondName" value={formData.secondName} onChange={handleChange} onKeyDown={handleNumericKeyDown} placeholder="İkinci Ad (Varsa)" disabled={!!formData.secondName} className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed" />
                </div>
                <div>
                    <label className="block text-gray-300 mb-1">Soyad</label>
                    <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} onKeyDown={handleNumericKeyDown} disabled={!!formData.lastName} className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed" />
                </div>

                <div className="flex flex-col gap-1 w-full">
                    <label className="block text-gray-300 mb-1">TCKN</label>
                    <input
                        type="text"
                        name="tckn"
                        value={formData.tckn}
                        onChange={handleTcknChange}
                        onBlur={(e) => onTcknBlur(e.target.value)}
                        placeholder="12345678901"
                        maxLength={11}
                        disabled={!!formData.tckn}
                        className={`w-full px-4 py-2 rounded-lg bg-gray-900 border ${tcknError ? "border-red-500" : "border-gray-700"} text-white disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-600`}
                    />
                    {tcknError && <p className="text-red-500 text-sm ml-1">{tcknError}</p>}
                </div>

                <div className="flex flex-col gap-1 w-full">
                    <label className="block text-gray-300 mb-1">Telefon</label>
                    <div className="flex items-center gap-2 relative">
                        <Phone className="w-4 h-4 text-gray-400 absolute left-3"/>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            maxLength={10}
                            placeholder="5xxxxxxxxx"
                            className={`w-full pl-10 pr-4 py-2 rounded-lg bg-gray-900 border ${formData.phone && formData.phone.length !== 10 ? 'border-red-500' : 'border-gray-700'} text-white focus:outline-none focus:ring-2 focus:ring-blue-600`}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-gray-300 mb-1">E-posta</label>
                    <div className="flex flex-col gap-1 w-full relative">
                        <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3"/>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="test@bakirbank.com" className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white disabled:opacity-50" />
                        {formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
                            <p className="text-red-500 text-sm">Geçerli bir e-posta adresi girin</p>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-gray-300 mb-1">Doğum Tarihi</label>
                    <div className="flex items-center gap-2 relative">
                        <Calendar className="w-4 h-4 text-gray-400 absolute left-3"/>
                        <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} max={new Date().toISOString().split("T")[0]} className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-600" />
                    </div>
                </div>

                <div className="md:col-span-2">
                    <label className="block text-gray-300 mb-1">Adres</label>
                    <div className="flex items-center gap-2 relative">
                        <Home className="w-4 h-4 text-gray-400 absolute left-3"/>
                        <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Adresinizi girin" className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white" />
                    </div>
                </div>
            </div>
        </>
    );
}