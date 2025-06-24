// src/App.tsx
import React, { useEffect } from 'react';

// Importazioni aggiornate per puntare alle directory corrette
import { HomePage } from '../pages/HomePage.js';
import { DataEntryPage } from '../pages/DataEntryPage.js';
import { FundDetailsPage } from '../pages/FundDetailsPage.js';
import { CompliancePage } from '../pages/CompliancePage.js';
import { ReportsPage } from '../pages/ReportsPage.js';
import { FondoAccessorioDipendentePage } from '../pages/FondoAccessorioDipendentePage.js';
import { FondoElevateQualificazioniPage } from '../pages/FondoElevateQualificazioniPage.js';
import { FondoSegretarioComunalePage } from '../pages/FondoSegretarioComunalePage.js';
import { FondoDirigenzaPage } from '../pages/FondoDirigenzaPage.js'; 

import { AppProvider, useAppContext } from '../contexts/AppContext.js';
import { MainLayout } from '../components/layout/MainLayout.js';
import { PageModule } from '../types.js';
import { LoadingSpinner } from '../components/shared/LoadingSpinner.js';


const allPageModules: PageModule[] = [
  { id: 'dashboard', name: 'Dashboard', icon: '📊', component: HomePage },
  { id: 'dataEntry', name: 'Dati Costituzione Fondo', icon: '📝', component: DataEntryPage },
  { id: 'fondoAccessorioDipendente', name: 'Fondo Accessorio Personale', icon: '💸', component: FondoAccessorioDipendentePage },
  { id: 'fondoElevateQualificazioni', name: 'Fondo Elevate Qualificazioni', icon: '🌟', component: FondoElevateQualificazioniPage },
  { id: 'fondoSegretarioComunale', name: 'Risorse Segretario Comunale', icon: '🧑‍💼', component: FondoSegretarioComunalePage },
  { id: 'fondoDirigenza', name: 'Fondo Dirigenza', icon: '👔', component: FondoDirigenzaPage }, 
  { id: 'fundDetails', name: 'Dettaglio Fondo Calcolato', icon: '🔍', component: FundDetailsPage },
  { id: 'compliance', name: 'Conformità', icon: '⚖️', component: CompliancePage },
  { id: 'reports', name: 'Report', icon: '📄', component: ReportsPage },
];

const AppContent: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const hasDirigenza = state.fundData.annualData.hasDirigenza;

  const visiblePageModules = React.useMemo(() => {
    if (hasDirigenza === true) {
      return allPageModules;
    }
    return allPageModules.filter(mod => mod.id !== 'fondoDirigenza');
  }, [hasDirigenza]);

  useEffect(() => {
    if (hasDirigenza === false && state.activeTab === 'fondoDirigenza') {
      dispatch({ type: 'SET_ACTIVE_TAB', payload: 'dashboard' });
    }
  }, [hasDirigenza, state.activeTab, dispatch]);

  let activeModule = visiblePageModules.find(mod => mod.id === state.activeTab);
  
  if (!activeModule) {
    // If current activeTab is not in visiblePageModules (e.g. dirigenza was hidden), default to dashboard
    activeModule = visiblePageModules.find(mod => mod.id === 'dashboard') || visiblePageModules[0];
     // Dispatch to update activeTab in state if it was changed due to visibility
    if (activeModule && state.activeTab !== activeModule.id) {
       // Dispatching inside useEffect or after a render cycle is safer,
       // but for this specific case of immediate redirection/correction:
       Promise.resolve().then(() => { // Dispatch in a microtask
           dispatch({ type: 'SET_ACTIVE_TAB', payload: activeModule!.id });
       });
    }
  }
  
  const ActiveComponent = activeModule.component;

  return (
    <MainLayout modules={visiblePageModules}>
      {state.isLoading && !state.calculatedFund && state.activeTab === 'dashboard' ? ( 
        <LoadingSpinner text="Caricamento applicazione..." />
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
