'use client';

import {MutableRefObject, forwardRef, useImperativeHandle, useEffect, useMemo, useRef, useState} from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {useAtmLocations} from "@/app/lib/hooks/useAtmLocations";
import {startTPSAnimation} from "@/app/lib/atm/startTpsAnimation";
import {setViewStateAfterAnimationUtil} from "@/app/lib/atm/startTpsAnimation";

mapboxgl.accessToken =
    '';

interface Coordinates {
    latitude: number;
    longitude: number;
}

interface Atm {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    address: string;
    status: string;
    depositStatus: string;
    withdrawStatus: string;
    supportedBanks?: Array<{
        id: string;
        name: string;
    }>;
    isUserCreated?: boolean;
}

interface ViewState {
    latitude: number;
    longitude: number;
    zoom: number;
    pitch: number;
    bearing: number;
}

interface RouteData {
    geometry: {
        coordinates: number[][];
    };
    duration?: number;
    distance?: number;
}

interface MapCanvasProps {
    routeType?: string;
    is3D?: boolean;
    isRouteCalculating?: boolean;
    animationRef: MutableRefObject<number | null>;
    setAnimationInProgress: (value: boolean) => void;
    setFollowingRoute: (value: boolean) => void;
    setAnimationProgress: (value: number) => void;
    setViewTPS: (value: boolean) => void;
    setViewState: (view: ViewState) => void;
    routeData: RouteData | null;
    viewState: ViewState;
    startAnimation?: () => void;
    setIsSelectedAtmChanged?: (value: boolean) => void;
    onAtmSelect?: (atm: Atm) => void;
    onCameraPositionChange?: (position: Coordinates | null) => void;
    shouldStopAnimation?: boolean;
    setUserPosition: (position: Coordinates) => void;
    onAnimationStopped?: () => void;
}

const MapCanvas = forwardRef<
    { handleStartAnimation: () => void },
    MapCanvasProps
