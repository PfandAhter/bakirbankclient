export interface Coordinates {
    latitude: number;
    longitude: number;
}

export interface Atm {
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

export interface UserPosition {
    latitude: number;
    longitude: number;
}

export interface RouteData {
    geometry: {
        coordinates: [number, number][];
    };
    type?: string;
    properties?: any;
}

export interface RouteStep {
    instruction: string;
    distance: number;
    duration: number;
}

export interface MapViewState {
    latitude: number;
    longitude: number;
    zoom: number;
    pitch: number;
    bearing: number;
}

export interface MapCanvasHandle {
    handleStartAnimation: () => void;
    stopAnimation: () => void;
    clearRoute: () => void;
}