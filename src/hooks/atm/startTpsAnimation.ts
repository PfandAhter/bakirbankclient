// startTPSAnimation.ts
import {MutableRefObject} from "react";
import mapboxgl from "mapbox-gl";

export interface Coordinates {
    latitude: number;
    longitude: number;
}

interface StartTPSAnimationParams {
    routeData: any;
    viewState: any;
    setViewState: (view: any) => void;
    setViewTPS: (value: boolean) => void;
    setFollowingRoute: (value: boolean) => void;
    setAnimationProgress: (value: number) => void;
    setAnimationProgressRef: MutableRefObject<number | null>;
    setAnimationInProgress: (value: boolean) => void;
    setCameraPosition: (coords: Coordinates) => void;

    animationRef: MutableRefObject<number | null>;
    routeDataRef: MutableRefObject<any>;
    previousViewStateRef: MutableRefObject<any>;
    lastFrameTimeRef: MutableRefObject<number>;

    mapRef: MutableRefObject<mapboxgl.Map | null>;
    userMarkerRef: MutableRefObject<mapboxgl.Marker | null>;
    userPosition: Coordinates | null;

    shouldStopAnimation?: boolean;
    onAnimationStopped?: () => void;
}

export const startTPSAnimation = ({
                                      routeData,
                                      viewState,
                                      setViewState,
                                      setViewTPS,
                                      setFollowingRoute,
                                      setAnimationProgress,
                                      setAnimationProgressRef,
                                      setAnimationInProgress,
                                      setCameraPosition,
                                      animationRef,
                                      routeDataRef,
                                      previousViewStateRef,
                                      lastFrameTimeRef,
                                      mapRef,
                                      userMarkerRef,
                                      userPosition,
                                      shouldStopAnimation,
                                      onAnimationStopped
                                  }: StartTPSAnimationParams) => {

    if (!routeData?.geometry?.coordinates || routeData.geometry.coordinates.length < 2) return;

    // Önceki animation varsa iptal et
    if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
    }

    const ANIMATION_FPS = 60;
    const FRAME_INTERVAL = 1000 / ANIMATION_FPS;
    const animationDuration = 10000; // ms

    const coordinates = routeData.geometry.coordinates;
    const startTime = performance.now();
    lastFrameTimeRef.current = startTime;

    let smoothBearing = 0;
    let interpolatedLng = coordinates[0][0];
    let interpolatedLat = coordinates[0][1];

    const firstPoint = coordinates[0];
    const secondPoint = coordinates[1];

    setViewTPS(true);
    setFollowingRoute(true);
    previousViewStateRef.current = {...viewState};
    setAnimationProgress(0);
    setAnimationInProgress(true);
    routeDataRef.current = routeData;

    let prevBearing = calculateBearing(firstPoint, secondPoint);

    // ÖNEMLİ DEĞİŞİKLİK: Kamera pozisyonunu local değişken olarak tut
    let lastCameraPosition: Coordinates | null = null;

    // Ease function
    const easeInOutCubic = (t: number) =>
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    function calculateBearing(startPoint: [number, number], endPoint: [number, number]) {
        const startLat = (startPoint[1] * Math.PI) / 180;
        const startLng = (startPoint[0] * Math.PI) / 180;
        const endLat = (endPoint[1] * Math.PI) / 180;
        const endLng = (endPoint[0] * Math.PI) / 180;

        const y = Math.sin(endLng - startLng) * Math.cos(endLat);
        const x = Math.cos(startLat) * Math.sin(endLat) - Math.sin(startLat) * Math.cos(endLat) * Math.cos(endLng - startLng);

        let bearing = (Math.atan2(y, x) * 180) / Math.PI;
        return (bearing + 360) % 360;
    }

    const stopAnimation = () => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
        setAnimationInProgress(false);
        setFollowingRoute(false);
        setViewTPS(false);
        setAnimationProgress(0);

        // Kullanıcı marker pozisyonunu eski haline getir
        if (userMarkerRef?.current && userPosition) {
            userMarkerRef.current.setLngLat([userPosition.longitude, userPosition.latitude]);
        }

        // Map viewState reset
        if (previousViewStateRef.current) {
            setViewState(previousViewStateRef.current);
            previousViewStateRef.current = null;
        }

        if (onAnimationStopped) onAnimationStopped();
    };

    const prepareCameraPosition = (bearing?: number, lng?: number, lat?: number) => {
        if (mapRef.current) {
            const centerLng = lng ?? firstPoint[0];
            const centerLat = lat ?? firstPoint[1];
            const cameraBearing = bearing ?? prevBearing;

            mapRef.current.easeTo({
                center: [centerLng, centerLat],
                zoom: 18,
                pitch: 60,
                bearing: cameraBearing,
                duration: 1000
            });
        }
    }

    const setViewStateAfterAnimation = () => {
        setAnimationInProgress(false);
        setFollowingRoute(false);
        setViewTPS(false);
        if (userMarkerRef?.current && userPosition) {
            userMarkerRef.current.setLngLat([userPosition.longitude, userPosition.latitude]);
        }
        setTimeout(() => {
            if (previousViewStateRef.current) {
                setViewState({
                    ...previousViewStateRef.current,
                    zoom: previousViewStateRef.current.zoom < 15 ? 15 :
                        previousViewStateRef.current.zoom,
                });
            }
            // ➡️ Rotayı kapsayacak şekilde ortala
            if (routeDataRef.current?.geometry?.coordinates) {
                const bounds = new mapboxgl.LngLatBounds();
                routeDataRef.current.geometry.coordinates.forEach((coord: [number, number]) => {
                    bounds.extend(coord);
                });

                mapRef.current?.fitBounds(bounds,
                    {
                        padding: 300,
                        pitch: 60,
                        bearing: 30,
                        duration: 2000,
                        zoom:16
                    });
            }
        }, 1000);
    }

    const animate = (timestamp: number) => {
        if (timestamp - lastFrameTimeRef.current < FRAME_INTERVAL) {
            animationRef.current = requestAnimationFrame(animate);
            return;
        }
        lastFrameTimeRef.current = timestamp;

        if (shouldStopAnimation) {
            stopAnimation();
            return;
        }

        const elapsed = timestamp - startTime;
        let progress = Math.min(elapsed / animationDuration, 1);

        const roundedProgress = Math.round(progress * 100);
        if (setAnimationProgressRef.current !== roundedProgress) {
            setAnimationProgressRef.current = roundedProgress;
            setAnimationProgress(roundedProgress / 100);
        }

        // Route interpolation
        const pointIndex = Math.min(Math.floor(progress * (coordinates.length - 1)), coordinates.length - 2);
        const currentPoint = coordinates[pointIndex];
        const nextPoint = coordinates[pointIndex + 1];
        const segmentProgress = (progress * (coordinates.length - 1)) - pointIndex;
        const easeSegmentProgress = easeInOutCubic(segmentProgress);

        interpolatedLng = currentPoint[0] + (nextPoint[0] - currentPoint[0]) * easeSegmentProgress;
        interpolatedLat = currentPoint[1] + (nextPoint[1] - currentPoint[1]) * easeSegmentProgress;

        const lookAheadIndex = Math.min(pointIndex + 2, coordinates.length - 1);
        const lookAheadPoint = coordinates[lookAheadIndex];
        const targetBearing = calculateBearing(currentPoint, lookAheadPoint);

        let bearingDiff = targetBearing - prevBearing;
        if (bearingDiff > 180) bearingDiff -= 360;
        if (bearingDiff < -180) bearingDiff += 360;

        const maxRotationPerFrame = 3.5;
        smoothBearing = prevBearing + Math.max(-maxRotationPerFrame, Math.min(maxRotationPerFrame, bearingDiff * easeSegmentProgress));
        prevBearing = smoothBearing;

        // ÖNEMLİ DEĞİŞİKLİK: Pozisyon değişikliğini daha hassas kontrol et
        const updatedCameraPosition = {
            longitude: parseFloat(interpolatedLng.toFixed(6)),
            latitude: parseFloat(interpolatedLat.toFixed(6))
        };

        const shouldUpdateCamera = !lastCameraPosition ||
            Math.abs(lastCameraPosition.latitude - updatedCameraPosition.latitude) > 0.000001 ||
            Math.abs(lastCameraPosition.longitude - updatedCameraPosition.longitude) > 0.000001;

        if (shouldUpdateCamera) {
            lastCameraPosition = updatedCameraPosition;
            setCameraPosition(updatedCameraPosition);
        }

        const newViewState = {
            longitude: interpolatedLng,
            latitude: interpolatedLat,
            zoom: 18,
            pitch: 60,
            bearing: smoothBearing
        };

        setViewState(prev => {
            if (prev.longitude === newViewState.longitude &&
                prev.latitude === newViewState.latitude &&
                prev.bearing === newViewState.bearing) {
                return prev;
            }
            return newViewState;
        });

        // Marker ve harita
        if (userMarkerRef?.current) userMarkerRef.current.setLngLat([interpolatedLng, interpolatedLat]);
        if (mapRef.current) {
            mapRef.current.jumpTo({
                center: [interpolatedLng, interpolatedLat],
                zoom: newViewState.zoom,
                pitch: newViewState.pitch,
                bearing: newViewState.bearing
            });
        }

        if (progress < 1) {
            animationRef.current = requestAnimationFrame(animate);
        } else {
            stopAnimation();
            setViewStateAfterAnimation();
        }
    };

    prepareCameraPosition(smoothBearing, interpolatedLng, interpolatedLat);

    setTimeout(() =>{
        animationRef.current = requestAnimationFrame(animate);
    },1000);
}

