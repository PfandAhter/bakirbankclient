import { useState, useEffect } from 'react';
import { SavedRecipient } from '@/src/types/account';

export const useRecipients = () => {
    const [savedRecipients, setSavedRecipients] = useState<SavedRecipient[]>([]);
    const [selectedRecipient, setSelectedRecipient] = useState<SavedRecipient | null>(null);
    const [loadingRecipients, setLoadingRecipients] = useState(false);

    const fetchRecipients = async () => {
        setLoadingRecipients(true);
        try {
            const res = await fetch("/api/account/saved/list", {
                method: "POST",
                credentials: "include"
            });

            if (res.ok) {
                const data = await res.json();
                setSavedRecipients(data);
            }
        } catch (err) {
            console.error("Kayıtlı alıcılar getirilemedi:", err);
        } finally {
            setLoadingRecipients(false);
        }
    };

    // Hook mount olduğunda veriyi çek
    useEffect(() => {
        fetchRecipients();
    }, []);

    return {
        savedRecipients,
        selectedRecipient,
        setSelectedRecipient,
        fetchRecipients,
        loadingRecipients
    };
};