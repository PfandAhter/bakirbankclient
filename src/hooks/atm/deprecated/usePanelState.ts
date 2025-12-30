import { useState } from "react";

export const usePanelState = (setIsControlPaneDisabled: (val: boolean) => void) => {
    const [isSendMoneyPanelOpen, setIsSendMoneyPanelOpen] = useState(false);
    const [isQrCodePanelOpen, setIsQrCodePanelOpen] = useState(false);
    const [directionsPanelVisible, setDirectionsPanelVisible] = useState(false);

    const toggleSendMoneyPanel = () => {
        setIsSendMoneyPanelOpen(prev => !prev);
        setIsControlPaneDisabled(false);
    };

    const toggleQrCodePanel = () => {
        setIsQrCodePanelOpen(prev => !prev);
        setIsControlPaneDisabled(false);
    };

    return {
        isSendMoneyPanelOpen,
        isQrCodePanelOpen,
        directionsPanelVisible,
        setDirectionsPanelVisible,
        toggleSendMoneyPanel,
        toggleQrCodePanel
    };
};