export function setViewStateAfterAnimationUtil({
                                                   setAnimationInProgress,
                                                   setFollowingRoute,
                                                   setViewTPS,
                                                   userMarkerRef,
                                                   userPosition,
                                                   previousViewStateRef,
                                                   setViewState,
                                                   routeDataRef,
                                                   mapRef
                                               }: {
    setAnimationInProgress: (v: boolean) => void;
    setFollowingRoute: (v: boolean) => void;
    setViewTPS: (v: boolean) => void;
    userMarkerRef: MutableRefObject<mapboxgl.Marker | null>;
    userPosition: Coordinates | null;
    previousViewStateRef: MutableRefObject<any>;
    setViewState: (view: any) => void;
    routeDataRef: MutableRefObject<any>;
    mapRef: MutableRefObject<mapboxgl.Map | null>;
}) {
    setAnimationInProgress(false);
    setFollowingRoute(false);
    setViewTPS(false);
    if (userMarkerRef?.current && userPosition) {
        userMarkerRef.current.setLngLat([userPosition.longitude, userPosition.latitude]);
    }
    setTimeout(() => {
        if (previousViewStateRef.current) {
            setViewState({
                ...previousViewStateRef.current,
                zoom: previousViewStateRef.current.zoom < 15 ? 15 : previousViewStateRef.current.zoom,
            });
        }
        if (routeDataRef.current?.geometry?.coordinates) {
            const bounds = new mapboxgl.LngLatBounds();
            routeDataRef.current.geometry.coordinates.forEach((coord: [number, number]) => {
                bounds.extend(coord);
            });
            mapRef.current?.fitBounds(bounds, {
                padding: 300,
                pitch: 60,
                bearing: 30,
                duration: 2000
            });
        }
    }, 1000);
}