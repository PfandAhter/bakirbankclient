'use client';

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { Atm } from '@/app/types/Atm';
import { RouteData } from '@/app/types/RouteData';
import { UserPosition } from '@/app/types/UserPosition';
import { uploadImageToImgBB } from '@/src/hooks/atm/useUploadImageToImgBB';

import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API_KEY;

type PopUpMapProps = { atmSelected?: Atm };

export const PopUpMap: React.FC<PopUpMapProps> = ({ atmSelected }) => {
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const markerRef = useRef<mapboxgl.Marker | null>(null);

    const [selectedAtm, setSelectedAtm] = useState<Atm | null>(atmSelected ?? null);
    const [routeData, setRouteData] = useState<RouteData | null>(null);
    const [userPosition, setUserPosition] = useState<UserPosition>({ latitude: 37.0119798, longitude: 37.3555935 });

    // --- 1. Haritayı Başlat ---
    useEffect(() => {
        if (mapRef.current || !mapContainerRef.current) return;

        mapRef.current = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: 'mapbox://styles/mapbox/dark-v10',
            center: [userPosition.longitude, userPosition.latitude],
            zoom: 14,
            preserveDrawingBuffer: true,
            interactive: false,
        });

        mapRef.current.on('load', () => {
            console.log('✅ Background Map Yüklendi.');
        });

        // Error handling
        mapRef.current.on('error', (e) => {
            console.error('Mapbox Hatası:', e);
        });

        return () => {
            mapRef.current?.remove();
            mapRef.current = null;
        };
    }, []);

    // --- 3. Rota Çekme ---
    useEffect(() => {
        if (!selectedAtm) return;
        const atmLat = Number(selectedAtm.latitude);
        const atmLon = Number(selectedAtm.longitude);

        console.log(`📍 Rota isteniyor: User(${userPosition.latitude},${userPosition.longitude}) -> ATM(${atmLat},${atmLon})`);

        const fetchRoute = async () => {
            try {
                const token = mapboxgl.accessToken;
                const query = `${userPosition.longitude},${userPosition.latitude};${atmLon},${atmLat}`;
                const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${query}?steps=true&geometries=geojson&access_token=${token}`;

                const resp = await fetch(url);
                const json = await resp.json();

                if (json.routes && json.routes.length > 0) {
                    console.log('✅ Rota verisi alındı.');
                    setRouteData({
                        type: 'Feature',
                        properties: {},
                        geometry: {
                            type: 'LineString',
                            coordinates: json.routes[0].geometry.coordinates,
                        },
                    } as any);
                } else {
                    console.warn('⚠️ Rota bulunamadı:', json);
                }
            } catch (err) {
                console.error('❌ Rota hatası:', err);
            }
        };
        fetchRoute();
    }, [selectedAtm, userPosition]);

    // --- 4. Rotayı Çizme ---
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !routeData?.geometry?.coordinates) return;

        const sourceId = 'route-source';
        const layerId = 'route-layer';

        if (!map.getSource(sourceId)) {
            map.addSource(sourceId, { type: 'geojson', data: routeData });
            map.addLayer({
                id: layerId,
                type: 'line',
                source: sourceId,
                layout: { 'line-join': 'round', 'line-cap': 'round' },
                paint: { 'line-color': '#bd0404', 'line-width': 5 }
            } as any);
        } else {
            (map.getSource(sourceId) as mapboxgl.GeoJSONSource).setData(routeData);
        }

        const bounds = new mapboxgl.LngLatBounds();
        routeData.geometry.coordinates.forEach((coord: number[]) => {
            bounds.extend([coord[0], coord[1]]);
        });

        map.fitBounds(bounds, { padding: 100, animate: false });
        console.log('✅ Rota haritaya çizildi.');

    }, [routeData]);

    // --- 5. Upload & QR Event ---
    const processSnapshot = async () => {
        const map = mapRef.current;
        if (!map) return;

        try {
            console.log('📸 Snapshot hazırlanıyor...');
            const canvas = map.getCanvas();
            const dataUrl = canvas.toDataURL('image/png');

            console.log('⬆️ ImgBB yükleniyor...');
            const imageUrl = await uploadImageToImgBB(dataUrl);
            console.log('✅ Yükleme tamamlandı:', imageUrl);

            // Chat widget'a QR kodu göndermek için event dispatch
            window.dispatchEvent(new CustomEvent('qr-generated', {
                detail: {
                    qrUrl: imageUrl,
                    label: 'ATM Yol Tarifi - QR kodu tarayın veya tıklayın'
                }
            }));
            console.log('📲 QR event gönderildi');

        } catch (e) {
            console.error('Snapshot/Upload hatası:', e);
        }
    };

    const addEmojiToMap = (map: mapboxgl.Map, id: string, emoji: string) => {
        if (map.hasImage(id)) return;

        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.font = '56px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(emoji, 32, 32);
            const imageData = ctx.getImageData(0, 0, 64, 64);
            map.addImage(id, imageData);
        }
    };

    // --- 1.5 EKSTRA KATMANLAR (Senin İstediğin Kod Bloğu) ---
    // Bu blok harita yüklendiğinde dışarıdan ikonları ve JSON verilerini çeker.
    useEffect(() => {
        if (!mapRef.current) return;
        const map = mapRef.current;

        // Harita zaten yüklendiyse direkt çalıştır, yoksa 'load' bekle
        const loadLayers = async () => {
            console.log("Ekstra ikonlar ve veriler yükleniyor...");

            const icons = [
                { name: "mosque-icon", url: "/icons/mosque.png" },
                { name: "turkish-flag", url: "/icons/turkishflag.png" },
                { name: "faculty-icon", url: "/icons/facultyBuilding.png" },
                { name: "hospital-icon", url: "/icons/hospital.png" },
                { name: "dormBuilding-icon", url: "/icons/dormBuilding.png" },
                { name: "gokkusagi-icon", url: "/icons/gokkusagi.png" },
                { name: "institute-icon", url: "/icons/institute.png" }
            ];

            // 1. İkonları Yükle
            await Promise.all(
                icons.map((icon) => new Promise<void>((resolve, reject) => {
                    if (map.hasImage(icon.name)) return resolve();
                    map.loadImage(icon.url, (error, image) => {
                        if (error) {
                            console.warn(`İkon yüklenemedi: ${icon.name}`); // Hata olursa patlamasın, devam etsin
                            return resolve();
                        }
                        if (!map.hasImage(icon.name) && image) {
                            map.addImage(icon.name, image);
                        }
                        resolve();
                    });
                }))
            );

            try {
                // 2. JSON Verilerini Çek (buildingIcons.json ve parkAreas.json)
                // Not: Bu dosyaların 'public' klasöründe olduğundan emin olun.
                const [points, parkAreas] = await Promise.all([
                    fetch("/buildingIcons.json").then((res) => res.json()).catch(e => null),
                    fetch("/parkAreas.json").then((res) => res.json()).catch(e => null)
                ]);

                // Bina İkonları Katmanı
                if (points && map && !map.getSource("multiple-icons")) {
                    map.addSource("multiple-icons", { type: "geojson", data: points });

                    map.addLayer({
                        id: "multiple-icons-layer",
                        type: "symbol",
                        source: "multiple-icons",
                        layout: {
                            "icon-image": ["get", "icon"],
                            "icon-size": [
                                "match", ["get", "icon"],
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
                        paint: { "text-color": "#ffffff" }
                    });
                }

                // Park Alanları (Raster) Katmanı
                if (parkAreas && Array.isArray(parkAreas)) {
                    parkAreas.forEach(({ id, url, coordinates }: any) => {
                        if (!map.getSource(id)) {
                            map.addSource(id, { type: "image", url, coordinates });
                            map.addLayer({
                                id: `${id}-layer`,
                                type: "raster",
                                source: id,
                                paint: { "raster-opacity": 0.85 }
                            });
                        }
                    });
                }
                console.log("✅ Ekstra veriler başarıyla eklendi.");
            } catch (err) {
                console.error("Veriler yüklenirken hata oluştu:", err);
            }
        };

        if (map.loaded()) {
            loadLayers();
        } else {
            map.on('load', loadLayers);
        }

    }, []); // Sadece ilk yüklemede çalışsın

    // Tüm çizim işlemlerini buraya topladık ki sıra şaşmasın.
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !routeData?.geometry?.coordinates || !selectedAtm) return;

        map.easeTo({ pitch: 60, bearing: 30 });

        const atmLat = Number(selectedAtm.latitude);
        const atmLon = Number(selectedAtm.longitude);

        addEmojiToMap(map, 'icon-user', '🚶');
        addEmojiToMap(map, 'icon-atm', '🏧');

        // A) 3D Binaları Ekle (Varsa önce kaldır kontrolü yapmıyoruz, varsa hata vermez mapbox genelde)
        if (!map.getLayer('3d-buildings')) {
            const layers = map.getStyle().layers;
            let labelLayerId;
            // Binaları yazıların (label) altına koymak için label layer id'sini bul
            for (const layer of layers || []) {
                if (layer.type === 'symbol' && layer.layout?.['text-field']) {
                    labelLayerId = layer.id;
                    break;
                }
            }

            map.addLayer({
                'id': '3d-buildings',
                'source': 'composite',
                'source-layer': 'building',
                'filter': ['==', 'extrude', 'true'],
                'type': 'fill-extrusion',
                'minzoom': 13, // DÜZELTME 1: Minzoom'u düşürdük (Uzaklaşınca kaybolmasın)
                'paint': {
                    'fill-extrusion-color': '#aaa', // Bina rengi

                    // DÜZELTME 2: Gelişmiş Yükseklik Formülü
                    'fill-extrusion-height': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        13, // Zoom 13'te yükseklik 0 olsun (yumuşak geçiş)
                        0,
                        13.05, // Zoom 13.05 olduğunda tam boyuta ulaşsın
                        ['*',
                            2, // Çarpan (3 kat büyüt)
                            ['coalesce', ['get', 'height'], 15] // EĞER YÜKSEKLİK YOKSA 15 METRE KABUL ET
                        ]
                    ],

                    'fill-extrusion-base': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        13,
                        0,
                        13.05,
                        ['get', 'min_height']
                    ],
                    'fill-extrusion-opacity': 1.0 // Opaklığı tam yaptık, silik durmasın
                }
            }, labelLayerId);
        }

        // B) Rota Çizgisini Ekle
        const routeSourceId = 'route-source';
        if (map.getSource(routeSourceId)) {
            (map.getSource(routeSourceId) as mapboxgl.GeoJSONSource).setData(routeData as any);
        } else {
            map.addSource(routeSourceId, { type: 'geojson', data: routeData as any });
            map.addLayer({
                id: 'route-layer',
                type: 'line',
                source: routeSourceId,
                layout: { 'line-join': 'round', 'line-cap': 'round' },
                paint: { 'line-color': '#bd0404', 'line-width': 7 } // Kırmızı rota
            });
        }

        // Bu sayede toDataURL() bunları görebilecek.
        // C) Markerları Ekleme Kısmı
        const pointsSourceId = 'points-source';
        const pointsData = {
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    properties: { title: 'Başlangıç', iconImageId: 'icon-user' },
                    geometry: { type: 'Point', coordinates: [userPosition.longitude, userPosition.latitude] }
                },
                {
                    type: 'Feature',
                    properties: { title: 'ATM', iconImageId: 'icon-atm' },
                    geometry: { type: 'Point', coordinates: [atmLon, atmLat] }
                }
            ]
        };

        if (map.getSource(pointsSourceId)) {
            (map.getSource(pointsSourceId) as mapboxgl.GeoJSONSource).setData(pointsData as any);
        } else {
            map.addSource(pointsSourceId, { type: 'geojson', data: pointsData as any });

            // KATMAN 1: EMOJİLER (İkon Görevi Görür)
            map.addLayer({
                id: 'points-icons',
                type: 'symbol',
                source: pointsSourceId,
                layout: {
                    'icon-image': ['get', 'iconImageId'], // text-field YERİNE icon-image
                    'icon-size': 0.7, // Boyut ayarı
                    'icon-allow-overlap': true,
                    'icon-ignore-placement': true
                }
            });

            // KATMAN 2: YAZILAR (Başlangıç, ATM)
            map.addLayer({
                id: 'points-labels',
                type: 'symbol',
                source: pointsSourceId,
                layout: {
                    'text-field': ['get', 'title'],
                    'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
                    'text-offset': [0, 1.5],
                    'text-anchor': 'top',
                    'text-size': 14
                },
                paint: {
                    'text-color': '#ffffff',
                    'text-halo-color': '#000000',
                    'text-halo-width': 2
                }
            });
        }

        // D) Kamera Ayarı (Hepsi bir arada)
        // fitBounds, pitch ve bearing'i aynı anda kabul eder.
        /*const bounds = new mapboxgl.LngLatBounds();
        routeData.geometry.coordinates.forEach((coord: number[]) => {
            bounds.extend([coord[0], coord[1]]);
        });

        map.fitBounds(bounds, {
            padding: { top: 100, bottom: 100, left: 100, right: 100 },
            pitch: 60,  // 3D etkisi için eğim
            bearing: 30, // Hafif çapraz açı 30
            zoom: 14.5,
            animate: false // Animasyon yok, direkt render olsun
        });*/

        console.log('✅ Rota, Binalar ve Markerlar (Layer) çizildi.');

        // E) Snapshot Tetikleyici
        // Harita idle olduğunda (yükleme bitince) çek
        map.once('idle', () => {
            setTimeout(() => {
                processSnapshot();
            }, 2500); // Idle olsa bile 3D binaların renderı için 2.5sn pay ver
        });

    }, [routeData]);

    // --- 6. Event Listener ---
    useEffect(() => {
        const handler = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            console.log('📩 Event Alındı:', detail);

            if (detail.userLatitude && detail.userLongitude) {
                setUserPosition({ latitude: detail.userLatitude, longitude: detail.userLongitude });
            }

            if (detail.atmId) {
                setSelectedAtm({
                    id: detail.atmId,
                    latitude: detail.latitude,
                    longitude: detail.longitude,
                    name: 'Hedef ATM'
                } as Atm);
            }
        };

        window.addEventListener('qr-request', handler as EventListener);
        return () => window.removeEventListener('qr-request', handler as EventListener);
    }, []);

    // --- 7. Tetikleyici ---
    /*useEffect(() => {
        if (routeData && mapRef.current) {
            // Rota çizildikten 2 saniye sonra fotoğrafı çekip indir
            const timer = setTimeout(() => {
                processSnapshot();
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [routeData]);*/

    return (
        <div
            ref={mapContainerRef}
            style={{
                position: 'fixed',
                left: '-9999px', // Ekran dışı
                top: '0',
                width: '1280px', // Çıktı genişliği
                height: '720px', // Çıktı yüksekliği
                visibility: 'visible'
            }}
        />
    );
};

export default PopUpMap;