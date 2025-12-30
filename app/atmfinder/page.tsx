'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/src/hooks/login/useAuth';
//import { useATM } from '@/app/lib/hooks/useATM';

// Components
import ControlPanel from '@/src/components/ui/atm-finder/ControlPanel';
import MapLoadingScreen from "@/src/components/ui/atm-finder/MapLoadingScreen";
import MapCanvas from "@/src/components/ui/atm-finder/MapBoxPanel";
import RouteTypeSelector from "@/src/components/ui/atm-finder/RouteTypeSelector";
import DirectionsPanel from "@/src/components/ui/atm-finder/DirectionsPanel";
import MiniMapPanel from "@/src/components/ui/atm-finder/MiniMapPanel";
import SendMoneyPanel from "@/src/components/ui/atm-finder/SendMoneyPanel";
import { Header } from '@/src/components/ui/atm-finder/Header';
import { RetryModal } from '@/src/components/ui/atm-finder/RetryModal';
import { ActionFloatingButton } from '@/src/components/ui/atm-finder/ActionFloatingButton';


// Hooks & Types
import { useMapLogic } from '@/src/hooks/useMapLogic';
import { useRouteManager } from '@/src/hooks/useRouteManager';
import { useAtmFilters } from '@/src/hooks/useAtmFilters';
import { useATM } from '@/src/hooks/useAtm'
import { Atm, MapCanvasHandle } from '@/src/types/atm-map';
import ProtectedRoute from "../../src/providers/ProtectedRoute";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_API_KEY || '';

