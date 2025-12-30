import { useState, useEffect, useCallback } from 'react';
import { MapViewState, UserPosition, Coordinates } from '@/src/types/atm-map';

export const useMapLogic = () => {
    const [viewState, setViewState] = useState<MapViewState>({
        latitude: 38.024050,
        longitude: 32.510783,
        zoom: 14,
        pitch: 0,
        bearing: 0,
    });

    const [userPosition, setUserPosition] = useState<UserPosition>({
        latitude: 37.0119798,
        longitude: 37.3555935
    });

    const [is3D, setIs3D] = useState(false);
    const [cameraPosition, setCameraPosition] = useState<Coordinates | null>(null);

    // Trigger counter to force effect to run on every button click
    const [centerOnUserTrigger, setCenterOnUserTrigger] = useState(0);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const { latitude, longitude } = position.coords;
                setUserPosition({ latitude, longitude });
            }, error => {
                console.error("Konum alınamadı:", error);
            });
        }
    }, []);

    const toggle3D = useCallback((animationInProgress: boolean) => {
        if (animationInProgress) return;

        if (!is3D) {
            setViewState(prev => ({
                ...prev,
                pitch: 60,
                bearing: 30,
                zoom: prev.zoom < 15 ? 15 : prev.zoom,
            }));
        } else {
            setViewState(prev => ({
                ...prev,
                pitch: 0,
                bearing: 0,
            }));
        }
        setIs3D(prev => !prev);
    }, [is3D]);

    const centerOnUser = useCallback(() => {
        if (userPosition) {
            // Increment trigger to force the effect to run
            setCenterOnUserTrigger(prev => prev + 1);
        }
    }, [userPosition]);

    return {
        viewState,
        setViewState,
        userPosition,
        setUserPosition,
        is3D,
        toggle3D,
        cameraPosition,
        setCameraPosition,
        centerOnUser,
        centerOnUserTrigger
    };
};