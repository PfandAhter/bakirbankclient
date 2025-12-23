"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";
import { useRef, useState, useEffect, useMemo } from "react";

export default function MapLoadingScreen() {
    const loadingTexts = [
        "Veriler alınıyor...",
        "Koordinatlar hesaplanıyor...",
        "ATM'ler yerleştiriliyor...",
        "Harita yükleniyor...",
    ];

    const [currentText, setCurrentText] = useState(0);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const textInterval = setInterval(() => {
            setCurrentText((prev) => (prev < loadingTexts.length - 1 ? prev + 1 : prev));
        }, 700);

        /*const progressInterval = setInterval(() => {
            setProgress((prev) => (prev < 100 ? prev + (100 / 30) : 100));
        }, 100);*/

        const progressInterval = setInterval(() => {
            setProgress((prev) => (prev < 100 ? prev + 1 : 100));
        }, 25);

        return () => {
            clearInterval(textInterval);
            clearInterval(progressInterval);
        };
    }, []);

    return (
        <div className="w-screen h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-black flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-10">
                <div className="w-full h-full" style={{
                    backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `,
                    backgroundSize: '50px 50px'
                }} />
            </div>

            <div className="flex-1 w-full">
                <Canvas camera={{ position: [0, 0, 4], fov: 60 }}>
                    <ambientLight intensity={0.3} />
                    <directionalLight position={[10, 10, 5]} intensity={0.5} />
                    <pointLight position={[-10, -10, -5]} intensity={0.3} color="#00ffff" />

                    <NetworkEarth />
                    <FloatingParticles />
                    <DataOrbitRings />
                    <ConnectionLines />
                    <Stars radius={300} depth={50} count={8000} factor={4} saturation={0} fade speed={0.5} />
                </Canvas>
            </div>

            {/* Loading Interface */}
            <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-96">
                {/* Progress Bar */}
                <div className="mb-6">
                    <div className="w-full bg-slate-800/50 rounded-full h-2 backdrop-blur-sm border border-cyan-500/20">
                        <div
                            className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-300 shadow-lg shadow-cyan-400/20"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-cyan-300">
                        <span>0%</span>
                        <span className="font-mono">{progress}%</span>
                        <span>100%</span>
                    </div>
                </div>

                {/* Loading Text */}
                <div className="text-center">
                    <div className="relative h-8 flex items-center justify-center">
                        <p className="text-cyan-400 text-lg font-mono tracking-wider relative">
              <span className="relative z-10 drop-shadow-lg">
                {loadingTexts[currentText]}
              </span>
                            <span className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent blur-sm" />
                        </p>
                    </div>

                    {/* Status Indicators */}
                    <div className="flex justify-center space-x-4 mt-4">
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className={`w-2 h-2 rounded-full transition-all duration-500 ${
                                    i <= Math.floor(currentText / 2)
                                        ? 'bg-green-400 shadow-lg shadow-green-400/50'
                                        : 'bg-slate-600'
                                }`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Corner Info */}
            <div className="absolute top-6 left-6 text-cyan-400/60 font-mono text-sm">
                <div>SYS_STATUS: LOADING</div>
                <div>NET_CONN: ACTIVE</div>
                <div>DATA_SYNC: {progress}%</div>
            </div>
        </div>
    );
}

function NetworkEarth() {
    const earthRef = useRef<THREE.Group>(null);
    const wireframeRef = useRef<THREE.Mesh>(null);

    useFrame(() => { //State kaldirdim burada
        if (earthRef.current) {
            earthRef.current.rotation.y += 0.005;
        }
        if (wireframeRef.current) {
            wireframeRef.current.rotation.y += 0.003;
        }
    });

    return (
        <group ref={earthRef}>
            {/* Ana dünya küresi */}
            <mesh>
                <sphereGeometry args={[1.5, 64, 64]} />
                <meshPhongMaterial
                    color="#0a1a2a"
                    emissive="#001122"
                    emissiveIntensity={0.3}
                    shininess={100}
                    transparent
                    opacity={0.9}
                />
            </mesh>

            {/* Wireframe overlay */}
            <mesh ref={wireframeRef}>
                <sphereGeometry args={[1.51, 32, 32]} />
                <meshBasicMaterial
                    color="#00aaff"
                    wireframe
                    transparent
                    opacity={0.4}
                />
            </mesh>

            {/* Kıta hatları için parçacıklar */}
            <ContinentOutlines />
            <GlowingSphere />
        </group>
    );
}

function ContinentOutlines() {
    const pointsRef = useRef<THREE.Points>(null);

    const points = useMemo(() => {
        const vertices = [];
        const colors = [];

        const continents = [
            { lat: 45, lng: -100, size: 20 },
            { lat: -15, lng: -60, size: 15 },
            { lat: 50, lng: 10, size: 12 },
            { lat: 0, lng: 20, size: 18 },
            { lat: 30, lng: 100, size: 25 },
            { lat: -25, lng: 140, size: 8 },
        ];

        continents.forEach(continent => {
            for (let i = 0; i < continent.size; i++) {
                const phi = (90 - continent.lat + (Math.random() - 0.5) * 20) * (Math.PI / 180);
                const theta = (continent.lng + (Math.random() - 0.5) * 30) * (Math.PI / 180);

                const x = 1.52 * Math.sin(phi) * Math.cos(theta);
                const y = 1.52 * Math.cos(phi);
                const z = 1.52 * Math.sin(phi) * Math.sin(theta);

                vertices.push(x, y, z);
                colors.push(0.2, 1, 1); // Daha parlak mavi-turkuaz
            }
        });

        return { vertices: new Float32Array(vertices), colors: new Float32Array(colors) };
    }, []);

    useFrame((state) => {
        if (pointsRef.current) {
            const time = state.clock.elapsedTime;
            pointsRef.current.material.size = 0.03 + Math.sin(time * 2) * 0.015; // Daha büyük
        }
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={points.vertices.length / 3}
                    array={points.vertices}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={points.colors.length / 3}
                    array={points.colors}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.03} // Daha belirgin
                vertexColors
                transparent
                opacity={1} // Tam görünür
                sizeAttenuation
            />
        </points>
    );
}

function GlowingSphere() {
    const glowRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (glowRef.current) {
            const time = state.clock.elapsedTime;
            glowRef.current.material.opacity = 0.1 + Math.sin(time * 2) * 0.05;
        }
    });

    return (
        <mesh ref={glowRef}>
            <sphereGeometry args={[1.6, 32, 32]} />
            <meshBasicMaterial
                color="#00aaff"
                transparent
                opacity={0.1}
                side={THREE.BackSide}
            />
        </mesh>
    );
}

function FloatingParticles() {
    const particlesRef = useRef<THREE.Points>(null);

    const particles = useMemo(() => {
        const vertices = [];
        const colors = [];

        for (let i = 0; i < 1000; i++) {
            const radius = 2 + Math.random() * 3;
            const phi = Math.random() * Math.PI * 2;
            const theta = Math.random() * Math.PI;

            const x = radius * Math.sin(theta) * Math.cos(phi);
            const y = radius * Math.sin(theta) * Math.sin(phi);
            const z = radius * Math.cos(theta);

            vertices.push(x, y, z);

            const intensity = Math.random();
            colors.push(intensity, intensity * 0.8, 1);
        }

        return { vertices: new Float32Array(vertices), colors: new Float32Array(colors) };
    }, []);

    useFrame((state) => {
        if (particlesRef.current) {
            particlesRef.current.rotation.y += 0.001;
            particlesRef.current.rotation.x += 0.0005;
        }
    });

    return (
        <points ref={particlesRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={particles.vertices.length / 3}
                    array={particles.vertices}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={particles.colors.length / 3}
                    array={particles.colors}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.005}
                vertexColors
                transparent
                opacity={0.6}
                sizeAttenuation
            />
        </points>
    );
}

function DataOrbitRings() {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y += 0.01;
            groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
        }
    });

    return (
        <group ref={groupRef}>
            {[1.8, 2.1, 2.4].map((radius, i) => ( // Dünya'ya daha yakın
                <group key={i} rotation={[Math.PI / 4 * i, 0, Math.PI / 6 * i]}>
                    <mesh>
                        <torusGeometry args={[radius, 0.008, 8, 64]} />
                        <meshBasicMaterial
                            color={i === 0 ? "#00ffff" : i === 1 ? "#0080ff" : "#ff8000"}
                            transparent
                            opacity={0.6}
                        />
                    </mesh>
                    <RingParticles radius={radius} color={i === 0 ? "#00ffff" : i === 1 ? "#0080ff" : "#ff8000"} />
                </group>
            ))}
        </group>
    );
}

function RingParticles({ radius, color }: { radius: number; color: string }) {
    const particlesRef = useRef<THREE.Points>(null);

    const ringParticles = useMemo(() => {
        const vertices = [];
        const colors = [];
        const colorObj = new THREE.Color(color);

        for (let i = 0; i < 50; i++) {
            const angle = (i / 50) * Math.PI * 2;
            const x = radius * Math.cos(angle) + (Math.random() - 0.5) * 0.1;
            const y = (Math.random() - 0.5) * 0.1;
            const z = radius * Math.sin(angle) + (Math.random() - 0.5) * 0.1;

            vertices.push(x, y, z);
            colors.push(colorObj.r, colorObj.g, colorObj.b);
        }

        return { vertices: new Float32Array(vertices), colors: new Float32Array(colors) };
    }, [radius, color]);

    useFrame((state) => {
        if (particlesRef.current) {
            particlesRef.current.rotation.y += 0.02;
        }
    });

    return (
        <points ref={particlesRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={ringParticles.vertices.length / 3}
                    array={ringParticles.vertices}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={ringParticles.colors.length / 3}
                    array={ringParticles.colors}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.01}
                vertexColors
                transparent
                opacity={0.8}
                sizeAttenuation
            />
        </points>
    );
}

function ConnectionLines() {
    const linesRef = useRef<THREE.LineSegments>(null);

    const lines = useMemo(() => {
        const vertices = [];
        const colors = [];

        // Şehirler arası bağlantı çizgileri simülasyonu
        const cities = [
            [1.52, 0.5, 0.8],   // New York
            [1.52, 0.8, -0.2],  // London
            [1.52, 0.3, 1.2],   // Tokyo
            [1.52, -0.6, 0.9],  // Sydney
            [1.52, -0.2, -1.1], // Rio
            [1.52, 0.1, 0.7],   // Dubai
        ];

        for (let i = 0; i < cities.length; i++) {
            for (let j = i + 1; j < cities.length; j++) {
                if (Math.random() > 0.7) { // Sadece bazı bağlantıları göster
                    vertices.push(...cities[i], ...cities[j]);
                    colors.push(0, 1, 1, 1, 0, 1, 1, 1); // Cyan
                }
            }
        }

        return { vertices: new Float32Array(vertices), colors: new Float32Array(colors) };
    }, []);

    useFrame((state) => {
        if (linesRef.current) {
            const time = state.clock.elapsedTime;
            linesRef.current.material.opacity = 0.3 + Math.sin(time * 3) * 0.2;
        }
    });

    return (
        <lineSegments ref={linesRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={lines.vertices.length / 3}
                    array={lines.vertices}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={lines.colors.length / 4}
                    array={lines.colors}
                    itemSize={4}
                />
            </bufferGeometry>
            <lineBasicMaterial
                vertexColors
                transparent
                opacity={0.4}
                linewidth={1}
            />
        </lineSegments>
    );
}