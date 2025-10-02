import axios from 'axios';

export const fetchAtmLocations = async () => {
    try {
        const response = await axios.get('http://localhost:8080/api/v1/atm/get', {
            params: {
                id: 'all'
            }
        });

        if (response.status === 200 && response.data?.atmStatusDTOList) {
            return response.data.atmStatusDTOList.map((atm: any) => ({
                id: atm.id,
                latitude: parseFloat(atm.latitude),
                longitude: parseFloat(atm.longitude),
                address: atm.address,
                name: atm.name,
                status: atm.status,
                depositStatus: atm.depositStatus,
                withdrawStatus: atm.withdrawStatus,
                supportedBanks: atm.supportedBanks
            }));
        } else {
            throw new Error("ATM listesi alınamadı.");
        }
    } catch (error) {
        console.error('ATM verisi alinirken hata oluştu:', error);
        throw error;
    }
};