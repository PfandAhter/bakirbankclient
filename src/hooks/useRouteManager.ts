import { useState } from 'react';
import { RouteData, RouteStep, UserPosition, Atm } from '@/src/types/atm-map';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_API_KEY;

export const useRouteManager = () => {
    const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
    const [routeData, setRouteData] = useState<RouteData | null>(null);
    const [routeSteps, setRouteSteps] = useState<RouteStep[]>([]);

    const calculateRoute = async (
        userPosition: UserPosition,
        targetAtm: Atm,
        routeType: string
    ) => {
        if (!userPosition || !targetAtm) return false;

        setIsCalculatingRoute(true);
        try {
            const response = await fetch(
                `https://api.mapbox.com/directions/v5/mapbox/${routeType}/${userPosition.longitude},${userPosition.latitude};${targetAtm.longitude},${targetAtm.latitude}?steps=true&geometries=geojson&access_token=${MAPBOX_TOKEN}`
            );

            const data = await response.json();

            if (data.routes && data.routes.length > 0) {
                const newRouteData = {
                    type: "Feature",
                    properties: {},
                    geometry: {
                        type: "LineString",
                        coordinates: data.routes[0].geometry.coordinates,
                    },
                };

                setRouteData(newRouteData as RouteData);
                setRouteSteps(data.routes[0].legs[0].steps);
                return true;
            }
        } catch (error) {
            console.error("❌ Rota hesaplama hatası:", error);
            return false;
        } finally {
            setIsCalculatingRoute(false);
        }
        return false;
    };

    const clearRoute = () => {
        setRouteData(null);
        setRouteSteps([]);
    };

    return {
        isCalculatingRoute,
        routeData,
        routeSteps,
        calculateRoute,
        clearRoute,
        setRouteData
    };
};