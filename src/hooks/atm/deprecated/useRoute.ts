// hooks/useRoute.ts
import { useRef, useState } from "react";

export const useRoute = () => {
    const [userPosition, setUserPosition] = useState(null);
    const [routeData, setRouteData] = useState(null);
    const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
    const [routeType, setRouteType] = useState("walking");
    const [selectedRouteType, setSelectedRouteType] = useState("walking");
    const [routeSteps, setRouteSteps] = useState([]);
    const routeDataRef = useRef(null);

    return {
        userPosition, setUserPosition,
        routeData, setRouteData,
        isCalculatingRoute, setIsCalculatingRoute,
        routeType, setRouteType,
        selectedRouteType, setSelectedRouteType,
        routeSteps, setRouteSteps,
        routeDataRef
    };
};
