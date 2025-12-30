import {useState, useRef} from 'react';

export const useMapView = () => {
    const [viewState, setViewState] = useState({
        latitude: 38.024050,
        longitude: 32.510783,
        zoom: 14,
        pitch: 0,
        bearing: 0,
    });

    const [is3D, setIs3D] = useState(false);
    const [buildingHeight, setBuildingHeight] = useState(1);
    const [cameraPosition, setCameraPosition] = useState(null);
    const mapRef = useRef(null);


    return {
        viewState, setViewState,
        is3D, setIs3D,
        buildingHeight, setBuildingHeight,
        cameraPosition, setCameraPosition,
        mapRef
    };
};