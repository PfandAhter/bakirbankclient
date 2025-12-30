// services/HeadlessMapService.ts
import mapboxgl from 'mapbox-gl';

interface SnapshotOptions {
    userPosition: { latitude: number; longitude: number };
    atmPosition: { latitude: number; longitude: number };
    routeType: 'walking' | 'driving' | 'cycling';
}

export class HeadlessMapService {
    private container: HTMLDivElement | null = null;
    private map: mapboxgl.Map | null = null;
    private isInitialized = false;

    async initialize() {
        if (this.isInitialized) return;

        // Gizli container oluştur
        this.container = document.createElement('div');
        this.container.style.width = '1200px';
        this.container.style.height = '800px';
        this.container.style.position = 'fixed';
        this.container.style.left = '-9999px';
        this.container.style.top = '0';
        this.container.style.zIndex = '-1';
        this.container.style.pointerEvents = 'none';
        document.body.appendChild(this.container);

        // Mapbox başlat
        this.map = new mapboxgl.Map({
            container: this.container,
            style: 'mapbox://styles/mapbox/dark-v8',
            center: [0, 0],
            zoom: 14,
            preserveDrawingBuffer: true, // Screenshot için ZORUNLU
            renderWorldCopies: false,
        });

        // Map yüklenene kadar bekle
        await new Promise((resolve) => {
            this.map!.on('load', resolve);
        });

        this.isInitialized = true;
        console.log('Headless map initialized');
    }

    async generateRouteSnapshot(options: SnapshotOptions): Promise<string> {
        if (!this.map || !this.isInitialized) {
            await this.initialize();
        }

        const { userPosition, atmPosition, routeType } = options;

        try {
            // 1. Rota hesapla
            const routeData = await this.calculateRoute(userPosition, atmPosition, routeType);

            // 2. User marker ekle
            this.addUserMarker(userPosition, routeType);

            // 3. ATM marker ekle
            this.addAtmMarker(atmPosition);

            // 4. Rotayı haritaya ekle
            await this.addRouteToMap(routeData);

            // 5. 3D modu etkinleştir ve kamera pozisyonunu ayarla
            await this.setup3DView(routeData);

            // 6. Render tamamlanana kadar bekle
            await this.waitForIdle();

            // 7. Screenshot al
            const screenshot = this.takeScreenshot();

            // 8. Temizlik
            this.cleanup();

            return screenshot;
        } catch (error) {
            console.error('Error generating route snapshot:', error);
            this.cleanup();
            throw error;
        }
    }

    private async calculateRoute(
        start: { latitude: number; longitude: number },
        end: { latitude: number; longitude: number },
        type: string
    ) {
        const url = `https://api.mapbox.com/directions/v5/mapbox/${type}/` +
            `${start.longitude},${start.latitude};${end.longitude},${end.latitude}` +
            `?geometries=geojson&overview=full&steps=true&access_token=${mapboxgl.accessToken}`;

        const response = await fetch(url);
        const data = await response.json();

        if (!data.routes || data.routes.length === 0) {
            throw new Error('No route found');
        }

        return data.routes[0];
    }

    private addUserMarker(position: { latitude: number; longitude: number }, routeType: string) {
        const emoji = routeType === 'walking' ? '🚶' : routeType === 'driving' ? '🚗' : '🚴';

        const el = document.createElement('div');
        el.style.width = '40px';
        el.style.height = '40px';
        el.style.fontSize = '24px';
        el.style.display = 'flex';
        el.style.justifyContent = 'center';
        el.style.alignItems = 'center';
        el.textContent = emoji;

        new mapboxgl.Marker({ element: el, anchor: 'center' })
            .setLngLat([position.longitude, position.latitude])
            .addTo(this.map!);
    }

    private addAtmMarker(position: { latitude: number; longitude: number }) {
        const el = document.createElement('div');
        el.style.width = '32px';
        el.style.height = '32px';
        el.style.fontSize = '20px';
        el.style.display = 'flex';
        el.style.justifyContent = 'center';
        el.style.alignItems = 'center';
        el.textContent = '🏧';
        el.style.color = 'red';
        el.style.textShadow = '0 0 10px red';
        el.style.transform = 'scale(1.5)';

        new mapboxgl.Marker({ element: el })
            .setLngLat([position.longitude, position.latitude])
            .addTo(this.map!);
    }

    private async addRouteToMap(route: any) {
        if (!this.map) return;

        const routeGeoJson = {
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'LineString',
                coordinates: route.geometry.coordinates,
            },
        };

        this.map.addSource('route', {
            type: 'geojson',
            data: routeGeoJson as any,
        });

        this.map.addLayer({
            id: 'route-line',
            type: 'line',
            source: 'route',
            layout: {
                'line-join': 'round',
                'line-cap': 'round',
            },
            paint: {
                'line-color': '#bd0404',
                'line-width': 5,
            },
        });

        await this.waitForIdle();
    }

    private async setup3DView(route: any) {
        if (!this.map) return;

        const coordinates = route.geometry.coordinates;

        // 3D binalar ekle
        if (!this.map.getLayer('3d-buildings')) {
            this.map.addLayer({
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
            });
        }

        // Rotanın ortasındaki noktayı hesapla
        const midIndex = Math.floor(coordinates.length / 2);
        const midPoint = coordinates[midIndex];

        // Bearing hesapla (rotanın yönü)
        const bearing = this.calculateBearing(coordinates);

        // 3D kamera pozisyonu
        await new Promise<void>((resolve) => {
            this.map!.flyTo({
                center: midPoint,
                zoom: 16.5,
                pitch: 60,
                bearing: bearing,
                duration: 2000,
            });

            this.map!.once('moveend', () => resolve());
        });

        // Ekstra render süresi
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    private calculateBearing(coordinates: number[][]): number {
        const start = coordinates[0];
        const end = coordinates[coordinates.length - 1];

        const startLat = start[1] * Math.PI / 180;
        const startLng = start[0] * Math.PI / 180;
        const endLat = end[1] * Math.PI / 180;
        const endLng = end[0] * Math.PI / 180;

        const y = Math.sin(endLng - startLng) * Math.cos(endLat);
        const x = Math.cos(startLat) * Math.sin(endLat) -
            Math.sin(startLat) * Math.cos(endLat) * Math.cos(endLng - startLng);

        return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
    }

    private waitForIdle(): Promise<void> {
        return new Promise((resolve) => {
            this.map!.once('idle', () => resolve());
        });
    }

    private takeScreenshot(): string {
        if (!this.map) throw new Error('Map not initialized');

        const canvas = this.map.getCanvas();
        return canvas.toDataURL('image/png', 0.95); // 0.95 quality
    }

    private cleanup() {
        if (!this.map) return;

        // Layer'ları temizle
        if (this.map.getLayer('route-line')) this.map.removeLayer('route-line');
        if (this.map.getSource('route')) this.map.removeSource('route');
        if (this.map.getLayer('3d-buildings')) this.map.removeLayer('3d-buildings');

        // Marker'ları temizle (tüm marker'lar otomatik temizlenir map.remove ile)
    }

    destroy() {
        if (this.map) {
            this.map.remove();
            this.map = null;
        }
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
            this.container = null;
        }
        this.isInitialized = false;
    }
}

// Singleton instance
let headlessMapInstance: HeadlessMapService | null = null;

export function getHeadlessMapService(): HeadlessMapService {
    if (!headlessMapInstance) {
        headlessMapInstance = new HeadlessMapService();
    }
    return headlessMapInstance;
}