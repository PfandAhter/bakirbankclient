// app/types/RouteData.ts

export interface RouteData {
    type: 'Feature';
    properties: Record<string, any>; // Boş obje {} de olabilir ama Record daha esnektir
    geometry: {
        type: 'LineString'; // Rota her zaman bir çizgidir
        coordinates: number[][]; // [boylam, enlem][] dizisi
    };
}