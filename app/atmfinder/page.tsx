'use client';

import {useState, useEffect, useRef, useCallback, useMemo} from 'react';
import {useAuth} from '@/app/lib/hooks/useAuth';
import {useRouter} from "next/navigation";

import AtmFinderContent from '@/app/components/atmui/AtmFinderContent';
import {useMapView} from '@/app/lib/hooks/useMapView';
import {addCustomIconsAndImagesToMap} from "@/app/lib/atm/customIconsAndImageAdd";
import {fetchAtmLocations} from '@/app/lib/atm/getAtmLocations';
import {useTPSAnimation} from '@/app/lib/hooks/useTPSAnimation';
import ControlPanel from '@/app/components/atmui/ControlPanel';
import {useATM} from '@/app/lib/hooks/useATM';
import {BarChart3, Landmark, LogOut, RefreshCw, User} from "lucide-react";
import NotificationPanel from "@/app/components/atmui/NotificationPanel";

import MapLoadingScreen from "@/app/lib/loadingScreen/MapLoadingScreen";
import axios from "axios";


import dynamic from "next/dynamic";

import {TripsLayer} from "@deck.gl/geo-layers";
import {Map, DraggableControl} from "react-map-gl";
import DeckGL from "@deck.gl/react";
import MapCanvas from "@/app/maptestv2/page";
import RouteTypeSelector from "@/app/components/atmui/RouteTypeSelector";


// Define types

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

interface UserPosition {
    latitude: number;
    longitude: number;
}

interface RouteData {
    geometry: {
        coordinates: [number, number][];
    };
}

interface RouteStep {
    instruction: string;
    distance: number;
    duration: number;
}


const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN || "pk.eyJ1IjoicGZhbmQwMCIsImEiOiJjbTlrMWV3eDYwYm1pMnZzYjVsdGJiYjllIn0.DMGe0r4wr1B7051y5Z5-Yw";

