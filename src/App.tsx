// src/App.tsx
import React, { useEffect } from 'react';

// Importazioni aggiornate per puntare alle directory corrette e con estensione corretta
import { HomePage } from '@/pages/HomePage';
import { DataEntryPage } from '@/pages/DataEntryPage';
import { FundDetailsPage } from '@/pages/FundDetailsPage';
import { CompliancePage } from '@/pages/CompliancePage';
import { ReportsPage } from '@/pages/ReportsPage';
import { FondoAccessorioDipendentePage } from '@/pages/FondoAccessorioDipendentePage';
import { FondoElevateQualificazioniPage } from '@/pages/FondoElevateQualificazioniPage';
import { FondoSegretarioComunalePage } from '@/pages/FondoSegretarioComunalePage';
import { FondoDirigenzaPage } from '@/pages/FondoDirigenzaPage';
import { ChecklistPage } from '@/pages/ChecklistPage';
import { PersonaleServizioPage } from '@/pages/PersonaleServizioPage';
import { DistribuzioneRisorsePage } from '@/pages/DistribuzioneRisorsePage';

import { AppProvider, useAppContext } from '@/contexts/AppContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageModule } from '@/types';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';


const allPageModules: PageModule[] = [
  { id: 'benvenuto', name: 'Benvenuto!', component: HomePage }, 
  { id: 'dataEntry', name: 'Dati Costituzione Fondo', component: DataEntryPage },
  { id: 'fondoAccessorioDipendente', name: 'Fondo Accessorio Personale', component: FondoAccessorioDipendentePage },
  { id: 'fondoElevateQualificazioni', name: 'Fondo Elevate Qualificazioni', component: FondoElevateQualificazioniPage },
  { id: 'fondoSegretarioComunale', name: 'Risorse Segretario Comunale', component: FondoSegretarioComunalePage },
  { id: 'fondoDirigenza', name: 'Fondo Dirigenza', component: FondoDirigenzaPage },
  { id: 'personaleServizio', name: 'Personale in servizio', component: PersonaleServizioPage },
  { id: 'distribuzioneRisorse', name: 'Distribuzione Risorse', component: DistribuzioneRisorsePage }, // NUOVA PAGINA
  { id: 'fundDetails', name: 'Dettaglio Fondo Calcolato', component: FundDetailsPage },
  { id: 'compliance', name: 'Conformità', component: CompliancePage },
  { id: 'checklist', name: 'Check list Interattiva', component: ChecklistPage },
  { id: 'reports', name: 'Report', component: ReportsPage },
];


const AppContent: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { activeTab, fundData, isLoading } = state;

    useEffect(() => {
        // Logica per caricare i dati all'avvio, se necessario
    }, [dispatch]);
    
    const visibleModules = allPageModules.filter(module => {
        if (module.id === 'fondoDirigenza' && !fundData.annualData.hasDirigenza) {
            return false;
        }
        if (module.id === 'distribuzioneRisorse' && !fundData.annualData.isDistributionMode) {
            return false;
        }
        return true;
    });

    useEffect(() => {
        const activeModuleIsVisible = visibleModules.some(mod => mod.id === activeTab);
        if (!activeModuleIsVisible && activeTab !== 'benvenuto') {
            dispatch({ type: 'SET_ACTIVE_TAB', payload: 'benvenuto' });
        }
    }, [visibleModules, activeTab, dispatch]);

    const ActiveComponent = visibleModules.find(mod => mod.id === activeTab)?.component || HomePage;

    return (
        <MainLayout modules={visibleModules}>
            {isLoading && !state.calculatedFund ? (
                <div className="flex justify-center items-center h-full">
                    <LoadingSpinner text="Caricamento applicazione..." />
                </div>
            ) : (
                <ActiveComponent />
            )}
        </MainLayout>
    );
};


const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
