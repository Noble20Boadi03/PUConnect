import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { ActionModal } from '@/components/ui/action-modal';
import { IconName } from '@/components/ui/themed-icon';

type ActionIconMap = {
    [key in 'success' | 'error' | 'warning' | 'info']: IconName;
}

const severityToIcon: ActionIconMap = {
    success: 'check-circle-outline',
    error: 'alert-circle-outline',
    warning: 'alert-outline',
    info: 'information-outline',
};

export type AlertOptions = {
    title: string;
    subtitle?: string;
    iconName?: IconName;
    severity?: 'success' | 'error' | 'warning' | 'info';
    primaryButtonTitle?: string;
    onPrimaryPress?: () => void;
    secondaryButtonTitle?: string;
    onSecondaryPress?: () => void;
};

type AlertContextType = {
    showAlert: (options: AlertOptions) => void;
    hideAlert: () => void;
};

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AppAlertProvider({ children }: { children: ReactNode }) {
    const [isVisible, setIsVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState<AlertOptions | null>(null);

    const showAlert = useCallback((options: AlertOptions) => {
        setAlertConfig(options);
        setIsVisible(true);
    }, []);

    const hideAlert = useCallback(() => {
        setIsVisible(false);
        // Wait slightly for exit animation before clearing config safely
        setTimeout(() => setAlertConfig(null), 400);
    }, []);

    const handlePrimaryClick = () => {
        if (alertConfig?.onPrimaryPress) {
            alertConfig.onPrimaryPress();
        }
        hideAlert();
    };

    const handleSecondaryClick = () => {
        if (alertConfig?.onSecondaryPress) {
            alertConfig.onSecondaryPress();
        }
        hideAlert();
    };

    const determineIcon = (config: AlertOptions | null) => {
        if (!config) return undefined;
        if (config.iconName) return config.iconName;
        if (config.severity) return severityToIcon[config.severity];
        return 'alert-circle-outline'; // safe fallback
    };

    return (
        <AlertContext.Provider value={{ showAlert, hideAlert }}>
            {children}
            {alertConfig && (
                <ActionModal
                    visible={isVisible}
                    onRequestClose={hideAlert}
                    title={alertConfig.title}
                    subtitle={alertConfig.subtitle}
                    iconName={determineIcon(alertConfig)}
                    primaryButtonTitle={alertConfig.primaryButtonTitle || "OK"}
                    onPrimaryPress={handlePrimaryClick}
                    secondaryButtonTitle={alertConfig.secondaryButtonTitle}
                    onSecondaryPress={alertConfig.secondaryButtonTitle ? handleSecondaryClick : undefined}
                />
            )}
        </AlertContext.Provider>
    );
}

export const useAppAlert = () => {
    const context = useContext(AlertContext);
    if (context === undefined) {
        throw new Error("useAppAlert must be used within an AppAlertProvider");
    }
    return context;
};
