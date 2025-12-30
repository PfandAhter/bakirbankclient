// @ts-nocheck
import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import { Atm, Coordinates, RouteData } from '@/src/types/atm-map';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MiniMapProps {
    routeData: RouteData | null;
    userPosition: Coordinates | null;
    selectedAtm: Atm | null;
    currentPosition: Coordinates | null;
    mapboxToken: string;
    processActive: boolean;
}

const MiniMap: React.FC<MiniMapProps> = ({
    routeData,
    userPosition,
    selectedAtm,
    currentPosition,
    mapboxToken,
    processActive
}: MiniMapProps) => {
    const miniMapRef = useRef<HTMLDivElement | null>(null);
    const miniMapInstanceRef = useRef<mapboxgl.Map | null>(null);
    const miniMapMarkersRef = useRef<mapboxgl.Marker[]>([]);

    // Mini harita oluşturma
    useEffect(() => {
        if (!miniMapRef.current || !mapboxToken) return;

        mapboxgl.accessToken = mapboxToken;

        if (miniMapInstanceRef.current) return;

        const miniMapInstance = new mapboxgl.Map({
            container: miniMapRef.current,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: userPosition ? [userPosition.longitude, userPosition.latitude] : [29.0335, 41.0082],
            zoom: 14,
            interactive: false
        });

        miniMapInstanceRef.current = miniMapInstance;

        miniMapInstance.on('load', () => {
            console.log("MiniMap: Harita yüklendi");
        });

        return () => {
            if (miniMapInstanceRef.current) {
                miniMapInstanceRef.current.remove();
                miniMapInstanceRef.current = null;
            }
        };
    }, [mapboxToken, userPosition]);

    // Rota ve marker güncellemeleri
    useEffect(() => {
        const miniMapInstance = miniMapInstanceRef.current;
        if (!miniMapInstance) return;

        const setupMap = () => {
            // Önceki markerları kaldır
            miniMapMarkersRef.current.forEach(marker => marker.remove());
            miniMapMarkersRef.current = [];

            // Kullanıcı marker
            if (userPosition) {
                const el = document.createElement('div');
                el.style.width = '12px';
                el.style.height = '12px';
                el.style.borderRadius = '50%';
                el.style.backgroundColor = '#4285F4';
                el.style.border = '2px solid #fff';
                const marker = new mapboxgl.Marker(el)
                    .setLngLat([userPosition.longitude, userPosition.latitude])
                    .addTo(miniMapInstance);
                miniMapMarkersRef.current.push(marker);
            }

            // ATM marker
            if (selectedAtm) {
                const el = document.createElement('div');
                el.style.width = '12px';
                el.style.height = '12px';
                el.style.borderRadius = '50%';
                el.style.backgroundColor = '#FF5252';
                el.style.border = '2px solid #fff';
                const marker = new mapboxgl.Marker(el)
                    .setLngLat([selectedAtm.longitude, selectedAtm.latitude])
                    .addTo(miniMapInstance);
                miniMapMarkersRef.current.push(marker);
            }

            // Rota
            if (routeData && routeData.geometry) {
                if (miniMapInstance.getSource('route')) {
                    miniMapInstance.removeLayer('route-layer');
                    miniMapInstance.removeSource('route');
                }

                miniMapInstance.addSource('route', {
                    type: 'geojson',
                    data: routeData
                });

                miniMapInstance.addLayer({
                    id: 'route-layer',
                    type: 'line',
                    source: 'route',
                    layout: { 'line-join': 'round', 'line-cap': 'round' },
                    paint: { 'line-color': '#4285F4', 'line-width': 3 }
                });

                if (routeData.geometry.coordinates.length > 0) {
                    const bounds = new mapboxgl.LngLatBounds();
                    routeData.geometry.coordinates.forEach((coord: number[]) => bounds.extend(coord as [number, number]));
                    miniMapInstance.fitBounds(bounds, { padding: 30 });
                }
            }
        };

        if (miniMapInstance.loaded()) {
            setupMap();
        } else {
            miniMapInstance.on('load', setupMap);
        }
    }, [routeData, userPosition, selectedAtm]);

    // Anlık konum güncellemesi
    useEffect(() => {
        const miniMapInstance = miniMapInstanceRef.current;
        if (!miniMapInstance || !currentPosition || !miniMapInstance.loaded()) return;

        const source = miniMapInstance.getSource('current-position') as mapboxgl.GeoJSONSource;

        if (!source) {
            miniMapInstance.addSource('current-position', {
                type: 'geojson',
                data: {
                    type: 'Feature',
                    geometry: { type: 'Point', coordinates: [currentPosition.longitude, currentPosition.latitude] },
                    properties: {}
                }
            });

            miniMapInstance.addLayer({
                id: 'current-position-circle',
                type: 'circle',
                source: 'current-position',
                paint: {
                    'circle-radius': 6,
                    'circle-color': '#4285F4',
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#ffffff'
                }
            });
        } else {
            source.setData({
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [currentPosition.longitude, currentPosition.latitude] },
                properties: {}
            });
        }
    }, [currentPosition]);

    // Process bittiğinde rotayı yumuşak şekilde ekrana ortala
    useEffect(() => {
        const miniMapInstance = miniMapInstanceRef.current;
        if (!miniMapInstance || !routeData || !routeData.geometry) return;

        if (!processActive) {
            const bounds = new mapboxgl.LngLatBounds();
            routeData.geometry.coordinates.forEach((coord: number[]) => bounds.extend(coord as [number, number]));
            miniMapInstance.fitBounds(bounds, { padding: 40, duration: 2000 });
        }
    }, [processActive, routeData]);

    return (
        <div
            className={`mini-map-container ${mapboxToken ? 'visible' : 'hidden'} hidden md:block`}
            style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                width: 'clamp(200px, 25vw, 300px)',
                height: 'clamp(200px, 25vw, 300px)',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
                border: '2px solid white',
                zIndex: 999
            }}
        >
            <div ref={miniMapRef} style={{ width: '100%', height: '100%' }} />
            {!mapboxToken && (
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(255,255,255,0.8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '10px', textAlign: 'center'
                }}>
                    MapBox token eksik
                </div>
            )}
        </div>
    );
};

export default MiniMap;