>(({
       routeType,
       is3D = false,
       isRouteCalculating,
       onAtmSelect,
       animationRef,
       setAnimationInProgress,
       setAnimationProgress,
       setFollowingRoute,
       setViewTPS,
       setViewState,
       viewState,
       startAnimation,
       setIsSelectedAtmChanged,
       onCameraPositionChange,
       routeData,
       shouldStopAnimation,
       setUserPosition,
       onAnimationStopped
   }: MapCanvasProps, ref) => {
    const {atmLocations, error} = useAtmLocations();
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const [selectedAtm, setSelectedAtm] = useState<Atm | null>(null);
    const markerRef = useRef<mapboxgl.Marker | null>(null);
    //FOR ROUTE ANIMATION
    const lastFrameTimeRef = useRef(0); // Frame kısıtlaması için son frame zamanı
    const previousViewStateRef = useRef(null);
    const routeDataRef = useRef(null);
    const [cameraPosition, setCameraPosition] = useState<Coordinates | null>(null);
    const animationProgressRef = useRef(0);

    //

    const [markerCoordinates, setMarkerCoordinates] = useState<Coordinates>({
        latitude: 38.020274,
        longitude: 32.501786
    });
    const markerElementRef = useRef<HTMLDivElement | null>(null);

    const [isDragging, setIsDragging] = useState<boolean>(false);

    const mapStyle = useMemo(() =>
            is3D
                ? "mapbox://styles/mapbox/dark-v8"
                : "mapbox://styles/mapbox/dark-v10"
        , [is3D]);

    const buildingLayer: mapboxgl.AnyLayer = {
        id: '3d-buildings',
        source: 'composite',
        'source-layer': 'building',
        filter: ['==', 'extrude', 'true'],
        type: 'fill-extrusion',
        minzoom: 14,
        paint: {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': [
                'interpolate',
                ['linear'],
                ['zoom'],
                15, 0,
                15.05, ['*', ['get', 'height'], 2]
            ] as any,
            'fill-extrusion-base': [
                'interpolate',
                ['linear'],
                ['zoom'],
                15, 0,
                15.05, ['get', 'min_height']
            ] as any,
            'fill-extrusion-opacity': 0.6
        }
    };

    useImperativeHandle(ref, () => ({
        handleStartAnimation,
        stopAnimation: () => {
            setViewStateAfterAnimationUtil({
                setAnimationInProgress,
                setFollowingRoute,
                setViewTPS,
                userMarkerRef: markerRef,
                userPosition: markerCoordinates,
                previousViewStateRef,
                setViewState,
                routeDataRef,
                mapRef
            });
        },
        clearRoute: () => {
            clearRoute();
            setViewStateAfterAnimationUtil({
                setAnimationInProgress,
                setFollowingRoute,
                setViewTPS,
                userMarkerRef: markerRef,
                userPosition: markerCoordinates,
                previousViewStateRef,
                setViewState,
                routeDataRef,
                mapRef
            });
        }
    }));

    useEffect(() => {
        if (isRouteCalculating && startAnimation) {
            handleStartAnimation()
        }
    }, [isRouteCalculating, startAnimation]);

    useEffect(() => {
        if (onCameraPositionChange) {
            onCameraPositionChange(cameraPosition);
        }
    }, [cameraPosition]);

    // Veya bir button click handler'ında
    const handleStartAnimation = () => {
        if (startAnimation) {
            startTPSAnimation({
                routeData,
                viewState,
                setViewState,
                setViewTPS,
                setFollowingRoute,
                setAnimationProgress,
                setAnimationInProgress,
                setCameraPosition,
                animationRef,
                routeDataRef,
                previousViewStateRef,
                lastFrameTimeRef,
                mapRef, // <= burayı ekle
                userMarkerRef: markerRef,
                userPosition: markerCoordinates,
                shouldStopAnimation: shouldStopAnimation,
                onAnimationStopped: onAnimationStopped,
                setAnimationProgressRef: animationProgressRef
            });
        }
    };

    useEffect(() => {
        console.log("Calculating route is: ", isRouteCalculating);
        if (isRouteCalculating) {
            startTPSAnimation({
                routeData,
                viewState,
                setViewState,
                setViewTPS,
                setFollowingRoute,
                setAnimationProgress,
                setAnimationInProgress,
                setCameraPosition,
                animationRef,
                routeDataRef,
                previousViewStateRef,
                lastFrameTimeRef,
                mapRef, // <= burayı ekle
                userMarkerRef: markerRef,
                userPosition: markerCoordinates,
                shouldStopAnimation: shouldStopAnimation,
                onAnimationStopped: onAnimationStopped,
                setAnimationProgressRef: animationProgressRef
            });
        } else {
            // Animasyonu durdur
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
                setAnimationInProgress(false);
                setFollowingRoute(false);
                setViewTPS(false);
            }
        }
    }, [isRouteCalculating]);

    useEffect(() => {
        if (!mapRef.current || atmLocations.length === 0) return;

        atmLocations.forEach(atm => {
            const atmEl = document.createElement('div');
            atmEl.style.width = '32px';
            atmEl.style.height = '32px';
            atmEl.style.display = 'flex';
            atmEl.style.justifyContent = 'center';
            atmEl.style.alignItems = 'center';
            atmEl.style.fontSize = '20px';
            atmEl.style.cursor = 'pointer';
            atmEl.textContent = '🏧';

            // Marker oluştur
            const marker = new mapboxgl.Marker({element: atmEl})
                .setLngLat([atm.longitude, atm.latitude])
                .addTo(mapRef.current!);

            // Click event
            atmEl.addEventListener('click', () => {
                const isDifferentAtm = selectedAtm?.id !== atm.id;
                console.log("Selected ATM: ", selectedAtm);
                console.log("Clicked ATM: ", atm);
                console.log("Is different ATM: ", isDifferentAtm);

                if (setIsSelectedAtmChanged) setIsSelectedAtmChanged(true); //TODO bu ney

                if (isDifferentAtm) {
                    clearRoute();
                }

                setSelectedAtm(atm); // MapCanvas içinde local state
                if (onAtmSelect) onAtmSelect(atm); // Parent’a bildir
                mapRef.current!.flyTo({center: [atm.longitude, atm.latitude], zoom: 16});
            });

        });
    }, [atmLocations, selectedAtm, setIsSelectedAtmChanged, onAtmSelect]);

    useEffect(() => {
        if (!mapRef.current) return;

        mapRef.current.setStyle(mapStyle);
    }, [mapStyle]);

    useEffect(() => {
        if (!mapRef.current || !routeData?.geometry?.coordinates) return;

        const map = mapRef.current;

        const routeGeoJson = {
            type: "Feature",
            properties: {},
            geometry: {
                type: "LineString",
                coordinates: routeData.geometry.coordinates,
            },
        };

        if (map.getSource("route")) {
            // daha önce varsa güncelle
            (map.getSource("route") as mapboxgl.GeoJSONSource).setData(routeGeoJson);
        } else {
            // yoksa ekle
            map.addSource("route", {
                type: "geojson",
                data: routeGeoJson,
            });

            map.addLayer({
                id: "route-line",
                type: "line",
                source: "route",
                layout: {
                    "line-join": "round",
                    "line-cap": "round",
                },
                paint: {
                    "line-color": "#bd0404",
                    "line-width": 5,
                },
            });
        }
    }, [routeData]);

    const clearRoute = () => {
        if (!mapRef.current) return;
        const map = mapRef.current;

        if (map.getLayer("route-line")) map.removeLayer("route-line");
        if (map.getSource("route")) map.removeSource("route");
    }

    useEffect(() => {
        if (!mapRef.current) return;

        const map = mapRef.current;

        if (is3D) {
            // 3D moduna geç
            map.easeTo({
                pitch: 60,
                bearing: 30,
                duration: 1000,
                zoom: 16
            });

            // Building layer'ı ekle
            map.once('styledata', () => {
                if (!map.getLayer('3d-buildings')) {
                    map.addLayer(buildingLayer);
                }
            });
        } else {
            // 2D moduna geç
            map.easeTo({
                pitch: 0,
                bearing: 0,
                duration: 1000,
                zoom: 16
            });

            // Building layer'ı kaldır
            if (map.getLayer('3d-buildings')) {
                map.removeLayer('3d-buildings');
            }
        }
    }, [is3D]);

    useEffect(() => {
        if (markerElementRef.current && routeType) {
            // Marker emoji'sini güncelle
            if (routeType === 'walking') {
                markerElementRef.current.textContent = '🚶';
            } else if (routeType === 'driving') {
                markerElementRef.current.textContent = '🚗';
            } else if (routeType === 'cycling') {
                markerElementRef.current.textContent = '🚴';
            } else {
                markerElementRef.current.textContent = '🚶'; // varsayılan
            }
        }
    }, [routeType]);


    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const {latitude, longitude} = position.coords;
                setMarkerCoordinates({latitude, longitude});

                // Update map center if map exists
                if (mapRef.current) {
                    mapRef.current.setCenter([longitude, latitude]);
                }

                // Update marker position if marker exists
                if (markerRef.current) {
                    markerRef.current.setLngLat([longitude, latitude]);
                }
            }, error => {
                console.error("Konum alınamadı:", error);
                // Varsayılan konum olarak İstanbul'u kullan
            });
        }
    }, []);

    useEffect(() => {
        if (mapRef.current) return; // harita bir kere oluşturulsun

        // Harita oluştur
        mapRef.current = new mapboxgl.Map({
            container: mapContainerRef.current as HTMLDivElement,
            style: 'mapbox://styles/mapbox/dark-v11',
            center: [markerCoordinates.longitude, markerCoordinates.latitude], // kullanıcı konumu
            zoom: 14,
            renderWorldCopies: false,
        });

        // Custom marker elementi oluştur
        const markerElement = document.createElement('div');
        markerElement.style.width = '40px';
        markerElement.style.height = '40px';
        markerElement.style.display = 'flex';
        markerElement.style.justifyContent = 'center';
        markerElement.style.alignItems = 'center';
        markerElement.style.fontSize = '24px';

        markerElement.style.pointerEvents = 'none'; // Bunu ekledim.

        markerElementRef.current = markerElement;

        if (routeType === 'walking') markerElement.textContent = '🚶';
        else if (routeType === 'driving') markerElement.textContent = '🚗';
        else if (routeType === 'cycling') markerElement.textContent = '🚴';
        else markerElement.textContent = '🚶';

        // Marker ekle
        const marker = new mapboxgl.Marker({
            element: markerElement,
            draggable: true,
            anchor: 'center' // Marker'ın alt kısmını koordinata sabitle tested bottom -> center
        })
            .setLngLat([markerCoordinates.longitude, markerCoordinates.latitude]) // marker konumu
            .addTo(mapRef.current);

        markerRef.current = marker;

        // Marker sürükleme olayları
        marker.on('dragstart', () => {
            setIsDragging(true);
            markerElement.className = 'w-10 h-10 cursor-grabbing';

            // Harita pan'ini devre dışı bırak
            if (mapRef.current) {
                mapRef.current.dragPan.disable();
            }
        });

        marker.on('drag', () => {
            const lngLat = marker.getLngLat();
            setMarkerCoordinates({
                latitude: lngLat.lat,
                longitude: lngLat.lng
            });
        });

        marker.on('dragend', () => {
            setIsDragging(false);
            markerElement.className = 'w-10 h-10 cursor-grab transition-transform';

            // Harita pan'ini tekrar etkinleştir
            if (mapRef.current) {
                mapRef.current.dragPan.enable();
            }

            const lngLat = marker.getLngLat();
            setMarkerCoordinates({
                latitude: lngLat.lat,
                longitude: lngLat.lng
            });

            setUserPosition({
                latitude: lngLat.lat,
                longitude: lngLat.lng
            });
        });

        // Cleanup function
        return () => {
            mapRef.current?.remove();
            mapRef.current = null;
        };
    }, []);

    return (
        <div className="relative w-full h-screen">
            <div
                ref={mapContainerRef}
                className="w-full h-full"
            />
        </div>
    );
});

MapCanvas.displayName = 'MapCanvas';

export default MapCanvas;

{/* Koordinat Göstergesi
            <div
                className="absolute top-5 left-5 bg-black/85 backdrop-blur-md p-5 rounded-xl border border-white/10 shadow-2xl z-10 min-w-[220px]">
                <h3 className="m-0 mb-4 text-white text-sm font-semibold tracking-wider uppercase">
                    Marker Konumu
                </h3>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-white/60 text-sm">Enlem:</span>
                    <span className="text-red-500 font-semibold text-sm font-mono">
                        {markerCoordinates.latitude.toFixed(6)}
                    </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-white/60 text-sm">Boylam:</span>
                    <span className="text-red-500 font-semibold text-sm font-mono">
                        {markerCoordinates.longitude.toFixed(6)}
                    </span>
                </div>
                {isDragging && (
                    <div
                        className="mt-4 p-2 bg-red-500/20 border border-red-500/40 rounded-md text-red-400 text-xs text-center animate-pulse">
                        Sürükleniyor...
                    </div>
                )}
            </div>*/
}