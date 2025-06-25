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

import { AppProvider, useAppContext } from '../contexts/AppContext.tsx';
import { MainLayout } from '../components/layout/MainLayout.tsx';
import { PageModule } from '../types.ts';
import { LoadingSpinner } from '../components/shared/LoadingSpinner.tsx';


const allPageModules: PageModule[] = [
  { id: 'benvenuto', name: 'Benvenuto!', component: HomePage }, // Renamed
  { id: 'dataEntry', name: 'Dati Costituzione Fondo', component: DataEntryPage },
  { id: 'fondoAccessorioDipendente', name: 'Fondo Accessorio Personale', component: FondoAccessorioDipendentePage },
  { id: 'fondoElevateQualificazioni', name: 'Fondo Elevate Qualificazioni', component: FondoElevateQualificazioniPage },
  { id: 'fondoSegretarioComunale', name: 'Risorse Segretario Comunale', component: FondoSegretarioComunalePage },
  { id: 'fondoDirigenza', name: 'Fondo Dirigenza', component: FondoDirigenzaPage }, 
  { id: 'fundDetails', name: 'Dettaglio Fondo Calcolato', component: FundDetailsPage },
  { id: 'compliance', name: 'Conformità', component: CompliancePage },
  { id: 'reports', name: 'Report', component: ReportsPage },
]; // Icons removed

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
      dispatch({ type: 'SET_ACTIVE_TAB', payload: 'benvenuto' });
    }
  }, [hasDirigenza, state.activeTab, dispatch]);

  let activeModule = visiblePageModules.find(mod => mod.id === state.activeTab);
  
  if (!activeModule) {
    // Fallback to 'benvenuto' if current activeTab is not in visible modules
    // or if initial activeTab was somehow invalid.
    activeModule = visiblePageModules.find(mod => mod.id === 'benvenuto') || visiblePageModules[0];
    if (activeModule && state.activeTab !== activeModule.id) {
       // Use Promise.resolve().then() to schedule the dispatch after the current render cycle
       // to avoid triggering a new render within a render.
       Promise.resolve().then(() => { 
           dispatch({ type: 'SET_ACTIVE_TAB', payload: activeModule!.id });
       });
    }
  }
  
  const ActiveComponent = activeModule ? activeModule.component : null;

  if (!ActiveComponent) {
    // This fallback UI will be rendered if ActiveComponent is null or undefined,
    // which can happen if a page module (e.g., HomePage) failed to import correctly.
    console.error("Error: ActiveComponent is not defined. This might be due to a failed page import. Active Tab:", state.activeTab, "Resolved Module:", activeModule);
    return (
      <MainLayout modules={visiblePageModules}>
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold text-[#ea2832] mb-4">Errore Caricamento Applicazione</h1>
          <p className="text-lg text-[#1b0e0e] mb-2">Impossibile caricare la sezione richiesta: <strong className="text-[#ea2832]">{state.activeTab}</strong>.</p>
          <p className="text-sm text-[#5f5252]">
            Questo problema può essere causato da un errore nell'importazione di un modulo della pagina o una sua dipendenza. 
            Controllare la console del browser (Tasto F12 o Ispeziona Elemento -&gt; Console) per ulteriori dettagli specifici sull'errore.
            Potrebbe essere necessario correggere le estensioni dei file negli import (es. usare .tsx o .ts invece di .js) all'interno del modulo problematico.
          </p>
          {activeModule && <p className="text-sm text-[#5f5252] mt-2">Modulo attivo tentato: {activeModule.name} (ID: {activeModule.id})</p>}
          {!activeModule && <p className="text-sm text-[#5f5252] mt-2">Nessun modulo attivo risolto per la tab: {state.activeTab}</p>}
           <button 
            onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'benvenuto' })}
            className="mt-6 px-4 py-2 bg-[#ea2832] text-white rounded-md hover:bg-[#c02128] transition-colors"
          >
            Torna alla Dashboard
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout modules={visiblePageModules}>
      {/* Conditionally render loading spinner only for initial load or specific global loading states */}
      {state.isLoading && (!state.calculatedFund || !activeModule) && state.activeTab === 'benvenuto' ? ( 
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