export default function AtmFinderPage() {

    const router = useRouter();
    const {atms, loading, error, updateATM} = useATM();
    const {user, isAuthenticated, checkAuth, logout} = useAuth();
    const [isLoading, setIsLoading] = useState(true);

    const [viewState, setViewState] = useState({
        latitude: 38.024050,
        longitude: 32.510783,
        zoom: 14,
        pitch: 0,
        bearing: 0,
    });

    //ATM Finder State
    const [bankOptions, setBankOptions] = useState([]);
    const [statusOptions, setStatusOptions] = useState([]);
    const [depositOptions, setDepositOptions] = useState([]);
    const [withdrawOptions, setWithdrawOptions] = useState([]);
    const [bankNames, setBankNames] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterDepositStatus, setFilterDepositStatus] = useState('all');
    const [filterWithdrawStatus, setFilterWithdrawStatus] = useState('all');
    const [searchText, setSearchText] = useState('');
    const [selectedAtm, setSelectedAtm] = useState<Atm | null>(null);

    const [routeType, setRouteType] = useState('walking');
    const [selectedRouteType, setSelectedRouteType] = useState('walking');

    const [atmLocations, setAtmLocations] = useState([]);
    //Panel states
    const [isQrCodePanelOpen, setIsQrCodePanelOpen] = useState(false);
    const [isControlPanelDisabled, setIsControlPanelDisabled] = useState(false);
    const [directionsPanelVisible, setDirectionsPanelVisible] = useState(false);
    const [sendButtonVisibility, setSendButtonVisibility] = useState(true);

    const [isSendMoneyPanelOpen, setIsSendMoneyPanelOpen] = useState(false);
    const [showRetryModal, setShowRetryModal] = useState(false);
    const [userPosition, setUserPosition] = useState<UserPosition>({latitude: 37.0119798, longitude: 37.3555935});
    const [animationInProgress, setAnimationInProgress] = useState(false);
    const [animationProgress, setAnimationProgress] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [routeData, setRouteData] = useState(null);
    const [followingRoute, setFollowingRoute] = useState(false);
    const [viewTPS, setViewTPS] = useState(false);
    const [is3D, setIs3D] = useState(false);
    const mapRef = useRef(null);
    const animationRef = useRef(null);

    // State declarations
    /*const [atmLocations, setAtmLocations] = useState<AtmLocation[]>([]);
    const [userPosition, setUserPosition] = useState<UserPosition | null>(null);
    const [selectedAtm, setSelectedAtm] = useState<AtmLocation | null>(null);
    const [routeData, setRouteData] = useState<RouteData | null>(null);
    const [routeSteps, setRouteSteps] = useState<RouteStep[]>([]);
    const [animationInProgress, setAnimationInProgress] = useState(false);
    const [animationProgress, setAnimationProgress] = useState(0);
    const [followingRoute, setFollowingRoute] = useState(false);
    const [viewTPS, setViewTPS] = useState(false);
    const [directionsPanelVisible, setDirectionsPanelVisible] = useState(false);
    const [isQrCodePanelOpen, setIsQrCodePanelOpen] = useState(false);
    const [isSendMoneyPanelOpen, setIsSendMoneyPanelOpen] = useState(false);
    const [showRetryModal, setShowRetryModal] = useState(false);
    const [qrImageData, setQrImageData] = useState<string>('');

    const [isDragging, setIsDragging] = useState(false);
    const [is3D, setIs3D] = useState(false);

    const [isControlPaneDisabled] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [bankNames, setBankNames] = useState('all');
    const [bankOptions] = useState(['Bank 1', 'Bank 2', 'Bank 3']);
    const [filterStatus, setFilterStatus] = useState('all');
    const [statusOptions] = useState(['Active', 'Inactive']);
    const [filterDepositStatus, setFilterDepositStatus] = useState('all');
    const [depositOptions] = useState(['Available', 'Unavailable']);
    const [filterWithdrawStatus, setFilterWithdrawStatus] = useState('all');
    const [withdrawOptions] = useState(['Available', 'Unavailable']);
    const [selectedRouteType, setSelectedRouteType] = useState('walking');
    const [sendButtonVisibility] = useState(true);

    const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

    const {
        viewState,
        setViewState,
        cameraPosition,
        setCameraPosition,
        mapRef
    } = useMapView();

    const {
        startTPSAnimation,
        stopTPSAnimation,
        routeLayer,
        animatedRouteLayer
    } = useTPSAnimation({
        routeData,
        viewState,
        setViewState: (newViewState) => setViewState(newViewState),
        setCameraPosition: (position) => setCameraPosition(position),
        setAnimationProgress,
        setAnimationInProgress,
        setFollowingRoute,
        setViewTPS
    });

    const handleSourceData = (e: any) => {
        const source = e.source;
        if (!source) return;

        if (source.id === 'composite' && source.type === 'vector') {
            const terrainSourceExists = mapRef.current?.getSource('mapbox-dem');
            const buildingLayerExists = mapRef.current?.getLayer('3d-buildings');

            if (!terrainSourceExists) {
                console.warn('3D terrain için gerekli "mapbox-dem" kaynağı bulunamadı.');
            }
            if (!buildingLayerExists) {
                console.warn('3D bina katmanı yüklenmedi veya eksik.');
            }
        }
    };


    const toggleQrCodePanel = () => {
        setIsQrCodePanelOpen(!isQrCodePanelOpen);
    };

    const toggleSendMoneyPanel = () => {
        setIsSendMoneyPanelOpen(!isSendMoneyPanelOpen);
    };

    const toggle3D = () => {
        // Implementation for 3D toggle
        console.log('Toggle 3D');
    };

    const changeRouteType = (type: string) => {
        setSelectedRouteType(type);
    };

    useEffect(() => {
        getAtmLocations();
        addCustomIconsAndImagesToMap(null, [], null);
    }, []);*/



    useEffect(() => {
        getStatusOptions();

        setTimeout(() => {
            setIsLoading(false);
        }, 3000);
    }, []);

    const toggle3D = useCallback(() => {
        // Eğer rota animasyonu devam ediyorsa işlem yapma
        if (animationInProgress) return;

        if (!is3D) {
            setViewState(prev => ({
                ...prev,
                pitch: 60,
                bearing: 30,
                zoom: prev.zoom < 15 ? 15 : prev.zoom, // En az 15 zoom seviyesi
            }));
        } else {
            setViewState(prev => ({
                ...prev,
                pitch: 0,
                bearing: 0,
            }));
        }
        setIs3D(prev => !prev);
    }, [is3D, animationInProgress]);

    const routeSource = useMemo(() => ({
        type: 'geojson',
        data: routeData, // routeData değişkeninin tanımlı olduğundan emin olun
        lineMetrics: true // Bu kısım önemli - gradient için gerekli
    }), [routeData]);

    const filteredAtmLocations = useMemo(() => {
        return atmLocations.filter((atm: any) => {
            const banksStatus =
                bankNames === 'all' || atm.name?.toUpperCase() === bankNames.toUpperCase();
            const matchesStatus =
                filterStatus === 'all' || atm.status?.toUpperCase() === filterStatus;
            const matchesDeposit =
                filterDepositStatus === 'all' || atm.depositStatus?.toUpperCase() === filterDepositStatus;
            const matchesWithdraw =
                filterWithdrawStatus === 'all' || atm.withdrawStatus?.toUpperCase() === filterWithdrawStatus;
            return banksStatus && matchesStatus && matchesDeposit && matchesWithdraw;
        });
    }, [atmLocations, bankNames, filterStatus, filterDepositStatus, filterWithdrawStatus]);


    const toggleSendMoneyPanel = () => {
        setIsSendMoneyPanelOpen(!isSendMoneyPanelOpen);

        setIsControlPanelDisabled(false); // Panel açıldığında kontrol panelini etkinleştir
    };

    const toggleQRCodePanel = () => {
        setIsQrCodePanelOpen(!isQrCodePanelOpen);

        setIsControlPanelDisabled(false); // Panel açıldığında kontrol panelini etkinleştir
    };

    const cancelSelectedATM = async () => {
        setSelectedAtm(null);
        setDirectionsPanelVisible(false);

        // Yol bilgisini boş bir FeatureCollection yap
        setRouteData({
            type: 'FeatureCollection',
            features: []
        });

        setViewState(prev => ({
            ...prev,
            zoom: 16,
            pitch: 0,
            bearing: 0,
        }));
    };

    const searchLocation = async () => {
        if (!searchText) return;

        try {
            const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${searchText}.json?access_token=${MAPBOX_TOKEN}&limit=1`);
            const data = await response.json();

            if (data.features && data.features.length > 0) {
                const [longitude, latitude] = data.features[0].center;
                setViewState({
                    ...viewState,
                    longitude,
                    latitude,
                    zoom: 14
                });
            }
        } catch (error) {
            console.error("Konum araması sırasında hata:", error);
        }
    };

    const handleSourceData = (e: any) => {
        const source = e.source as { id?: string; type?: string };
        if (!source) return;

        // Only proceed if "composite" source and "vector" type
        if (source.id === 'composite' && source.type === 'vector') {
            const terrainSourceExists = (mapRef.current as any)?.getSource('mapbox-dem');
            const buildingLayerExists = (mapRef.current as any)?.getLayer('3d-buildings');

            if (!terrainSourceExists) {
                console.warn('Required "mapbox-dem" source for 3D terrain not found.');
            }
            if (!buildingLayerExists) {
                console.warn('3D building layer not loaded or missing.');
            }
        }
    };

    const changeRouteType = (type: string) => {
        setRouteType(type);
        setSelectedRouteType(type); // Seçili butonu güncelle
    }

    const getStatusOptions = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/v1/atm/get-statuses');

            if (response.status === 200) {
                const data = response.data;
                debugger;
                setBankOptions(data.banks || []);
                setStatusOptions(data.statuses || []);
                setWithdrawOptions(data.withdrawStatuses || []);
                setDepositOptions(data.depositStatuses || [])

            } else {
                console.error("Status options alınamadı: Geçersiz yanıt durumu.");
            }

        } catch (error) {
            console.error("Status options alınamadı:", error);
        }
    }

    const renderMarkersAsGeoJSON = useMemo(() => {
        const atmFeatures = filteredAtmLocations.map((atm: Atm) => ({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [atm.longitude, atm.latitude],
            },
            properties: {
                id: atm.id,
                icon: 'atm-icon', // ATM ikonu
            },
        }));

        const userFeature = userPosition
            ? {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [userPosition.longitude, userPosition.latitude],
                },
                properties: {
                    id: 'user',
                    icon: 'user-icon', // Kullanıcı ikonu
                },
            }
            : null;
        console.log("TEST USER LATITUDE", userPosition.latitude);
        console.log("TEST USER LONGITUDE", userPosition.longitude);


        return {
            type: 'FeatureCollection',
            features: userFeature ? [...atmFeatures, userFeature] : atmFeatures,
        };
    }, [filteredAtmLocations, userPosition]);


    const tripsData = useMemo(
        () => [
            {
                path: [
                    [29.0, 41.0],
                    [29.05, 41.02],
                    [29.1, 41.03],
                ],
                timestamps: [0, 100, 200],
            },
        ],
        []
    );

    // 🔹 TripsLayer (3D yol animasyonu)
    const tripsLayer = new TripsLayer({
        id: "trips",
        data: tripsData,
        getPath: d => d.path,
        getTimestamps: d => d.timestamps,
        getColor: [253, 128, 93],
        opacity: 0.8,
        widthMinPixels: 4,
        trailLength: 180,
        currentTime: (Date.now() / 100) % 200,
    });

    if (!isAuthenticated) {
        return (
            <div
                className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
                <div className="text-white">Yönlendiriliyor...</div>
            </div>
        );
    }

    if (isLoading) {
        return <MapLoadingScreen/>;
    }

    return (
        <div className="relative w-screen h-screen overflow-hidden">

            <header className="bg-black border-b border-gray-800">
                <div className="w-full"> {/*max-w-7xl mx-auto px-4 sm:px-6 lg:px-8*/}
                    <div className="flex justify-between items-center h-16 px-4">

                        <div className="flex items-center pl-70">
                            <button
                                onClick={() => router.push('/')}
                                className="flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                            >
                                <Landmark className="h-8 w-8 text-blue-400 hover:text-blue-300"/>
                                <span className="ml-2 text-2xl font-bold text-white hover:text-blue-300">BAKIRBANK</span>
                            </button>
                        </div>

                        <div className="flex items-center space-x-4">
                            {isAuthenticated ? (
                                <div className="flex items-center justify-end w-full space-x-4">
                                    <div className="flex items-center space-x-4">
                                        <NotificationPanel userId={"testUSERIDYERI"} position={{
                                            top: '3%',
                                            left: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            position: 'absolute'
                                        }}
                                        dropDirection={"center"}/>
                                    </div>

                                    <div className={"flex items-center gap-60 pr-5"}>
                                        {/* Kullanıcı bilgileri */}
                                        <div className="flex items-center space-x-3">
                                            <div
                                                className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                                <User className="w-5 h-5 text-white"/>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-white font-medium">{"ATABERK TEST"}</p>
                                                <p className="text-gray-400 text-sm">{"USEER.EMAIL TEST"}</p>
                                            </div>
                                        </div>

                                        {/* Çıkış butonu */}
                                        <button
                                            onClick={() => {
                                            }} //handleLogout
                                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ml-auto"
                                        >
                                            <LogOut className="w-4 h-4"/>
                                            <span>Çıkış</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-x-2">
                                    <button
                                        onClick={() => router.push('/sign-in')}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                                    >
                                        Giriş Yap
                                    </button>
                                    <button
                                        onClick={() => router.push('/sign-up')}
                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                                    >
                                    Kayıt Ol
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <div
                //ref={mapContainerRef}
                className={`relative w-full h-full ${showRetryModal ? 'blur-sm pointer-events-none' : ''} min-h-[400px] sm:min-h-[600px]`}
            >

                <div style={{height: "100vh", width: "100%"}}>
                    <MapCanvas
                        routeType={selectedRouteType}
                        is3D={is3D}
                        onAtmSelect={setSelectedAtm}
                    />
                </div>


                {/*<AtmFinderContent
                    directionsPanelVisible={directionsPanelVisible}
                    isQrCodePanelOpen={isQrCodePanelOpen}
                    routeSteps={routeSteps}
                    toggleQrCodePanel={toggleQrCodePanel}
                    atmLocations={atmLocations}
                    setUserPosition={setUserPosition}
                    setSelectedAtm={setSelectedAtm}
                    calculateRoute={calculateRoute}
                    qrImageData={qrImageData}
                    animationInProgress={animationInProgress}
                    routeData={routeData}
                    userPosition={userPosition}
                    selectedAtm={selectedAtm}
                    cameraPosition={cameraPosition}
                    MAPBOX_TOKEN={MAPBOX_TOKEN}
                    isSendMoneyPanelOpen={isSendMoneyPanelOpen}
                    toggleSendMoneyPanel={toggleSendMoneyPanel}
                />*/}

                <div className="fixed top-20 right-95 flex items-end gap-3 z-[1000]">

                    <RouteTypeSelector
                        selectedRouteType={selectedRouteType}
                        onRouteTypeChange={changeRouteType}
                        disabled={animationInProgress}
                    />

                    <ControlPanel
                        viewTPS={viewTPS}
                        showRetryModal={showRetryModal}
                        animationInProgress={animationInProgress}
                        toggle3D={toggle3D}
                        is3D={is3D}
                        bankNames={bankNames}
                        bankOptions={bankOptions}
                        filterStatus={filterStatus}
                        filterDepositStatus={filterDepositStatus}
                        filterWithdrawStatus={filterWithdrawStatus}
                        setBankNames={setBankNames}
                        searchText={searchText}
                        setSearchText={setSearchText}
                        searchLocation={searchLocation}
                        setFilterStatus={setFilterStatus}
                        setFilterDepositStatus={setFilterDepositStatus}
                        setFilterWithdrawStatus={setFilterWithdrawStatus}
                        isSendMoneyPanelOpen={isSendMoneyPanelOpen}
                        isControlPanelDisabled={isControlPanelDisabled}
                        cancelSelectedATM={cancelSelectedATM}
                        selectedAtm={selectedAtm}
                        statusOptions={statusOptions}
                        depositOptions={depositOptions}
                        withdrawOptions={withdrawOptions}
                        sendButtonVisibility={sendButtonVisibility}
                        changeRouteType={changeRouteType}
                        selectedRouteType={selectedRouteType}
                        toggleQRCodePanel={toggleQRCodePanel}
                        toggleSendMoneyPanel={toggleSendMoneyPanel}
                        isControlPanelOpen={true}
                    />
                </div>


                {userPosition && selectedAtm && !isSendMoneyPanelOpen && !isQrCodePanelOpen && ( //userPosition && selectedAtm && !isSendMoneyPanelOpen && !isQrCodePanelOpen &&
                    <button
                        //onClick={animationInProgress ? stopTPSAnimation : () => calculateRoute(false)}
                        disabled={false} // isCalculatingRoute should be defined in your state
                        className={`
                          fixed bottom-10 left-1/2 -translate-x-1/2
                          px-6 py-3 w-72 h-14
                          text-white text-lg font-semibold
                          rounded-full shadow-lg z-[1000]
                          ${animationInProgress ? '' : 'bg-[#082c30] hover:bg-black'}
                          disabled:bg-gray-300 disabled:cursor-not-allowed
                          transition-all duration-300 ease-in-out
                        `}
                        style={{
                            background: animationInProgress
                                ? `linear-gradient(to right, #4CAF50 ${animationProgress * 100}%, #cccccc ${animationProgress * 100}%)`
                                : undefined,
                        }}
                    >
                        <div className="flex items-center justify-center">
                            {false // isCalculatingRoute should be defined in your state
                                ? 'Hesaplanıyor...'
                                : animationInProgress
                                    ? `Rota Gösteriliyor (${Math.round(animationProgress * 100)}%)`
                                    : 'Animasyonu Başlat'}
                        </div>
                    </button>
                )}

            </div>
        </div>
    );
}