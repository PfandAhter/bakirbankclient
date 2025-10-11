'use client';

import {MutableRefObject, forwardRef, useImperativeHandle, useEffect, useRef, useState} from 'react';
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
    const [oldCameraPosition, setOldCameraPosition] = useState<Coordinates | null>(null);

    const animationProgressRef = useRef(0);

    const [markerCoordinates, setMarkerCoordinates] = useState<Coordinates>({
        latitude: 38.020274,
        longitude: 32.501786
    });
    const markerElementRef = useRef<HTMLDivElement | null>(null);

    const [isDragging, setIsDragging] = useState<boolean>(false);

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
        if (!cameraPosition || !onCameraPositionChange) return;

        // Sadece gerçekten değiştiğinde çağır
        if (oldCameraPosition?.latitude !== cameraPosition.latitude ||
            oldCameraPosition?.longitude !== cameraPosition.longitude) {
            onCameraPositionChange(cameraPosition);
            setOldCameraPosition(cameraPosition);
        }
    }, [cameraPosition]);

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
                mapRef,
                userMarkerRef: markerRef,
                userPosition: markerCoordinates,
                shouldStopAnimation: shouldStopAnimation,
                onAnimationStopped: onAnimationStopped,
                setAnimationProgressRef: animationProgressRef
            });
        }
    };

    /*useEffect(() => {
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
                mapRef,
                userMarkerRef: markerRef,
                userPosition: markerCoordinates,
                shouldStopAnimation: shouldStopAnimation,
                onAnimationStopped: onAnimationStopped,
                setAnimationProgressRef: animationProgressRef
            });
        } else {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
                setAnimationInProgress(false);
                setFollowingRoute(false);
                setViewTPS(false);
            }
        }
    }, [isRouteCalculating]);*/

    useEffect(() => {
        if (!mapRef.current || atmLocations.length === 0) return;

        atmLocations.forEach(atm => {
            if(document.querySelector(`[data-atm-id="${atm.id}"]`)) return;

            const atmEl = document.createElement('div');
            atmEl.style.width = '32px';
            atmEl.style.height = '32px';
            atmEl.style.display = 'flex';
            atmEl.style.justifyContent = 'center';
            atmEl.style.alignItems = 'center';
            atmEl.style.fontSize = '20px';
            atmEl.style.cursor = 'pointer';
            atmEl.textContent = '🏧';

            // Marker'a data attribute ekle
            atmEl.setAttribute('data-atm-id', atm.id);

            const marker = new mapboxgl.Marker({element: atmEl})
                .setLngLat([atm.longitude, atm.latitude])
                .addTo(mapRef.current!);

            atmEl.addEventListener('click', () => {
                const isDifferentAtm = selectedAtm?.id !== atm.id;

                if (setIsSelectedAtmChanged) setIsSelectedAtmChanged(true);

                if (isDifferentAtm) {
                    clearRoute();
                }

                setSelectedAtm(atm);
                if (onAtmSelect) onAtmSelect(atm);

                mapRef.current!.flyTo({center: [atm.longitude, atm.latitude], zoom: 16});

                // Tüm marker’ları kontrol edip seçilen ATM’i kırmızı ve parlak yap
                atmLocations.forEach(otherAtm => {
                    const markerElement = document.querySelector(
                        `[data-atm-id="${otherAtm.id}"]`
                    ) as HTMLDivElement | null;
                    if (!markerElement) return;

                    if (otherAtm.id === atm.id) {
                        // Seçilen ATM
                        markerElement.style.color = 'red';
                        markerElement.style.textShadow = '0 0 10px red';
                        markerElement.style.transform = 'scale(1.5)';
                    } else {
                        // Diğerleri normal
                        markerElement.style.color = 'black';
                        markerElement.style.textShadow = '';
                        markerElement.style.transform = 'scale(1)';
                    }
                });
            });
        });
    }, [atmLocations,setIsSelectedAtmChanged, onAtmSelect]);

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
            (map.getSource("route") as mapboxgl.GeoJSONSource).setData(routeGeoJson);
        } else {
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
            map.easeTo({
                pitch: 60,
                bearing: 30,
                duration: 1000,
                zoom: 16,
            });

            if (!map.getLayer("3d-buildings")) {
                map.addLayer(buildingLayer);
            }
        } else {
            map.easeTo({
                pitch: 0,
                bearing: 0,
                duration: 1000,
                zoom: 16,
            });

            if (map.getLayer("3d-buildings")) {
                map.removeLayer("3d-buildings");
            }
        }
    }, [is3D]);

    useEffect(() => {
        if (markerElementRef.current && routeType) {
            if (routeType === 'walking') {
                markerElementRef.current.textContent = '🚶';
            } else if (routeType === 'driving') {
                markerElementRef.current.textContent = '🚗';
            } else if (routeType === 'cycling') {
                markerElementRef.current.textContent = '🚴';
            } else {
                markerElementRef.current.textContent = '🚶';
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
            });
        }
    }, []);

    useEffect(() => {
        if (mapRef.current) return;

        mapRef.current = new mapboxgl.Map({
            container: mapContainerRef.current as HTMLDivElement,
            style: 'mapbox://styles/mapbox/dark-v8',
            center: [markerCoordinates.longitude, markerCoordinates.latitude],
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


        return () => {
            mapRef.current?.remove();
            mapRef.current = null;
        };
    }, []);


    useEffect(() => {
        if (!mapRef.current) return;

        const map = mapRef.current;

        console.log("Map yükleniyor ve ikonlar ekleniyor...");

        map.on("load", async () => {
            const icons = [
                { name: "mosque-icon", url: "/icons/mosque.png" },
                { name: "turkish-flag", url: "/icons/turkishflag.png" },
                { name: "faculty-icon", url: "/icons/facultyBuilding.png" },
                { name: "hospital-icon", url: "/icons/hospital.png" },
                { name: "dormBuilding-icon", url: "/icons/dormBuilding.png" },
                { name: "gokkusagi-icon", url: "/icons/gokkusagi.png" },
                { name: "institute-icon", url: "/icons/institute.png" }
            ];

            await Promise.all(
                icons.map(
                    (icon) =>
                        new Promise<void>((resolve, reject) => {
                            if (map.hasImage(icon.name)) return resolve();
                            map.loadImage(icon.url, (error, image) => {
                                if (error) return reject(error);
                                if (!map.hasImage(icon.name) && image) {
                                    map.addImage(icon.name, image);
                                }
                                resolve();
                            });
                        })
                )
            );

            try {
                console.log("Json verileri yükleniyor...");

                const [points,parkAreas] = await Promise.all([
                    fetch("/buildingIcons.json").then((res) => res.json()),
                    fetch("/parkAreas.json").then((res) => res.json())
                ]);

                if (!map.getSource("multiple-icons")) {
                    map.addSource("multiple-icons", {
                        type: "geojson",
                        data: points
                    });

                    map.addLayer({
                        id: "multiple-icons-layer",
                        type: "symbol",
                        source: "multiple-icons",
                        layout: {
                            "icon-image": ["get", "icon"],
                            "icon-size": [
                                "match",
                                ["get", "icon"],
                                "mosque-icon", 0.2,
                                "turkish-flag", 0.4,
                                "faculty-icon", 0.4,
                                "hospital-icon", 0.4,
                                "dormBuilding-icon", 0.4,
                                "gokkusagi-icon", 0.4,
                                "institute-icon", 0.4,
                                0.4
                            ],
                            "icon-allow-overlap": true,
                            "text-field": ["get", "title"],
                            "text-offset": [0, 1.2],
                            "text-anchor": "top",
                            "text-size": 16
                        },
                        paint: {
                            "text-color": "#ffffff"
                        }
                    });
                }

                parkAreas.forEach(({ id, url, coordinates }: any) => {
                    if (!map.getSource(id)) {
                        map.addSource(id, {
                            type: "image",
                            url,
                            coordinates
                        });

                        map.addLayer({
                            id: `${id}-layer`,
                            type: "raster",
                            source: id,
                            paint: {
                                "raster-opacity": 0.85
                            }
                        });
                    }
                });
            } catch (err) {
                console.error("Veriler yüklenirken hata oluştu:", err);
            }
        });
    }, [is3D]);


    useEffect(() => {
        if (!mapRef.current) return;
        const map = mapRef.current;

        const addTerrain = () => {
            if (!map.getSource("mapbox-dem")) {
                map.addSource("mapbox-dem", {
                    type: "raster-dem",
                    url: "mapbox://mapbox.mapbox-terrain-dem-v1",
                    tileSize: 512,
                    maxzoom: 14,
                });
            }
            map.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });
            map.setLight({ anchor: "viewport", intensity: 0.5 });
        };

        map.on("style.load", addTerrain);

        return () => {
            map.off("style.load", addTerrain);
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