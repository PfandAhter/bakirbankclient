import { useState, useEffect } from 'react';
import { ProfileFormData } from '@/src/types/profile';

export const useProfileData = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [tcknError, setTcknError] = useState("");

    const [formData, setFormData] = useState<ProfileFormData>({
        firstName: "",
        secondName: "",
        lastName: "",
        tckn: "",
        phone: "",
        email: "",
        address: "",
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
        birthDate: ""
    });

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await fetch('/api/account/user/get/info', {
                    method: 'POST',
                    credentials: 'include',
                });

                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                const res = await response.json();
                const data = res.user;

                // Tarih formatlama (DD/MM/YYYY -> YYYY-MM-DD)
                const formattedBirthDate = data.birthDate
                    ? data.birthDate.split('/').reverse().join('-')
                    : "";

                setFormData(prev => ({
                    ...prev,
                    firstName: data.firstName || "",
                    secondName: data.secondName || "",
                    lastName: data.lastName || "",
                    tckn: data.tckn || "",
                    phone: data.phoneNumber || "", // API'den phoneNumber geliyor, formda phone kullanıyoruz
                    email: data.email || "",
                    address: data.address || "",
                    birthDate: formattedBirthDate || "",
                }));
            } catch (err) {
                console.error("Kullanıcı bilgileri alınamadı:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserInfo();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // TCKN Validasyon Mantığı
    const validateTckn = (tckn: string) => {
        if (tckn.length === 0) return;
        if (tckn.length !== 11) {
            setTcknError("TCKN 11 haneli olmalıdır");
            return;
        }

        const digits = tckn.split("").map(Number);
        const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
        const evenSum = digits[1] + digits[3] + digits[5] + digits[7];
        const check10 = (oddSum * 7 - evenSum) % 10;
        const check11 = digits.slice(0, 10).reduce((a, b) => a + b, 0) % 10;

        if (digits[9] !== check10 || digits[10] !== check11) {
            setTcknError("Geçerli bir TCKN girin");
        } else {
            setTcknError("");
        }
    };

    return {
        formData,
        setFormData,
        handleChange,
        isLoading,
        tcknError,
        validateTckn
    };
};