export default function AtmFinderPage() {
    // 1. Auth & Data Hooks
    const { user, isAuthenticated, logout } = useAuth();

    // ARTIK MANUEL FETCH YOK, HOOK VAR:
    const { atms, loading: atmLoading, error: atmError, refetch } = useATM();

    // 2. Custom Logic Hooks
    const mapLogic = useMapLogic();
    const routeManager = useRouteManager();
    const atmFilters = useAtmFilters(atms); // Hook'tan gelen 'atms' verisini buraya veriyoruz

    // 3. Page Local State
    const [selectedAtm, setSelectedAtm] = useState<Atm | null>(null);
    const [isSelectedAtmChanged, setIsSelectedAtmChanged] = useState(false);

    // Panel States
    const [isQrCodePanelOpen, setIsQrCodePanelOpen] = useState(false);
    const [isControlPanelDisabled, setIsControlPanelDisabled] = useState(false);
    const [isDirectionsPanelVisible, setIsDirectionsPanelVisible] = useState(false);
    const [isMinimapPanelVisible, setIsMinimapPanelVisible] = useState(false);
    const [isSendMoneyPanelOpen, setIsSendMoneyPanelOpen] = useState(false);
    const [sendButtonVisibility, setSendButtonVisibility] = useState(true);

    // Route & Animation States
    const [routeType, setRouteType] = useState('walking');
    const [selectedRouteType, setSelectedRouteType] = useState('walking');
    const [animationInProgress, setAnimationInProgress] = useState(false);
    const [animationProgress, setAnimationProgress] = useState(0);
    const [shouldStopAnimation, setShouldStopAnimation] = useState(false);
    const [followingRoute, setFollowingRoute] = useState(false);
    const [viewTPS, setViewTPS] = useState(false);

    const mapCanvasRef = useRef<MapCanvasHandle | null>(null);
    const animationRef = useRef(null);

    // ATM Selection Change Handler
    useEffect(() => {
        if (isSelectedAtmChanged) {
            setIsDirectionsPanelVisible(false);
            setIsMinimapPanelVisible(false);
            routeManager.clearRoute();
            if (animationInProgress) stopCalculatingRoute();
            setIsSelectedAtmChanged(false);

            if (selectedAtm?.status !== 'ACTIVE' || selectedAtm?.withdrawStatus !== 'ACTIVE') {
                setSendButtonVisibility(false);
            } else {
                setSendButtonVisibility(true);
            }
        }
    }, [isSelectedAtmChanged, animationInProgress]);

    const handleCalculateRoute = async () => {
        if (!mapLogic.userPosition || !selectedAtm || animationInProgress) return;

        setIsControlPanelDisabled(true);
        setIsDirectionsPanelVisible(true);
        setIsMinimapPanelVisible(true);

        const success = await routeManager.calculateRoute(mapLogic.userPosition, selectedAtm, routeType);

        if (success) {
            setTimeout(() => {
                setIsControlPanelDisabled(false);
                startAnimation();
            }, 100);
        } else {
            alert("Rota hesaplanamadı.");
            setIsDirectionsPanelVisible(false);
            setIsMinimapPanelVisible(false);
            setIsControlPanelDisabled(false);
        }
    };

    const startAnimation = useCallback(() => {
        if (mapCanvasRef.current?.handleStartAnimation) {
            mapCanvasRef.current.handleStartAnimation();
        }
    }, []);

    const stopCalculatingRoute = useCallback(() => {
        setShouldStopAnimation(true);
        setTimeout(() => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
            }
            setAnimationInProgress(false);
            setFollowingRoute(false);
            setViewTPS(false);
            setAnimationProgress(0);
            setShouldStopAnimation(false);
            if (mapCanvasRef.current?.stopAnimation) {
                mapCanvasRef.current.stopAnimation();
            }
        }, 100);
    }, []);

    // ... (cancelSelectedATM, searchLocation, changeRouteType fonksiyonları aynı kalır) ...
    const cancelSelectedATM = async () => {
        setSelectedAtm(null);
        setIsDirectionsPanelVisible(false);
        setIsMinimapPanelVisible(false);
        routeManager.setRouteData({ type: 'FeatureCollection', features: [] } as any);
        mapLogic.setViewState(prev => ({ ...prev, zoom: 16, pitch: 0, bearing: 0 }));
        if (mapCanvasRef.current?.clearRoute) mapCanvasRef.current.clearRoute();
    };

    const searchLocation = async () => {
        if (!atmFilters.searchText) return;
        try {
            const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${atmFilters.searchText}.json?access_token=${MAPBOX_TOKEN}&limit=1`);
            const data = await response.json();
            if (data.features && data.features.length > 0) {
                const [longitude, latitude] = data.features[0].center;
                mapLogic.setViewState({ ...mapLogic.viewState, longitude, latitude, zoom: 14 });
            }
        } catch (error) {
            console.error("Konum araması hatası:", error);
        }
    };

    const changeRouteType = (type: string) => {
        setRouteType(type);
        setSelectedRouteType(type);
    };

    if (!isAuthenticated) return <div>Yönlendiriliyor...</div>;

    // Hook'tan gelen loading durumunu kullanıyoruz
    if (atmLoading) return <MapLoadingScreen />;

    // Debug logging
    console.log('[AtmFinderPage] Render:', {
        atmsFromHook: atms?.length ?? 0,
        filteredAtms: atmFilters.filteredAtmLocations?.length ?? 0
    });

    return (
        <ProtectedRoute>
            <div className="relative w-screen h-screen overflow-hidden">
                <Header isAuthenticated={isAuthenticated} user={user} onLogout={logout || (() => { })} />

                <div className={`relative w-full h-full ${atmError ? 'blur-sm' : ''} min-h-[400px] sm:min-h-[600px]`}>
                    <div style={{ height: "100vh", width: "100%" }}>
                        <MapCanvas
                            ref={mapCanvasRef}
                            atms={atmFilters.filteredAtmLocations}
                            routeType={selectedRouteType}
                            isRouteCalculating={routeManager.isCalculatingRoute}
                            is3D={mapLogic.is3D}
                            onAtmSelect={setSelectedAtm}
                            animationRef={animationRef}
                            setAnimationInProgress={setAnimationInProgress}
                            setAnimationProgress={setAnimationProgress}
                            setFollowingRoute={setFollowingRoute}
                            setViewTPS={setViewTPS}
                            setViewState={mapLogic.setViewState}
                            viewState={mapLogic.viewState}
                            routeData={routeManager.routeData}
                            onCameraPositionChange={mapLogic.setCameraPosition}
                            setIsSelectedAtmChanged={setIsSelectedAtmChanged}
                            setUserPosition={mapLogic.setUserPosition}
                            shouldStopAnimation={shouldStopAnimation}
                            startAnimation={() => { }}
                        />
                    </div>

                    <DirectionsPanel
                        steps={routeManager.routeSteps}
                        isDirectionsPanelOpen={isDirectionsPanelVisible}
                    />

                    {animationInProgress && (
                        <MiniMapPanel
                            routeData={routeManager.routeData}
                            userPosition={mapLogic.userPosition}
                            selectedAtm={selectedAtm}
                            currentPosition={mapLogic.cameraPosition}
                            mapboxToken={MAPBOX_TOKEN}
                            processActive={isMinimapPanelVisible}
                        />
                    )}

                    <div className="fixed top-20 right-95 flex items-end gap-3 z-[1000]">
                        <SendMoneyPanel
                            isOpen={isSendMoneyPanelOpen}
                            togglePanel={() => { setIsSendMoneyPanelOpen(!isSendMoneyPanelOpen); setIsControlPanelDisabled(false); }}
                            selectedAtm={selectedAtm}
                            isAuthenticated={isAuthenticated}
                        />

                        <RouteTypeSelector
                            selectedRouteType={selectedRouteType}
                            onRouteTypeChange={changeRouteType}
                            disabled={animationInProgress}
                        />

                        <ControlPanel
                            viewTPS={viewTPS}
                            toggle3D={() => mapLogic.toggle3D(animationInProgress)}
                            is3D={mapLogic.is3D}
                            animationInProgress={animationInProgress}
                            bankNames={atmFilters.bankNames}
                            setBankNames={atmFilters.setBankNames}
                            bankOptions={atmFilters.bankOptions}
                            filterStatus={atmFilters.filterStatus}
                            setFilterStatus={atmFilters.setFilterStatus}
                            statusOptions={atmFilters.statusOptions}
                            filterDepositStatus={atmFilters.filterDepositStatus}
                            setFilterDepositStatus={atmFilters.setFilterDepositStatus}
                            depositOptions={atmFilters.depositOptions}
                            filterWithdrawStatus={atmFilters.filterWithdrawStatus}
                            setFilterWithdrawStatus={atmFilters.setFilterWithdrawStatus}
                            withdrawOptions={atmFilters.withdrawOptions}
                            isSendMoneyPanelOpen={isSendMoneyPanelOpen}
                            isControlPanelDisabled={isControlPanelDisabled}
                            cancelSelectedATM={cancelSelectedATM}
                            selectedAtm={selectedAtm}
                            sendButtonVisibility={sendButtonVisibility}
                            toggleQRCodePanel={() => { setIsQrCodePanelOpen(!isQrCodePanelOpen); setIsControlPanelDisabled(false); }}
                            toggleSendMoneyPanel={() => { setIsSendMoneyPanelOpen(!isSendMoneyPanelOpen); setIsControlPanelDisabled(false); }}
                            isControlPanelOpen={true}
                        />
                    </div>

                    {mapLogic.userPosition && selectedAtm && !isSendMoneyPanelOpen && !isQrCodePanelOpen && (
                        <ActionFloatingButton
                            isCalculating={routeManager.isCalculatingRoute}
                            animationInProgress={animationInProgress}
                            animationProgress={animationProgress}
                            onClick={animationInProgress ? stopCalculatingRoute : handleCalculateRoute}
                        />
                    )}
                </div>

                {/* Hata varsa Hook'tan gelen refetch fonksiyonunu kullanıyoruz */}
                {atmError && <RetryModal onRetry={refetch} />}
            </div>
        </ProtectedRoute>
    );
}