'use client';

import {useEffect, useMemo, useRef, useState} from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {useAtmLocations} from "@/app/lib/hooks/useAtmLocations";

mapboxgl.accessToken =
    'pk.eyJ1IjoicGZhbmQwMCIsImEiOiJjbTlrMWV3eDYwYm1pMnZzYjVsdGJiYjllIn0.DMGe0r4wr1B7051y5Z5-Yw';

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

interface MapCanvasProps{
    routeType?: string;
    is3D?: boolean;
    onAtmSelect?: (atm: Atm) => void;
}

const MapCanvas = ({routeType, is3D = false, onAtmSelect} : MapCanvasProps) => {
    const { atmLocations, loading, error } = useAtmLocations();
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const [selectedAtm, setSelectedAtm] = useState<Atm | null>(null);
    const markerRef = useRef<mapboxgl.Marker | null>(null);
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

    const buildingLayer = {
        id: '3d-buildings',
        source: 'composite',
        'source-layer': 'building',
        filter: ['==', 'extrude', 'true'],
        type: 'fill-extrusion' as const,
        minzoom: 14,
        paint: {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': [
                'interpolate', ['linear'], ['zoom'],
                15, 0,
                15.05, ['*', ['get', 'height'], 1]
            ],
            'fill-extrusion-base': [
                'interpolate', ['linear'], ['zoom'],
                15, 0,
                15.05, ['get', 'min_height']
            ],
            'fill-extrusion-opacity': 0.6
        }
    };

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
            const marker = new mapboxgl.Marker({ element: atmEl })
                .setLngLat([atm.longitude, atm.latitude])
                .addTo(mapRef.current!);

            // Click event
            atmEl.addEventListener('click', () => {
                setSelectedAtm(atm); // MapCanvas içinde local state
                if (onAtmSelect) onAtmSelect(atm); // Parent’a bildir
                mapRef.current!.flyTo({ center: [atm.longitude, atm.latitude], zoom: 16 });
            });

        });
    }, [atmLocations]);

    useEffect(() => {
        if (!mapRef.current) return;

        mapRef.current.setStyle(mapStyle);
    }, [mapStyle]);

    useEffect(() => {
        if (!mapRef.current) return;

        const map = mapRef.current;

        if (is3D) {
            // 3D moduna geç
            map.easeTo({
                pitch: 60,
                bearing: 30,
                duration: 1000
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
                duration: 1000
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
            if(routeType === 'walking') {
                markerElementRef.current.textContent = '🚶';
            } else if(routeType === 'driving') {
                markerElementRef.current.textContent = '🚗';
            } else if(routeType === 'cycling') {
                markerElementRef.current.textContent = '🚴';
            } else {
                markerElementRef.current.textContent = '🚶'; // varsayılan
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

        if(routeType === 'walking') markerElement.textContent = '🚶';
        else if(routeType === 'driving') markerElement.textContent = '🚗';
        else if(routeType === 'cycling') markerElement.textContent = '🚴';
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

            console.log('Yeni marker konumu:', {
                lat: lngLat.lat,
                lng: lngLat.lng
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

            {/* Koordinat Göstergesi */}
            <div className="absolute top-5 left-5 bg-black/85 backdrop-blur-md p-5 rounded-xl border border-white/10 shadow-2xl z-10 min-w-[220px]">
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
                    <div className="mt-4 p-2 bg-red-500/20 border border-red-500/40 rounded-md text-red-400 text-xs text-center animate-pulse">
                        Sürükleniyor...
                    </div>
                )}
            </div>
        </div>
    );
};

export default MapCanvas;


/*// Navigasyon kontrolleri ekle
        mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // Fullscreen kontrolü ekle
        mapRef.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

        // Konum kontrolü ekle
        mapRef.current.addControl(
            new mapboxgl.GeolocateControl({
                positionOptions: {
                    enableHighAccuracy: true
                },
                trackUserLocation: true,
                showUserHeading: true
            }),
            'top-right'
        );*/