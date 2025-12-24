import { Lock, History, CheckCircle, XCircle } from "lucide-react";
import { ProfileFormData, SessionLog } from "@/src/types/profile";

export function PasswordSection({ formData, handleChange }: { formData: ProfileFormData, handleChange: any }) {
    return (
        <>
            <h1 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-purple-400"/> Şifre Değiştir
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-gray-300 mb-1">Eski Şifre</label>
                    <input type="password" name="oldPassword" value={formData.oldPassword} onChange={handleChange} className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white" />
                </div>
                <div>
                    <label className="block text-gray-300 mb-1">Yeni Şifre</label>
                    <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white" />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-gray-300 mb-1">Yeni Şifre (Tekrar)</label>
                    <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white" />
                </div>
            </div>
        </>
    );
}

export function SessionHistorySection({ history }: { history: SessionLog[] }) {
    return (
        <div>
            <h1 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <History className="w-5 h-5 text-yellow-400"/> Oturum Geçmişi
            </h1>
            <ul className="space-y-3">
                {history.map((session, index) => (
                    <li key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-900 border border-gray-700">
                        <div>
                            <p className="text-white font-semibold">{session.device} - {session.location}</p>
                            <p className="text-sm text-gray-400">{session.ipAddress} • {new Date(session.loginTime).toLocaleString()}</p>
                        </div>
                        <div>
                            {session.success ? (
                                <span className="flex items-center gap-1 text-green-400"><CheckCircle className="w-5 h-5"/> Başarılı</span>
                            ) : (
                                <span className="flex items-center gap-1 text-red-400"><XCircle className="w-5 h-5"/> Hatalı</span>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}