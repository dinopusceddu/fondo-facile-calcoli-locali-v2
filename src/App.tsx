// src/App.tsx
import React, { useEffect } from 'react';

// Importazioni aggiornate per puntare alle directory corrette e con estensione corretta
import { HomePage } from '../pages/HomePage.tsx';
import { DataEntryPage } from '../pages/DataEntryPage.tsx';
import { FundDetailsPage } from '../pages/FundDetailsPage.tsx';
import { CompliancePage } from '../pages/CompliancePage.tsx';
import { ReportsPage } from '../pages/ReportsPage.tsx';
import { FondoAccessorioDipendentePage } from '../pages/FondoAccessorioDipendentePage.tsx';
import { FondoElevateQualificazioniPage } from '../pages/FondoElevateQualificazioniPage.tsx';
import { FondoSegretarioComunalePage } from '../pages/FondoSegretarioComunalePage.tsx';
import { FondoDirigenzaPage } from '../pages/FondoDirigenzaPage.tsx'; 
import { ChecklistPage } from '../pages/ChecklistPage.tsx'; 
import { PersonaleServizioPage } from '../pages/PersonaleServizioPage.tsx'; // RINOMINATA e NUOVO PATH

import { AppProvider, useAppContext } from '../contexts/AppContext.tsx';
import { MainLayout } from '../components/layout/MainLayout.tsx';
import { PageModule } from '../types.ts';
import { LoadingSpinner } from '../components/shared/LoadingSpinner.tsx';


const allPageModules: PageModule[] = [
  { id: 'benvenuto', name: 'Benvenuto!', component: HomePage }, 
  { id: 'dataEntry', name: 'Dati Costituzione Fondo', component: DataEntryPage },
  { id: 'fondoAccessorioDipendente', name: 'Fondo Accessorio Personale', component: FondoAccessorioDipendentePage },
  { id: 'fondoElevateQualificazioni', name: 'Fondo Elevate Qualificazioni', component: FondoElevateQualificazioniPage },
  { id: 'fondoSegretarioComunale', name: 'Risorse Segretario Comunale', component: FondoSegretarioComunalePage },
  { id: 'fondoDirigenza', name: 'Fondo Dirigenza', component: FondoDirigenzaPage }, 
  { id: 'fundDetails', name: 'Dettaglio Fondo Calcolato', component: FundDetailsPage },
  { id: 'compliance', name: 'Controllo dei limiti', component: CompliancePage },
  { id: 'checklist', name: 'Check list Interattiva', component: ChecklistPage }, 
  { id: 'reports', name: 'Report', component: ReportsPage },
  { id: 'personaleServizio', name: 'Personale in servizio nel Anno Rif.', component: PersonaleServizioPage }, 
]; 

const AppContent: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { hasDirigenza } = state.fundData.annualData;
  const { calculatedFund } = state;

  const visiblePageModules = React.useMemo(() => {
    let modules = [...allPageModules]; // Create a copy to modify
    if (hasDirigenza === false) { // Check explicitly for false, as undefined means not set yet
      modules = modules.filter(mod => mod.id !== 'fondoDirigenza');
    }
    if (!calculatedFund) { // Only show if fund has been calculated
      modules = modules.filter(mod => mod.id !== 'personaleServizio');
    }
    return modules;
  }, [hasDirigenza, calculatedFund]);

  useEffect(() => {
    // If dirigenza is explicitly false and current tab is dirigenza, redirect
    if (hasDirigenza === false && state.activeTab === 'fondoDirigenza') {
      dispatch({ type: 'SET_ACTIVE_TAB', payload: 'benvenuto' });
    }
    // If fund not calculated and current tab is personaleServizio, redirect
    if (!calculatedFund && state.activeTab === 'personaleServizio') {
        dispatch({ type: 'SET_ACTIVE_TAB', payload: 'benvenuto' });
    }
  }, [hasDirigenza, calculatedFund, state.activeTab, dispatch]);

  let activeModule = visiblePageModules.find(mod => mod.id === state.activeTab);
  
  if (!activeModule) {
    // If current activeTab is not in visible modules (e.g. dirigenza was hidden, or personaleServizio hidden)
    // default to benvenuto
    activeModule = visiblePageModules.find(mod => mod.id === 'benvenuto') || visiblePageModules[0];
    if (activeModule && state.activeTab !== activeModule.id) {
       Promise.resolve().then(() => { 
           if (activeModule) { // Ensure activeModule is not undefined after filtering
             dispatch({ type: 'SET_ACTIVE_TAB', payload: activeModule.id });
           }
       });
    }
  }
  
  const ActiveComponent = activeModule ? activeModule.component : null;

  if (!ActiveComponent && visiblePageModules.length > 0) { // Check if visiblePageModules is not empty
    console.error("Error: ActiveComponent is not defined. Active Tab:", state.activeTab, "Resolved Module:", activeModule, "Visible Modules:", visiblePageModules);
    // This state indicates a deeper issue, possibly with module loading or state management.
    // Fallback to a generic error or the first available module.
     const fallbackModule = visiblePageModules[0];
     if(fallbackModule && fallbackModule.id !== state.activeTab) {
        Promise.resolve().then(() => {
            dispatch({type: 'SET_ACTIVE_TAB', payload: fallbackModule.id});
        });
        return <LoadingSpinner text="Reindirizzamento..." />;
     }

    return (
      <MainLayout modules={visiblePageModules}>
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold text-[#ea2832] mb-4">Errore Caricamento Sezione</h1>
          <p className="text-lg text-[#1b0e0e] mb-2">Impossibile caricare la sezione: <strong className="text-[#ea2832]">{state.activeTab}</strong>.</p>
          <p className="text-sm text-[#5f5252]">
            Verifica che la sezione sia accessibile o prova a tornare alla pagina principale.
          </p>
           <button 
            onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'benvenuto' })}
            className="mt-6 px-4 py-2 bg-[#ea2832] text-white rounded-md hover:bg-[#c02128] transition-colors"
          >
            Torna alla Dashboard
          </button>
        </div>
      </MainLayout>
    );
  } else if (!ActiveComponent && visiblePageModules.length === 0) {
     // No modules are visible at all, critical state
     return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#fcf8f8] p-6">
            <h1 className="text-2xl font-bold text-[#ea2832] mb-4">Errore Applicazione</h1>
            <p className="text-lg text-[#1b0e0e] mb-2">Nessuna sezione disponibile per la visualizzazione.</p>
            <p className="text-sm text-[#5f5252]">Controllare la configurazione iniziale o lo stato dei dati.</p>
        </div>
     );
  }


  return (
    <MainLayout modules={visiblePageModules}>
      {state.isLoading && (!state.calculatedFund || !activeModule) && state.activeTab === 'benvenuto' ? ( 
        <LoadingSpinner text="Caricamento applicazione..." />
      ) : (
        ActiveComponent && <ActiveComponent />
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