import { useState, useEffect } from 'react';
import axios from 'axios';

interface Atm {
    id: string;
    latitude: number;
    longitude: number;
    name: string;
    address: string;
    status: string;
    depositStatus: string;
    withdrawStatus: string;
    supportedBanks?: Array<{
        id: string;
        name: string;
    }>;
}

export const useAtmLocations = () => {
    const [atmLocations, setAtmLocations] = useState<Atm[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const getAtmLocations = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/v1/atm/get', {
                params: { id: 'all' }
            });

            if (response.status === 200 && response.data?.atmStatusDTOList) {
                const atmList = response.data.atmStatusDTOList.map((atm: any) => ({
                    id: atm.id,
                    latitude: parseFloat(atm.latitude),
                    longitude: parseFloat(atm.longitude),
                    name: atm.name,
                    address: atm.address,
                    status: atm.status,
                    depositStatus: atm.depositStatus,
                    withdrawStatus: atm.withdrawStatus,
                    supportedBanks: atm.supportedBanks
                }));
                setAtmLocations(atmList);
                setError(false);
            } else {
                setError(true);
            }
        } catch (err) {
            console.error("ATM verisi alınamadı:", err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getAtmLocations();
    }, []);

    return { atmLocations, loading, error, refresh: getAtmLocations };
};