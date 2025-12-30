import { useCallback, useMemo, useRef } from 'react';

// Define proper types
interface Coordinates {
    longitude: number;
    latitude: number;
}

interface ViewState {
    longitude: number;
    latitude: number;
    zoom: number;
    pitch?: number;
    bearing?: number;
}

interface RouteGeometry {
    coordinates: [number, number][];
}

interface RouteData {
    geometry: RouteGeometry;
}

interface Point {
    0: number; // longitude
    1: number; // latitude
}

export interface UseTPSAnimationProps {
    routeData: RouteData | null;
    viewState: ViewState;
    setViewState: (viewState: ViewState) => void;
    setCameraPosition: (position: Coordinates) => void;
    setAnimationProgress: (progress: number) => void;
    setAnimationInProgress: (inProgress: boolean) => void;
    setFollowingRoute: (following: boolean) => void;
    setViewTPS: (tps: boolean) => void;
}

export const useTPSAnimation = ({
                                    routeData,
                                    viewState,
                                    setViewState,
                                    setCameraPosition,
                                    setAnimationProgress,
                                    setAnimationInProgress,
                                    setFollowingRoute,
                                    setViewTPS
                                }: UseTPSAnimationProps) => {
    const animationRef = useRef<number | null>(null);
    const lastFrameTimeRef = useRef<number | null>(null);
    const previousViewStateRef = useRef<ViewState | null>(null);
    const routeDataRef = useRef<RouteData | null>(null);

    const FRAME_INTERVAL = 1000 / 30; // 30 FPS

    const calculateBearing = useCallback((startPoint: Point, endPoint: Point): number => {
        const startLat = startPoint[1] * Math.PI / 180;
        const startLng = startPoint[0] * Math.PI / 180;
        const endLat = endPoint[1] * Math.PI / 180;
        const endLng = endPoint[0] * Math.PI / 180;

        const y = Math.sin(endLng - startLng) * Math.cos(endLat);
        const x = Math.cos(startLat) * Math.sin(endLat) -
            Math.sin(startLat) * Math.cos(endLat) * Math.cos(endLng - startLng);

        const bearing = Math.atan2(y, x) * 180 / Math.PI;
        return (bearing + 360) % 360;
    }, []);

    const easeInOutCubic = useCallback((t: number): number => {
        return t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }, []);

    const animatedRouteLayer = useMemo(() => ({
        id: 'animated-route',
        type: 'line',
        source: 'route',
        layout: {
            'line-join': 'round',
            'line-cap': 'round'
        },
        paint: {
            'line-color': '#FF5722',
            'line-width': 8,
            'line-opacity': 0.9,
            'line-gradient': [
                'interpolate',
                ['linear'],
                ['line-progress'],
                0, '#faff00',
                0.1, '#ff9900',
                0.3, '#ff5500',
                1, '#ff0000'
            ]
        }
    }), []);

    const routeLayer = useMemo(() => ({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
            'line-join': 'round',
            'line-cap': 'round'
        },
        paint: {
            'line-color': '#3887be',
            'line-width': 5,
            'line-opacity': 0.75
        }
    }), []);

    const startTPSAnimation = useCallback(() => {
        if (!routeData || !routeData.geometry?.coordinates || routeData.geometry.coordinates.length < 2) return;

        if (animationRef.current) cancelAnimationFrame(animationRef.current);

        setViewTPS(true);
        setFollowingRoute(true);
        previousViewStateRef.current = { ...viewState };
        setAnimationProgress(0);
        setAnimationInProgress(true);

        routeDataRef.current = routeData;
        const coordinates = routeData.geometry.coordinates;

        const animationDuration = 10000;
        const startTime = performance.now();
        lastFrameTimeRef.current = startTime;

        const firstPoint = coordinates[0];
        const secondPoint = coordinates[1];
        const initialBearing = calculateBearing(firstPoint, secondPoint);

        setCameraPosition({ longitude: firstPoint[0], latitude: firstPoint[1] });
        setViewState({
            longitude: firstPoint[0],
            latitude: firstPoint[1],
            zoom: 18,
            pitch: 60,
            bearing: initialBearing
        });

        let prevBearing = initialBearing;

        const animate = (timestamp: number): void => {
            if (lastFrameTimeRef.current !== null && timestamp - lastFrameTimeRef.current < FRAME_INTERVAL) {
                animationRef.current = requestAnimationFrame(animate);
                return;
            }

            lastFrameTimeRef.current = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / animationDuration, 1);
            setAnimationProgress(progress);

            if (!routeDataRef.current) return;

            const routeCoords = routeDataRef.current.geometry.coordinates;
            const pointIndex = Math.min(Math.floor(progress * (routeCoords.length - 1)), routeCoords.length - 2);

            const currentPoint = routeCoords[pointIndex];
            const nextPoint = routeCoords[pointIndex + 1];
            const segmentProgress = (progress * (routeCoords.length - 1)) - pointIndex;
            const easeSegmentProgress = easeInOutCubic(segmentProgress);

            const interpolatedLng = currentPoint[0] + (nextPoint[0] - currentPoint[0]) * easeSegmentProgress;
            const interpolatedLat = currentPoint[1] + (nextPoint[1] - currentPoint[1]) * easeSegmentProgress;

            const lookAheadIndex = Math.min(pointIndex + 2, routeCoords.length - 1);
            const lookAheadPoint = routeCoords[lookAheadIndex];
            const targetBearing = calculateBearing(currentPoint, lookAheadPoint);

            let bearingDiff = targetBearing - prevBearing;
            if (bearingDiff > 180) bearingDiff -= 360;
            if (bearingDiff < -180) bearingDiff += 360;

            const maxRotationPerFrame = 2.0;
            const smoothBearing = prevBearing + Math.max(
                -maxRotationPerFrame,
                Math.min(maxRotationPerFrame, bearingDiff * easeSegmentProgress)
            );

            prevBearing = smoothBearing;

            const updatedCameraPosition = {
                longitude: interpolatedLng,
                latitude: interpolatedLat
            };

            setCameraPosition(updatedCameraPosition);
            setViewState(Object.freeze({
                longitude: interpolatedLng,
                latitude: interpolatedLat,
                zoom: 18,
                pitch: 60,
                bearing: smoothBearing
            }));

            if (progress < 1) {
                animationRef.current = requestAnimationFrame(animate);
            } else {
                setAnimationInProgress(false);
                setFollowingRoute(false);
                setViewTPS(false);
                setTimeout(() => {
                    if (previousViewStateRef.current) {
                        setViewState({
                            ...previousViewStateRef.current,
                            zoom: previousViewStateRef.current.zoom < 15 ? 15 : previousViewStateRef.current.zoom,
                        });
                    }
                }, 1000);
            }
        };

        animationRef.current = requestAnimationFrame(animate);
    }, [routeData, viewState, calculateBearing, easeInOutCubic, setCameraPosition, setAnimationProgress, setAnimationInProgress, setFollowingRoute, setViewState, setViewTPS]);

    const stopTPSAnimation = useCallback(() => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }
        setAnimationInProgress(false);
        setFollowingRoute(false);
        setViewTPS(false);
        setAnimationProgress(0);

        if (previousViewStateRef.current) {
            setViewState(previousViewStateRef.current);
            previousViewStateRef.current = null;
        }
    }, [setAnimationInProgress, setFollowingRoute, setViewTPS, setAnimationProgress, setViewState]);

    return {
        startTPSAnimation,
        stopTPSAnimation,
        routeLayer,
        animatedRouteLayer
    };
};