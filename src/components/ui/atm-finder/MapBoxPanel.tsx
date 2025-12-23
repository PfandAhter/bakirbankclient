'use client';

import { MutableRefObject, forwardRef, useImperativeHandle, useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { startTPSAnimation } from "@/src/hooks/atm/startTpsAnimation";
import { setViewStateAfterAnimationUtil } from "@/src/hooks/atm/startTpsAnimation";
import { Atm, Coordinates, MapViewState, RouteData } from '@/src/types/atm-map';

// Use environment variable for Mapbox token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API_KEY || '';

interface MapCanvasProps {
    atms: Atm[];  // ATMs passed from parent (filtered or all)
    routeType?: string;
    is3D?: boolean;
    isRouteCalculating?: boolean;
    animationRef: MutableRefObject<number | null>;
    setAnimationInProgress: (value: boolean) => void;
    setFollowingRoute: (value: boolean) => void;
    setAnimationProgress: (value: number) => void;
    setViewTPS: (value: boolean) => void;
    setViewState: (view: MapViewState) => void;
    routeData: RouteData | null;
    viewState: MapViewState;
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
    atms,  // Receive ATMs from props instead of calling hook internally
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
    // Map loaded state - gates ATM marker creation until map is ready
    const [isMapLoaded, setIsMapLoaded] = useState(false);
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
    // Track ATM markers for cleanup
    const atmMarkersRef = useRef<mapboxgl.Marker[]>([]);

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

    // ATM markers effect - handles marker creation and cleanup
    useEffect(() => {
        // Debug logging to trace the issue
        console.log('[ATM Effect] Running...', {
            isMapLoaded,
            hasMapRef: !!mapRef.current,
            atmsLength: atms?.length ?? 'undefined'
        });

        // 1. Harita yüklü değilse veya ATM verisi yoksa dur.
        if (!isMapLoaded) {
            console.log('[ATM Effect] Waiting for map to load...');
            return;
        }
        if (!mapRef.current) {
            console.log('[ATM Effect] Map ref not available');
            return;
        }
        if (!atms || atms.length === 0) {
            console.log('[ATM Effect] No ATMs to display');
            return;
        }

        const map = mapRef.current;
        console.log(`[ATM Effect] Adding ${atms.length} ATM markers to map...`);

        // 2. Önceki markerları temizle (Duplicate olmaması için)
        atmMarkersRef.current.forEach(marker => marker.remove());
        atmMarkersRef.current = [];

        // 3. Yeni markerları ekle
        atms.forEach(atm => {
            // Koordinat kontrolü (Hata almamak için)
            if (!atm.latitude || !atm.longitude) return;

            const atmEl = document.createElement('div');
            atmEl.className = 'atm-marker'; // CSS class eklemek isterseniz
            atmEl.style.width = '32px';
            atmEl.style.height = '32px';
            atmEl.style.display = 'flex';
            atmEl.style.justifyContent = 'center';
            atmEl.style.alignItems = 'center';
            atmEl.style.fontSize = '24px'; // İkonu biraz büyüttüm
            atmEl.style.cursor = 'pointer';
            atmEl.style.zIndex = '10'; // Diğer layerların üstünde kalsın
            atmEl.textContent = '🏧';
            atmEl.setAttribute('data-atm-id', atm.id);

            const marker = new mapboxgl.Marker({
                element: atmEl,
                anchor: 'center' // Markerın tam ortası koordinata denk gelsin
            })
                .setLngLat([atm.longitude, atm.latitude])
                .addTo(map);

            // Marker'ı referans dizisine sakla
            atmMarkersRef.current.push(marker);

            // Click Event
            atmEl.addEventListener('click', (e) => {
                e.stopPropagation(); // Haritaya tıklanmasını engelle

                if (setIsSelectedAtmChanged) setIsSelectedAtmChanged(true);

                clearRoute();
                setSelectedAtm(atm);
                if (onAtmSelect) onAtmSelect(atm);

                map.flyTo({
                    center: [atm.longitude, atm.latitude],
                    zoom: 16,
                    essential: true
                });

                // Seçili marker stil güncellemesi
                document.querySelectorAll('[data-atm-id]').forEach(el => {
                    const htmlEl = el as HTMLDivElement;
                    if (el.getAttribute('data-atm-id') === atm.id) {
                        htmlEl.style.filter = 'drop-shadow(0 0 5px rgba(0,0,255,0.7))';
                        htmlEl.style.transition = 'all 0.3s ease';
                    } else {
                        htmlEl.style.transform = 'scale(1)';
                        htmlEl.style.filter = 'none';
                    }
                });
            });
        });

        // Cleanup function
        return () => {
            atmMarkersRef.current.forEach(marker => marker.remove());
            atmMarkersRef.current = [];
        };

        // BURASI ÇOK ÖNEMLİ: isMapLoaded buraya eklendi.
    }, [atms, isMapLoaded, setIsSelectedAtmChanged, onAtmSelect]);

    useEffect(() => {
        if (!mapRef.current || !routeData?.geometry?.coordinates) return;

        const map = mapRef.current;

        const routeGeoJson = {
            type: "Feature" as const,
            properties: {},
            geometry: {
                type: "LineString" as const,
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
                const { latitude, longitude } = position.coords;
                setMarkerCoordinates({ latitude, longitude });

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

        try {
            (mapboxgl as any).telemetry = false;
        } catch(e) {}

        const map = new mapboxgl.Map({
            container: mapContainerRef.current as HTMLDivElement,
            style: 'mapbox://styles/mapbox/dark-v8',
            center: [markerCoordinates.longitude, markerCoordinates.latitude],
            zoom: 14,
            renderWorldCopies: false,
        });

        mapRef.current = map;

        // Set isMapLoaded to true when map is ready - this gates ATM marker creation
        map.on('load', () => {
            console.log('Mapbox map loaded - ready for markers');
            setIsMapLoaded(true);
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


        /*marker.on('dragstart', () => {
            setIsDragging(true);
            markerElement.className = 'w-10 h-10 cursor-grabbing';

            // Harita pan'ini devre dışı bırak
            if (mapRef.current) {
                mapRef.current.dragPan.disable();
            }
        });

        marker.on('drag', () => {
            // Only update marker visual position, don't trigger React re-renders
            // This prevents the trembling effect
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
        });*/


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

                const [points, parkAreas] = await Promise.all([
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