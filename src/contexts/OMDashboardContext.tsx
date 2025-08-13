'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type Scenario = 'base' | 'upside' | 'downside';

interface OMDashboardContextType {
    scenario: Scenario;
    setScenario: (scenario: Scenario) => void;
}

const OMDashboardContext = createContext<OMDashboardContextType | undefined>(undefined);

interface OMDashboardProviderProps {
    children: ReactNode;
}

export const OMDashboardProvider: React.FC<OMDashboardProviderProps> = ({ children }) => {
    const [scenario, setScenario] = useState<Scenario>('base');

    return (
        <OMDashboardContext.Provider value={{ scenario, setScenario }}>
            {children}
        </OMDashboardContext.Provider>
    );
};

export const useOMDashboard = (): OMDashboardContextType => {
    const context = useContext(OMDashboardContext);
    if (context === undefined) {
        throw new Error('useOMDashboard must be used within an OMDashboardProvider');
    }
    return context;
}; 