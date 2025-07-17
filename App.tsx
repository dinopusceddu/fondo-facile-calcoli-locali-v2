
// src/App.tsx
import React, { useEffect } from 'react';

// Importazioni aggiornate per puntare alle directory corrette e con estensione corretta
import { HomePage } from './pages/HomePage.js';
import { DataEntryPage } from './pages/DataEntryPage.js';
import { FundDetailsPage } from './pages/FundDetailsPage.js';
import { CompliancePage } from './pages/CompliancePage.js';
import { ReportsPage } from './pages/ReportsPage.js';
import { FondoAccessorioDipendentePage } from './pages/FondoAccessorioDipendentePage.js';
import { FondoElevateQualificazioniPage } from './pages/FondoElevateQualificazioniPage.js';
import { FondoSegretarioComunalePage } from './pages/FondoSegretarioComunalePage.js';
import { FondoDirigenzaPage } from './pages/FondoDirigenzaPage.js'; 
import { ChecklistPage } from './pages/ChecklistPage.js'; 
import { PersonaleServizioPage } from './pages/PersonaleServizioPage.js';
import { DistribuzioneRisorsePage } from './pages/DistribuzioneRisorsePage.js'; // NUOVA PAGINA

import { AppProvider, useAppContext } from './contexts/AppContext.js';
import { MainLayout } from './components/layout/MainLayout.js';
import { PageModule } from './types.js';
import { LoadingSpinner } from './components/shared/LoadingSpinner.js';


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