import { useState, useEffect } from 'react';
import { City, District, Branch } from '@/src/types/location';

export const useLocationData = (shouldFetchCities: boolean) => {
    const [cities, setCities] = useState<City[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);

    useEffect(() => {
        if (shouldFetchCities) {
            fetch('/api/city/list').then(res => res.json()).then(setCities).catch(console.error);
        }
    }, [shouldFetchCities]);

    const fetchDistricts = async (city: string) => {
        try {
            const res = await fetch('/api/district/list?city=' + city);
            setDistricts(await res.json());
        } catch (e) { console.error(e); }
    };

    const fetchBranches = async (district: string) => {
        try {
            const res = await fetch('/api/branch/list?district=' + district);
            setBranches(await res.json());
        } catch (e) { console.error(e); }
    };

    return { cities, districts, branches, fetchDistricts, fetchBranches };
};