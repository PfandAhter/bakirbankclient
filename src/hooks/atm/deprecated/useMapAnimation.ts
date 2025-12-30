// hooks/useMapAnimation.ts
import { useRef, useState } from "react";

export const useMapAnimation = () => {
    const [animationInProgress, setAnimationInProgress] = useState(false);
    const [animationProgress, setAnimationProgress] = useState(0);
    const animationRef = useRef(null);
    const lastFrameTimeRef = useRef(0);
    const previousViewStateRef = useRef(null);
    const [viewTPS, setViewTPS] = useState(false);
    const [followingRoute, setFollowingRoute] = useState(false);
    const [showMarkersInTPS, setShowMarkersInTPS] = useState(true);

    return {
        animationInProgress, setAnimationInProgress,
        animationProgress, setAnimationProgress,
        animationRef,
        lastFrameTimeRef,
        previousViewStateRef,
        viewTPS, setViewTPS,
        followingRoute, setFollowingRoute,
        showMarkersInTPS, setShowMarkersInTPS
    };
};
